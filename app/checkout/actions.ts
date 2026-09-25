"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

interface CartItemInput {
  id: string
  quantity: number
}

interface CreateOrderInput {
  checkoutId?: string
  customerName: string
  customerPhone: string
  paymentMethod: "online" | "whatsapp"
  items: CartItemInput[]
}

/**
 * Registra una solicitud de cotización de combo en Supabase.
 * Desacoplado del inventario rígido para adaptarse al modelo de cuentas compartidas
 * y catálogo de referencia de MrGames con cierre y confirmación asistida en WhatsApp.
 */
export async function createOrder(input: CreateOrderInput) {
  if (!input.customerName || !input.customerName.trim()) {
    throw new Error("El nombre es obligatorio")
  }
  if (!input.customerPhone || !input.customerPhone.trim()) {
    throw new Error("El teléfono es obligatorio")
  }
  if (!input.items || !input.items.length) {
    throw new Error("El combo de juegos está vacío")
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Cantidad inválida para los juegos seleccionados")
    }
  }

  const admin = createAdminClient()

  // 1. Idempotencia: Si ya existe un registro con este checkoutId, retornarlo directamente
  if (input.checkoutId) {
    try {
      const { data: existingOrder, error: checkError } = await admin
        .from("orders")
        .select("id, total, order_items(product_id, quantity, unit_price, products(name))")
        .eq("checkout_id", input.checkoutId)
        .maybeSingle()

      if (!checkError && existingOrder) {
        const items = (
          existingOrder.order_items as unknown as Array<{
            product_id: string
            quantity: number
            unit_price: number
            products: { name: string } | null
          }>
        ).map((oi) => ({
          product_id: oi.product_id,
          name: oi.products?.name ?? "Juego",
          quantity: oi.quantity,
          unit_price: Number(oi.unit_price),
        }))

        return {
          orderId: existingOrder.id as string,
          total: Number(existingOrder.total),
          items,
        }
      }
    } catch {
      // Ignorar si la columna checkout_id aún no existe en Supabase
    }
  }

  // 2. Obtener nombres y precios reales de referencia desde la base de datos
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const ids = input.items.map((i) => i.id)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price")
    .in("id", ids)

  if (productsError || !products || products.length === 0) {
    throw new Error("No se pudieron validar los juegos seleccionados en el catálogo")
  }

  let total = 0
  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.id)
    if (!product) throw new Error(`Juego no encontrado en el catálogo: ${item.id}`)
    const unitPrice = Number(product.price) || 0
    total += unitPrice * item.quantity
    return {
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      name: product.name,
    }
  })

  // 3. Registrar la solicitud en orders (compatible con o sin columna checkout_id en Supabase)
  const baseOrderPayload = {
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    payment_method: input.paymentMethod,
    status: "coordinated",
    total,
  }

  let order: { id: string } | null = null
  let orderError: { message: string; code?: string } | null = null

  if (input.checkoutId) {
    const res = await admin
      .from("orders")
      .insert({ ...baseOrderPayload, checkout_id: input.checkoutId })
      .select("id")
      .single()

    // Si la columna checkout_id no existe en Supabase (error PGRST204), reintentar sin ella
    if (res.error && (res.error.code === "PGRST204" || res.error.message.includes("checkout_id"))) {
      const fallbackRes = await admin
        .from("orders")
        .insert(baseOrderPayload)
        .select("id")
        .single()
      order = fallbackRes.data
      orderError = fallbackRes.error
    } else {
      order = res.data
      orderError = res.error
    }
  } else {
    const res = await admin
      .from("orders")
      .insert(baseOrderPayload)
      .select("id")
      .single()
    order = res.data
    orderError = res.error
  }

  if (orderError || !order) {
    console.error("Error al registrar solicitud en Supabase:", orderError)
    throw new Error(orderError?.message || "No se pudo registrar la solicitud de cotización")
  }

  // 4. Guardar los items asociados a la solicitud
  const { error: itemsError } = await admin.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  if (itemsError) {
    console.error("Error al guardar items:", itemsError)
    throw new Error("No se pudo registrar el detalle de los juegos")
  }

  return { orderId: order.id as string, total, items: orderItems }
}
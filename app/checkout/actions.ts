"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

interface CartItemInput {
  id: string
  quantity: number
}

interface CreateOrderInput {
  customerName: string
  customerPhone: string
  paymentMethod: "online" | "whatsapp"
  items: CartItemInput[]
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error("El carrito está vacío")
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Cantidad inválida para el producto ${item.id}`)
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const ids = input.items.map((i) => i.id)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .in("id", ids)

  if (productsError || !products || products.length === 0) {
    throw new Error("No se pudieron validar los productos")
  }

  let total = 0
  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.id)
    if (!product) throw new Error(`Producto no encontrado: ${item.id}`)
    if (product.stock < item.quantity) {
      throw new Error(`Sin stock suficiente: ${product.name}`)
    }
    total += product.price * item.quantity
    return {
      product_id: product.id,
      quantity: item.quantity,
      unit_price: product.price,
      name: product.name,
    }
  })

  const admin = createAdminClient()

  // Descuenta stock de forma atómica, uno por uno.
  // Si alguno falla (ya no había stock), revierte los ya descontados.
  const decremented: { id: string; quantity: number }[] = []

  for (const item of orderItems) {
    const { data: ok, error: rpcError } = await admin.rpc("decrement_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (rpcError || !ok) {
      for (const d of decremented) {
        await admin.rpc("decrement_stock", {
          p_product_id: d.id,
          p_quantity: -d.quantity,
        })
      }
      throw new Error(`Sin stock suficiente: ${item.name}`)
    }

    decremented.push({ id: item.product_id, quantity: item.quantity })
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      payment_method: input.paymentMethod,
      status: input.paymentMethod === "whatsapp" ? "coordinated" : "pending",
      total,
    })
    .select()
    .single()

  if (orderError || !order) throw new Error("No se pudo crear el pedido")

  const { error: itemsError } = await admin.from("order_items").insert(
    orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  if (itemsError) throw new Error("No se pudo guardar el detalle del pedido")

  return { orderId: order.id, total, items: orderItems }
}
export const MAX_ITEMS = 20
export const MAX_CANTIDAD = 10

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/
const PHONE_NORMALIZED_REGEX = /^\+?\d{7,15}$/

export interface ItemPedido {
  id: string
  quantity: number
}

export interface PedidoValido {
  checkoutId?: string
  customerName: string
  customerPhone: string
  paymentMethod: "online" | "whatsapp"
  items: ItemPedido[]
}

export type ResultadoValidacion =
  | { ok: true; valor: PedidoValido }
  | { ok: false; error: string }

export function validarPedido(entrada: unknown): ResultadoValidacion {
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
    return { ok: false, error: "El pedido debe ser un objeto válido" }
  }

  const raw = entrada as Record<string, unknown>

  // Criterio 8: checkoutId (si viene, debe ser UUID; ausente/undefined es válido)
  if (raw.checkoutId !== undefined) {
    if (typeof raw.checkoutId !== "string" || !UUID_REGEX.test(raw.checkoutId)) {
      return { ok: false, error: "El checkoutId debe ser un UUID válido" }
    }
  }

  // Criterio 3: customerName (string de 2 a 80 caracteres tras trim, sin caracteres de control)
  if (typeof raw.customerName !== "string") {
    return { ok: false, error: "El nombre debe ser una cadena de texto" }
  }
  if (CONTROL_CHARS_REGEX.test(raw.customerName)) {
    return { ok: false, error: "El nombre contiene caracteres de control no permitidos" }
  }
  const customerName = raw.customerName.trim()
  if (customerName.length < 2 || customerName.length > 80) {
    return { ok: false, error: "El nombre debe tener entre 2 y 80 caracteres" }
  }

  // Criterio 4: customerPhone (normalizado sin espacios, guiones ni paréntesis; + opcional y 7-15 dígitos)
  if (typeof raw.customerPhone !== "string") {
    return { ok: false, error: "El teléfono debe ser una cadena de texto" }
  }
  const customerPhone = raw.customerPhone.replace(/[\s\-()]/g, "")
  if (!PHONE_NORMALIZED_REGEX.test(customerPhone)) {
    return { ok: false, error: "El teléfono debe contener entre 7 y 15 dígitos válidos" }
  }

  // Criterio 5: paymentMethod ("online" | "whatsapp")
  if (raw.paymentMethod !== "online" && raw.paymentMethod !== "whatsapp") {
    return { ok: false, error: "El método de pago debe ser 'online' o 'whatsapp'" }
  }

  // Criterio 6 y 7: items (1 a MAX_ITEMS elementos tras fusionar repetidos)
  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    return { ok: false, error: "El pedido debe contener al menos un producto" }
  }

  const itemsMap = new Map<string, number>()

  for (const item of raw.items) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return { ok: false, error: "Cada producto debe ser un objeto válido" }
    }

    const itemRecord = item as Record<string, unknown>

    if (typeof itemRecord.id !== "string") {
      return { ok: false, error: "El identificador del producto debe ser una cadena de texto" }
    }
    const id = itemRecord.id.trim()
    if (id.length === 0 || id.length > 64) {
      return { ok: false, error: "El identificador del producto debe tener entre 1 y 64 caracteres" }
    }

    const quantity = itemRecord.quantity
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_CANTIDAD
    ) {
      return { ok: false, error: `La cantidad de cada producto debe ser un entero entre 1 y ${MAX_CANTIDAD}` }
    }

    const currentQty = itemsMap.get(id) ?? 0
    const nextQty = currentQty + quantity
    if (nextQty > MAX_CANTIDAD) {
      return {
        ok: false,
        error: `La cantidad total del producto excede el máximo permitido de ${MAX_CANTIDAD}`,
      }
    }
    itemsMap.set(id, nextQty)
  }

  if (itemsMap.size < 1 || itemsMap.size > MAX_ITEMS) {
    return { ok: false, error: `El pedido debe contener entre 1 y ${MAX_ITEMS} productos distintos` }
  }

  const items: ItemPedido[] = Array.from(itemsMap.entries()).map(([id, quantity]) => ({
    id,
    quantity,
  }))

  // Criterio 9: valor contiene solo las claves conocidas
  const valor: PedidoValido = {
    customerName,
    customerPhone,
    paymentMethod: raw.paymentMethod,
    items,
  }

  if (raw.checkoutId !== undefined) {
    valor.checkoutId = raw.checkoutId
  }

  return { ok: true, valor }
}

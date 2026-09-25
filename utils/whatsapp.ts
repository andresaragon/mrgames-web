export const WHATSAPP_NUMBER = "573175942917"

/**
 * Genera el enlace de WhatsApp para consultar la disponibilidad y precio
 * de un juego individual directamente desde el catálogo o ficha de producto.
 */
export function getGameInquiryUrl(gameName: string, platform?: string | null): string {
  const platText = platform ? ` para ${platform}` : ""
  const message = `¡Hola MrGames! Me interesa el juego ${gameName}${platText}. ¿Está disponible hoy y qué precio/modalidad tiene?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Genera el enlace de WhatsApp para cotizar un paquete o combo de múltiples juegos
 * registrados a través de la solicitud de checkout.
 */
export function getComboInquiryUrl(
  orderId: string,
  items: Array<{ name: string; quantity: number; unit_price?: number }>,
  customerName: string,
  total?: number
): string {
  const lines = items.map((i) => {
    const priceText =
      i.unit_price && i.unit_price > 0
        ? ` (ref. $${(i.unit_price * i.quantity).toLocaleString("es-CO")})`
        : ""
    return `- ${i.name} x${i.quantity}${priceText}`
  })

  const totalLine =
    total && total > 0 ? `Total de referencia: $${total.toLocaleString("es-CO")}` : ""

  const messageParts = [
    `¡Hola MrGames! Quiero cotizar este combo de juegos (Solicitud #${orderId.slice(0, 8)}):`,
    ...lines,
  ]

  if (totalLine) {
    messageParts.push(totalLine)
  }

  messageParts.push(`Nombre: ${customerName.trim()}`)
  messageParts.push(`\n¿Me confirman disponibilidad y qué precio especial me dejan por el combo?`)

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageParts.join("\n"))}`
}

/**
 * Genera el enlace de WhatsApp para consultas generales de atención al cliente.
 */
export function getGeneralInquiryUrl(customMessage?: string): string {
  const message =
    customMessage ||
    "¡Hola MrGames! Tengo una consulta sobre el catálogo de videojuegos y disponibilidad."
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Genera el enlace de WhatsApp rápido para cotizar el combo actual desde el botón flotante.
 */
export function getQuickComboUrl(
  items: Array<{ name: string; quantity: number; price?: number }>,
  total?: number
): string {
  const lines = items.map((i) => `- ${i.name} x${i.quantity}`)
  const totalLine =
    total && total > 0 ? `Total ref: $${total.toLocaleString("es-CO")}` : ""
  const messageParts = [
    "¡Hola MrGames! Tengo estos juegos en mi combo y quiero cotizarlos:",
    ...lines,
  ]
  if (totalLine) {
    messageParts.push(totalLine)
  }
  messageParts.push("\n¿Qué descuento especial o bonos me aplican por armar este combo?")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageParts.join("\n"))}`
}


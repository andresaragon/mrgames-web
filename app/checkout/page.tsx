"use client"
import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { createOrder } from "./actions"

const WHATSAPP_NUMBER = "573175942917" // reemplaza con tu número real (indicativo país + número, sin +)

export default function CheckoutPage() {
  const { items, clearCart, total } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string
    total: number
    items: { name: string; quantity: number; unit_price: number }[]
    whatsappUrl: string
  } | null>(null)

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      setError("Completa tu nombre y teléfono")
      return
    }
    setLoading(true)
    setError("")
    try {
      const result = await createOrder({
        customerName,
        customerPhone,
        paymentMethod: "whatsapp",
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      })
      const lines = result.items.map(
        (i) => `- ${i.name} x${i.quantity}: $${(i.unit_price * i.quantity).toLocaleString("es-CO")}`
      )
      const message = [
        `Hola, quiero coordinar mi pedido #${result.orderId.slice(0, 8)}:`,
        ...lines,
        `Total: $${result.total.toLocaleString("es-CO")}`,
        `Nombre: ${customerName}`,
      ].join("\n")
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
      clearCart()
      window.open(whatsappUrl, "_blank")
      setConfirmedOrder({ orderId: result.orderId, total: result.total, items: result.items, whatsappUrl })
    } catch (err) {
      setError("Hubo un error al crear el pedido, intenta de nuevo")
    } finally {
      setLoading(false)
    }
  }

if (confirmedOrder) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20 text-3xl text-green-400 shadow-[0_0_30px_-6px_rgba(34,197,94,0.6)]">
          ✓
        </div>
        <h1 className="font-display mb-2 text-2xl font-bold uppercase md:text-3xl">¡Pedido registrado!</h1>
        <p className="mb-6 text-gray-400">
          Pedido #{confirmedOrder.orderId.slice(0, 8)} por{" "}
          <span className="font-semibold text-red-400">${confirmedOrder.total.toLocaleString('es-CO')}</span>
        </p>
        <div className="card-glow mb-6 rounded-xl p-4 text-left">
          {confirmedOrder.items.map((item, i) => (
            <p key={i} className="text-sm text-gray-300">
              {item.name} x{item.quantity} — ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
            </p>
          ))}
        </div>
        <p className="mb-4 text-gray-400">
          Se abrió WhatsApp en otra pestaña para coordinar tu pedido. Si no se abrió automáticamente:
        </p>
        <a href={confirmedOrder.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Abrir WhatsApp</a>
        <div className="mt-6">
          <a href="/" className="text-sm text-gray-400 underline transition-colors hover:text-red-400">
            Volver al catálogo
          </a>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-gray-400">Tu carrito está vacío.</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="font-display mb-6 text-2xl font-bold uppercase md:text-3xl">Finalizar pedido</h1>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Tu nombre"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="input-field"
        />
        <input
          type="tel"
          placeholder="Tu teléfono (ej. 3001234567)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="card-glow mb-6 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-300">Vamos a coordinar tu pedido por WhatsApp</p>
        <p className="mt-1 text-sm text-gray-500">
          Al confirmar, se abrirá WhatsApp con el detalle de tu pedido listo para enviar.
        </p>
      </div>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl font-bold">
          Total: <span className="text-red-400">${total.toLocaleString("es-CO")}</span>
        </p>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? "Procesando..." : "Confirmar pedido"}
        </button>
      </div>
    </main>
  )
}
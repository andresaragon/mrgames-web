"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { createOrder } from "./actions"
import { getComboInquiryUrl } from "@/utils/whatsapp"

export default function CheckoutPage() {
  const { items, clearCart, total } = useCart()
  const [checkoutId, setCheckoutId] = useState("")
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

  useEffect(() => {
    setCheckoutId(crypto.randomUUID())
  }, [])

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError("Completa tu nombre completo")
      return
    }
    const phoneDigits = customerPhone.replace(/\D/g, "")
    if (phoneDigits.length < 7) {
      setError("Ingresa un número de teléfono o WhatsApp válido (ej. 300 123 4567)")
      return
    }
    setLoading(true)
    setError("")

    const currentCheckoutId = checkoutId || crypto.randomUUID()
    if (!checkoutId) {
      setCheckoutId(currentCheckoutId)
    }

    try {
      const result = await createOrder({
        checkoutId: currentCheckoutId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod: "whatsapp",
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      })

      const whatsappUrl = getComboInquiryUrl(
        result.orderId,
        result.items,
        customerName.trim(),
        result.total
      )

      clearCart()
      window.open(whatsappUrl, "_blank")
      setConfirmedOrder({
        orderId: result.orderId,
        total: result.total,
        items: result.items,
        whatsappUrl,
      })
      // Prepara un nuevo ID para solicitudes subsecuentes en la misma sesión
      setCheckoutId(crypto.randomUUID())
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Hubo un error al procesar tu solicitud, intenta de nuevo"
      setError(message)
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
        <h1 className="font-display mb-2 text-2xl font-bold uppercase md:text-3xl">
          ¡Cotización registrada!
        </h1>
        <p className="mb-6 text-gray-400">
          Solicitud #{confirmedOrder.orderId.slice(0, 8)}
          {confirmedOrder.total > 0 && (
            <>
              {" "}por{" "}
              <span className="font-semibold text-red-400">
                ${confirmedOrder.total.toLocaleString("es-CO")} (ref.)
              </span>
            </>
          )}
        </p>
        <div className="card-glow mb-6 rounded-xl p-4 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Juegos en tu solicitud:
          </p>
          {confirmedOrder.items.map((item, i) => (
            <p key={i} className="text-sm text-gray-300">
              {item.name} x{item.quantity}
              {item.unit_price > 0
                ? ` — $${(item.unit_price * item.quantity).toLocaleString("es-CO")}`
                : " — A cotizar"}
            </p>
          ))}
        </div>
        <p className="mb-4 text-gray-400">
          Se abrió WhatsApp para coordinar tu combo con MrGames. Si no se abrió automáticamente:
        </p>
        <a
          href={confirmedOrder.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block"
        >
          Abrir WhatsApp
        </a>
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-gray-400 underline transition-colors hover:text-red-400"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold uppercase mb-4">Cotizar combo</h1>
        <p className="text-gray-400">
          Tu combo está vacío.{" "}
          <Link href="/" className="text-red-400 underline hover:text-red-300">
            Explorar catálogo
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="font-display mb-2 text-2xl font-bold uppercase md:text-3xl">
        Cotizar combo por WhatsApp
      </h1>
      <p className="mb-6 text-sm text-gray-400">
        Ingresa tus datos para coordinar la entrega. Te abriremos WhatsApp con la lista de tus juegos lista para enviar.
      </p>

      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Tu nombre completo
          </label>
          <input
            type="text"
            placeholder="Ej. Helen Brito"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            Teléfono o WhatsApp
          </label>
          <input
            type="tel"
            placeholder="Ej. 300 123 4567"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="card-glow mb-6 rounded-xl border-emerald-500/30 bg-emerald-950/20 p-4">
        <p className="text-sm font-semibold text-emerald-400">
          Atención personalizada y precio final
        </p>
        <p className="mt-1 text-sm text-gray-300">
          Al enviar la solicitud, MrGames te confirmará la disponibilidad exacta de cada juego y te aplicará las promociones vigentes.
        </p>
      </div>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold">
            Total de referencia:{" "}
            <span className="text-red-400">${total.toLocaleString("es-CO")}</span>
          </p>
          <p className="text-xs text-gray-500">
            Sujeto a descuentos por bonos y modalidad elegida.
          </p>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? "Procesando..." : "Enviar cotización por WhatsApp →"}
        </button>
      </div>
    </main>
  )
}
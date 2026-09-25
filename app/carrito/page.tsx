"use client"
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold uppercase mb-4">Tu combo de juegos</h1>
        <p className="text-gray-400">
          Aún no has agregado juegos a tu combo. <Link href="/" className="text-red-400 underline hover:text-red-300">Explorar catálogo</Link>
        </p>
      </main>
    )
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-2xl font-bold uppercase mb-2 md:text-3xl">Tu combo de juegos</h1>
      <p className="mb-6 text-sm text-gray-400">
        Revisa los juegos de tu paquete. En WhatsApp te confirmaremos disponibilidad de cada uno y te aplicaremos el mejor descuento.
      </p>

      <div className="card-glow mb-6 rounded-xl border-emerald-500/30 bg-emerald-950/20 p-4">
        <p className="text-sm font-semibold text-emerald-400">🎁 Beneficio de combo</p>
        <p className="mt-1 text-xs text-gray-300">
          Al cotizar 2 o más juegos recibes bonos en dinero o juegos de regalo para tus próximas compras.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card-glow flex items-center justify-between rounded-xl p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-400">
                {item.price > 0 ? `$${item.price.toLocaleString('es-CO')} c/u (ref.)` : 'Precio a cotizar'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-8 w-8 rounded-lg border border-navy-700 transition-colors hover:border-red-500 hover:text-red-400"
              >
                -
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 rounded-lg border border-navy-700 transition-colors hover:border-red-500 hover:text-red-400"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-sm text-red-400 transition-colors hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl font-bold">
            Total de referencia: <span className="text-red-400">${total.toLocaleString('es-CO')}</span>
          </p>
          <p className="text-xs text-gray-500">El precio final puede mejorar según la modalidad elegida.</p>
        </div>
        <Link href="/checkout" className="btn-primary text-center">
          Cotizar combo por WhatsApp →
        </Link>
      </div>
    </main>
  )
}
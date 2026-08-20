"use client"
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold uppercase mb-4">Tu carrito</h1>
        <p className="text-gray-400">
          Está vacío. <Link href="/" className="text-red-400 underline hover:text-red-300">Ver catálogo</Link>
        </p>
      </main>
    )
  }
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-2xl font-bold uppercase mb-6 md:text-3xl">Tu carrito</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card-glow flex items-center justify-between rounded-xl p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toLocaleString('es-CO')} c/u</p>
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
        <p className="font-display text-xl font-bold">
          Total: <span className="text-red-400">${total.toLocaleString('es-CO')}</span>
        </p>
        <Link href="/checkout" className="btn-primary text-center">
          Ir a pagar
        </Link>
      </div>
    </main>
  )
}
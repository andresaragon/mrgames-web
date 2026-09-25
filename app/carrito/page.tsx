"use client"

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6 md:p-12 text-center">
        <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-12">
          <span className="text-5xl">🎮</span>
          <h1 className="font-display text-2xl font-bold uppercase mt-4 text-white md:text-3xl">
            Tu combo está vacío
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Aún no has agregado títulos a tu combo. Navega por el catálogo y arma tu paquete para recibir precios preferenciales y bonos de regalo.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Explorar catálogo de videojuegos →
          </Link>
        </div>
      </main>
    )
  }

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)

  // Metas de la barra de progreso: 1 juego (33%), 2 juegos (66%), 3 o más juegos (100%)
  const progressPercent = totalUnits === 1 ? 33 : totalUnits === 2 ? 66 : 100

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase text-white md:text-3xl">
            Tu combo de juegos
          </h1>
          <p className="text-xs text-gray-400">
            {totalUnits} {totalUnits === 1 ? 'juego seleccionado' : 'juegos seleccionados'} en tu paquete
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
        >
          ← Seguir sumando juegos
        </Link>
      </div>

      {/* Barra Gamificada de Desbloqueo de Bonos y Descuentos */}
      <div className="card-glow mb-8 overflow-hidden rounded-2xl border border-navy-700/80 bg-navy-900/80 p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {totalUnits >= 3 ? '🏆' : totalUnits === 2 ? '🎉' : '🎁'}
            </span>
            <span className="font-bold uppercase tracking-wider text-white">
              {totalUnits >= 3
                ? 'Nivel Máximo Gamer'
                : totalUnits === 2
                ? 'Nivel Combo Desbloqueado'
                : 'Nivel Estándar'}
            </span>
          </div>
          <span className="font-semibold text-emerald-400">
            {totalUnits >= 3
              ? '100% Beneficio Activo'
              : `${progressPercent}% Completado`}
          </span>
        </div>

        {/* Pista de la barra de progreso */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-navy-950">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalUnits >= 3
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                : totalUnits === 2
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mensaje motivacional según nivel */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
          <p className="text-gray-300">
            {totalUnits === 1 && (
              <>
                🔥 Agrega <strong className="text-white">1 juego más</strong> a tu combo para activar precio preferencial y acumular bonos.
              </>
            )}
            {totalUnits === 2 && (
              <>
                ✨ Tienes tarifa de combo. Suma <strong className="text-white">1 título más</strong> para calificar al sorteo y bonos de regalo.
              </>
            )}
            {totalUnits >= 3 && (
              <>
                🌟 ¡Excelente! Este super-combo califica para el <strong className="text-emerald-300">máximo descuento</strong> y bonos comerciales.
              </>
            )}
          </p>
          {totalUnits < 3 && (
            <Link
              href="/"
              className="shrink-0 font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              + Agregar otro juego →
            </Link>
          )}
        </div>
      </div>

      {/* Lista de Juegos en el Combo */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="card-glow flex flex-col gap-3 rounded-xl border border-navy-700/80 bg-navy-900/60 p-4 transition-all sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-white text-sm md:text-base">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.price > 0
                  ? `$${item.price.toLocaleString('es-CO')} c/u (precio de referencia)`
                  : 'Precio especial a cotizar'}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-navy-800 sm:border-0">
              <div className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-950/80 p-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label={`Disminuir cantidad de ${item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label={`Aumentar cantidad de ${item.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-2 py-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen y Botón de Cotización */}
      <div className="mt-8 rounded-2xl border border-navy-700/80 bg-navy-900/80 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400">Total referencial</span>
            <p className="font-display text-2xl md:text-3xl font-bold text-white">
              ${total.toLocaleString('es-CO')}{' '}
              <span className="text-xs font-normal text-gray-400">COP</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              El precio final y los bonos te los confirmamos de inmediato por WhatsApp.
            </p>
          </div>
          <Link href="/checkout" className="btn-primary text-center px-8 py-3.5 text-base">
            Cotizar este combo por WhatsApp →
          </Link>
        </div>

        {/* Garantías al pie */}
        <div className="mt-6 border-t border-navy-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Sin cobros automáticos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Respuesta humana en WhatsApp en minutos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Cuentas 100% garantizadas
          </span>
        </div>
      </div>
    </main>
  )
}
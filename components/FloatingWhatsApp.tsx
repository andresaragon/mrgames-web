"use client"

import { useCart } from '@/context/CartContext'
import { getQuickComboUrl, getGeneralInquiryUrl } from '@/utils/whatsapp'

export default function FloatingWhatsApp() {
  const { items, total } = useCart()

  const hasItems = items.length > 0
  const whatsappUrl = hasItems
    ? getQuickComboUrl(items, total)
    : getGeneralInquiryUrl('¡Hola MrGames! Tengo una consulta sobre el catálogo de videojuegos.')

  return (
    <aside
      aria-label="Atención al cliente por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          hasItems
            ? `Cotizar combo de ${items.length} juegos por WhatsApp`
            : 'Chatear con un asesor de Mr Games por WhatsApp'
        }
        className={`group relative flex items-center gap-2.5 rounded-full px-4 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          hasItems
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_6px_30px_-4px_rgba(16,185,129,0.7)] hover:shadow-[0_8px_36px_-4px_rgba(16,185,129,0.9)]'
            : 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-[0_6px_25px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(16,185,129,0.8)]'
        }`}
      >
        {/* Halo animado */}
        <span className="absolute -inset-1 -z-10 rounded-full bg-emerald-500/20 blur-sm transition-opacity group-hover:opacity-100" />

        {/* Icono de WhatsApp SVG */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.28 0-7.75 3.47-7.75 7.75 0 1.488.423 2.878 1.155 4.062l-1.226 4.478 4.604-1.208c1.134.675 2.459 1.068 3.877 1.068 4.28 0 7.75-3.47 7.75-7.75s-3.47-7.75-7.75-7.75z" />
          </svg>
          {/* Dot de estado en vivo o badge de cantidad */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
        </div>

        {/* Texto dinámico */}
        <div className="flex flex-col text-left leading-tight">
          {hasItems ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                Combo Activo
              </span>
              <span className="font-display text-xs md:text-sm font-bold tracking-wide">
                Cotizar {items.length} {items.length === 1 ? 'juego' : 'juegos'} →
              </span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                ¿Dudas? En línea
              </span>
              <span className="font-display text-xs md:text-sm font-bold tracking-wide">
                <span className="hidden sm:inline">Chatear en </span>WhatsApp →
              </span>
            </>
          )}
        </div>
      </a>
    </aside>
  )
}

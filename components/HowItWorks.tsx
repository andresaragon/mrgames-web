import Link from 'next/link'

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      badge: 'Catálogo & Combos',
      icon: (
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      ),
      title: 'Elige tu juego o arma tu combo',
      description:
        'Explora más de 600 títulos destacados para Xbox, PlayStation, PC y Nintendo Switch. Consulta uno o agrupa varios.',
    },
    {
      step: '02',
      badge: 'Atención Personalizada',
      icon: (
        <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: 'Confirma por WhatsApp al instante',
      description:
        'Un asesor en vivo verifica disponibilidad inmediata, te cotiza el mejor precio por combo y resuelve tus dudas.',
    },
    {
      step: '03',
      badge: 'Garantía Total',
      icon: (
        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: 'Instala, juega y acumula regalos',
      description:
        'Recibe tutorial fácil en 1 minuto, soporte permanente y acumula saldo para reclamar juegos de regalo con tus bonos.',
    },
  ]

  return (
    <section aria-labelledby="how-it-works-title" className="border-b border-navy-800 bg-navy-950/60 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
            Transparencia y Seguridad Gamer
          </p>
          <h2 id="how-it-works-title" className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
            ¿Cómo funciona comprar en <span className="text-red-500">Mr Games</span>?
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Cero trámites complicados. Coordinas directamente con nosotros por WhatsApp y juegas hoy mismo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="card-glow relative overflow-hidden rounded-2xl p-6 border border-navy-700/80 bg-navy-900/60 transition-all duration-300 hover:border-red-500/40"
            >
              {/* Número grande de fondo */}
              <span className="pointer-events-none absolute right-4 top-2 select-none font-display text-5xl font-extrabold text-navy-800/80">
                {item.step}
              </span>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-navy-800 p-3 border border-navy-700/80 shadow-inner">
                    {item.icon}
                  </div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    {item.badge}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner de llamada a bonos de regalo */}
        <div className="mt-8 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-navy-900/60 to-navy-950/40 p-4 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="text-2xl">🎁</span>
            <div>
              <p className="text-sm font-bold text-white">Programa de Bonos & Fidelización</p>
              <p className="text-xs text-gray-400">Tus compras acumulan saldo real y videojuegos de regalo gratis.</p>
            </div>
          </div>
          <Link
            href="/bonos"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors sm:mt-0"
          >
            Ver cómo ganar bonos →
          </Link>
        </div>
      </div>
    </section>
  )
}

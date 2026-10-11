import Link from 'next/link'

const steps = [
  {
    title: 'Elige tu juego o arma tu combo',
    description: 'Explora el catálogo para Xbox, PlayStation, PC y Nintendo Switch. Consulta uno o agrupa varios.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    ),
  },
  {
    title: 'Confirma por WhatsApp',
    description: 'Una persona te confirma disponibilidad y te cotiza el combo. Aquí resuelves tus dudas antes de comprar.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
  {
    title: 'Instala con nuestra guía',
    description: 'Te acompañamos en la instalación y tu compra incluye garantía. Con un combo de 2 o más juegos, pregunta por tus bonos.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
]

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" className="border-t border-navy-800 bg-navy-950 px-4 py-12 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 id="how-it-works-title" className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
          ¿Cómo funciona comprar en <span className="text-red-500">Mr Games</span>?
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <li key={item.title} className="flex gap-4">
              <svg
                className="mt-0.5 h-7 w-7 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-300">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/bonos"
          className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
        >
          Conoce cómo funcionan los bonos →
        </Link>
      </div>
    </section>
  )
}

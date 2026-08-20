const WHATSAPP_NUMBER = "573175942917"
const whatsappMessage = encodeURIComponent("Hola, quiero saber más sobre los bonos y juegos de regalo de MrGames")
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

export default function BonosPage() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-red-600/20 bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950 px-6 py-16 text-center md:py-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
            Programa de recompensas
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">
            Bonos y <span className="text-red-500">juegos gratis</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 md:text-lg">
            Por cada compra en MrGames puedes ganar bonos en dinero o un juego de regalo. Así funciona:
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="card-glow mb-8 rounded-xl p-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-400">Valor del bono</p>
          <p className="text-gray-300">
            El bono siempre es de <span className="font-display font-bold text-red-400">$25.000 COP</span> para juegos de más de $99.000,
            y de <span className="font-display font-bold text-red-400">$15.000 COP</span> para juegos de $99.000 o menos.
          </p>
        </div>

        <h2 className="font-display mb-6 text-2xl font-bold uppercase">Por compra de juegos digitales</h2>
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="card-glow rounded-xl p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Hasta $59.000</p>
            <p className="font-display mb-1 text-lg font-bold text-white">Bono garantizado</p>
            <p className="text-sm text-gray-400">Siempre recibes tu bono en dinero para tu próxima compra.</p>
          </div>
          <div className="card-glow rounded-xl p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">$60.000 — $99.000</p>
            <p className="font-display mb-1 text-lg font-bold text-white">Tú eliges</p>
            <p className="text-sm text-gray-400">Escoges entre un juego de regalo o el bono en dinero.</p>
          </div>
          <div className="card-glow rounded-xl border-red-500/40 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">Desde $100.000</p>
            <p className="font-display mb-1 text-lg font-bold text-white">Regalo + Bono</p>
            <p className="text-sm text-gray-400">Te llevas siempre un juego de regalo Y el bono en dinero.</p>
          </div>
        </div>

        <h2 className="font-display mb-6 text-2xl font-bold uppercase">Refiere a un amigo</h2>
        <div className="card-glow mb-12 rounded-xl p-6">
          <p className="text-gray-300">
            Si nos refieres con un amigo y esa persona compra un juego, ambos reciben bono o juego de regalo
            según el valor de esa compra (las mismas reglas de arriba).
          </p>
        </div>

        <h2 className="font-display mb-6 text-2xl font-bold uppercase">Comparte y gana</h2>
        <div className="card-glow mb-12 rounded-xl p-6">
          <p className="text-gray-300">
            Comparte nuestra página con mínimo <span className="font-semibold text-white">10 personas</span> que nos empiecen a seguir,
            y obtén un bono de <span className="font-display font-bold text-red-400">$15.000</span> para cualquier juego, de cualquier valor.
            Este bono se puede sumar con los demás.
          </p>
        </div>

        <div className="text-center">
          <p className="mb-4 text-gray-400">¿Ya cumples con alguna de estas condiciones?</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Reclamar por WhatsApp</a>
        </div>
      </main>
    </>
  )
}
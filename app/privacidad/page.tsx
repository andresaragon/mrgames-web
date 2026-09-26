import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de MrGames (Ley 1581 de 2012).',
}

const WHATSAPP_NUMBER = "573175942917"
const CONTACT_EMAIL = "santiagoaragon.sistemas@gmail.com"
const whatsappMessage = encodeURIComponent("Hola, quiero hacer una solicitud sobre mis datos personales en MrGames")
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`

export default function PrivacidadPage() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-red-600/20 bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950 px-6 py-16 text-center md:py-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
            Tratamiento de datos personales
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-white md:text-5xl">
            Política de <span className="text-red-500">privacidad</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 md:text-lg">
            Qué datos recogemos, para qué los usamos y cómo puedes ejercer tus derechos según la Ley 1581 de 2012.
          </p>
          <p className="mt-2 text-xs text-gray-500">Última actualización: 25 de septiembre de 2026</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-6 md:p-10 space-y-10 text-gray-300 leading-relaxed">
        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">Responsable del tratamiento</h2>
          <p>
            <span className="font-semibold text-white">MrGames</span> (mrgames.com.co) es responsable del tratamiento
            de los datos personales que nos compartes. Puedes contactarnos por:
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              Correo:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-400 hover:underline">{CONTACT_EMAIL}</a>
            </li>
            <li>
              WhatsApp:{' '}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">+57 317 594 2917</a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">Qué datos recogemos</h2>
          <p>
            Solo recogemos los datos que tú mismo nos compartes por WhatsApp o en este sitio web para cotizar y comprar, por ejemplo:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1 text-gray-400">
            <li>Nombre y número de WhatsApp o teléfono.</li>
            <li>Correo electrónico, si lo indicas.</li>
            <li>Los juegos, consolas o productos que consultas, cotizas o compras.</li>
            <li>Datos necesarios para coordinar el pago y la entrega del pedido.</li>
          </ul>
          <p className="mt-3">No guardamos números de tarjetas ni claves bancarias.</p>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">Para qué los usamos</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Responder tus consultas y enviarte cotizaciones.</li>
            <li>Procesar, entregar y dar soporte a tus compras.</li>
            <li>Gestionar bonos, juegos de regalo y garantías asociados a tus compras.</li>
            <li>Cumplir obligaciones legales y contables.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">No vendemos tus datos</h2>
          <p>
            MrGames <span className="font-semibold text-white">no vende, alquila ni comparte</span> tus datos personales
            con terceros para fines comerciales o publicitarios. Solo se usan para las finalidades descritas arriba.
          </p>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">Tus derechos (Ley 1581 de 2012)</h2>
          <p>Como titular de los datos tienes derecho a:</p>
          <ul className="mt-3 list-disc list-inside space-y-1 text-gray-400">
            <li><span className="font-semibold text-white">Conocer</span> qué datos tuyos tenemos y cómo los usamos.</li>
            <li><span className="font-semibold text-white">Actualizar</span> tus datos cuando cambien.</li>
            <li><span className="font-semibold text-white">Rectificar</span> datos inexactos o incompletos.</li>
            <li><span className="font-semibold text-white">Suprimir</span> tus datos cuando no sean necesarios o revoques tu autorización.</li>
          </ul>
          <div className="card-glow mt-6 rounded-xl p-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-red-400">Cómo ejercerlos</p>
            <p>
              Escríbenos a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-400 hover:underline">{CONTACT_EMAIL}</a>{' '}
              o por WhatsApp al +57 317 594 2917 indicando tu nombre, el número con el que nos contactaste y tu solicitud.
              Respondemos consultas en un máximo de 10 días hábiles y reclamos en un máximo de 15 días hábiles, según la ley.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-bold uppercase">Automatización de Facebook</h2>
          <p>
            MrGames usa una automatización para publicar contenido (juegos del catálogo y promociones)
            <span className="font-semibold text-white"> únicamente en su propia página de Facebook</span>.
            Esta automatización no lee, recoge ni almacena datos de usuarios de Facebook.
          </p>
        </section>

        <div className="text-center">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">Escribir por WhatsApp</a>
        </div>
      </main>
    </>
  )
}

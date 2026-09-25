import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Mr Games',
  description: 'Política de Privacidad y Tratamiento de Datos Personales de Mr Games Colombia.',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#050811] text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <Link
            href="/"
            className="text-xs uppercase font-mono tracking-widest text-[#ff2b56] hover:underline inline-flex items-center gap-1 mb-4"
          >
            ← Volver al catálogo
          </Link>
          <h1 className="text-3xl font-bold text-white font-display tracking-wide uppercase">
            Política de Privacidad
          </h1>
          <p className="text-xs font-mono text-zinc-500 mt-2">
            Última actualización: 25 de septiembre de 2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-300 font-sans">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              1. Identificación del Responsable
            </h2>
            <p>
              <strong>Mr Games Colombia</strong> («Mr Games»), con presencia digital en{' '}
              <a href="https://mrgames.com.co" className="text-[#ff2b56] hover:underline">
                https://mrgames.com.co
              </a>{' '}
              y canales oficiales en redes sociales, es el responsable del tratamiento de los datos personales suministrados por los usuarios y clientes en el marco de la Ley Estatutaria 1581 de 2012 de la República de Colombia y normativas internacionales de protección de datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              2. Datos Recolectados y Finalidad
            </h2>
            <p>
              Mr Games recopila exclusivamente los datos indispensables para la consulta de catálogo, cotización de combos y coordinación de entrega de videojuegos y servicios digitales a través de WhatsApp:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Nombre o seudónimo de contacto.</li>
              <li>Número de teléfono celular / WhatsApp para atención al cliente y despacho de pedidos.</li>
              <li>Datos técnicos anónimos de navegación (cookies técnicas de Cloudflare y análisis de rendimiento) para garantizar la disponibilidad y seguridad de la plataforma.</li>
            </ul>
            <p className="mt-2">
              No almacenamos información bancaria ni números de tarjetas de crédito en nuestros servidores; los pagos se coordinan de forma segura a través de los canales bancarios y pasarelas autorizadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              3. Integración con Meta Platforms y Redes Sociales
            </h2>
            <p>
              Mr Games utiliza las Interfaces de Programación de Aplicaciones (APIs) de Meta Platforms Inc. (incluyendo Meta Graph API) con fines legítimos de publicación automatizada de su catálogo público de productos, promociones y novedades en su Fanpage oficial de Facebook. Ningún dato privado de usuarios de Facebook o Meta es recolectado, almacenado o transferido a través de dichas integraciones automatizadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              4. Transferencia y Seguridad de Datos
            </h2>
            <p>
              Los datos se almacenan en infraestructura de nube segura (Supabase y Cloudflare) con cifrado en tránsito (TLS/SSL) y políticas estrictas de control de acceso. Mr Games no vende, alquila ni comercializa bases de datos personales con terceros para fines publicitarios externos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2 font-display">
              5. Derechos de los Titulares (Habeas Data)
            </h2>
            <p>
              De conformidad con la ley, todo usuario tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales de nuestros registros en cualquier momento.
            </p>
            <p className="mt-2">
              Para ejercer estos derechos o realizar cualquier consulta respecto a esta política, puede comunicarse directamente a través de nuestros canales de atención en WhatsApp o al correo electrónico de contacto oficial.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500 font-mono">
          © {new Date().getFullYear()} Mr Games Colombia. Todos los derechos reservados.
        </div>
      </div>
    </main>
  )
}

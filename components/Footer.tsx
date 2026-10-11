import Link from 'next/link'
import { getGeneralInquiryUrl } from '@/utils/whatsapp'

const PHONE_DISPLAY = '+57 323 504 5163'
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61594696654645'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-600/20 bg-navy-900">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 px-4 py-8 text-sm text-gray-400 md:flex-row md:items-start md:justify-between md:px-6">
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Mr<span className="text-red-500">Games</span> Colombia
          </p>
          <p className="mt-1">Videojuegos digitales con atención por WhatsApp.</p>
        </div>
        <ul className="flex flex-col gap-1 md:items-end">
          <li>
            <a
              href={getGeneralInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-red-400"
            >
              WhatsApp {PHONE_DISPLAY}
            </a>
          </li>
          <li>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors hover:text-red-400"
            >
              Facebook: Mr Games Colombia
            </a>
          </li>
          <li>
            <Link href="/privacidad" className="inline-flex min-h-11 items-center transition-colors hover:text-red-400">
              Política de privacidad
            </Link>
          </li>
        </ul>
      </div>
      <p className="border-t border-navy-800 px-4 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Mr Games
      </p>
    </footer>
  )
}

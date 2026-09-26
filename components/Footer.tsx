import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-600/20 bg-navy-900">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row md:px-6">
        <p>© {new Date().getFullYear()} MrGames</p>
        <Link href="/privacidad" className="transition-colors hover:text-red-400">
          Política de privacidad
        </Link>
      </div>
    </footer>
  )
}

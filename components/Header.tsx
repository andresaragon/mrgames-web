"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  return (
    <header className="sticky top-0 z-50 border-b border-red-600/20 bg-navy-800/90 backdrop-blur-md shadow-[0_2px_20px_-4px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="MrGames"
            width={40}
            height={40}
            className="rounded transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display text-xl font-bold uppercase tracking-wide text-white">
            Mr<span className="text-red-500">Games</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/bonos" className="hidden sm:inline text-sm font-semibold uppercase tracking-wide text-gray-300 transition-colors hover:text-red-400">
            Bonos y regalos
          </Link>
          <Link href="/carrito" className="group flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-colors hover:text-white">
            <span className="relative flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 transition-colors group-hover:text-red-400"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-[0_0_10px_rgba(231,76,60,0.9)]">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden sm:inline font-medium">Carrito</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
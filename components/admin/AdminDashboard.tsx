"use client"
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { logoutAdmin, AdminProduct } from '@/app/admin/actions'
import CatalogManager from '@/components/admin/CatalogManager'
import SharedAccountsManager, { SharedAccountUsage } from '@/components/admin/SharedAccountsManager'

interface AdminDashboardProps {
  userEmail?: string
  initialCatalogData: {
    products: AdminProduct[]
    totalCount: number
    totalActive: number
    totalInactive: number
  }
  accounts: SharedAccountUsage[]
}

export default function AdminDashboard({
  userEmail,
  initialCatalogData,
  accounts,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'accounts'>('catalog')
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logoutAdmin()
  }

  return (
    <div className="min-h-screen bg-navy-950 text-foreground pb-20">
      {/* Barra Superior del Panel */}
      <header className="sticky top-0 z-40 border-b border-navy-700/80 bg-navy-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3.5 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="MrGames"
                width={32}
                height={32}
                className="rounded transition-transform group-hover:scale-105"
              />
              <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Mr<span className="text-red-500">Games</span>
              </span>
            </Link>
            <span className="rounded-md border border-red-500/40 bg-red-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <span>Ver Tienda</span>
              <span>↗</span>
            </Link>
            {userEmail && (
              <span className="hidden md:inline text-xs text-gray-400 font-mono">
                {userEmail}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-navy-700 bg-navy-800/80 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-red-500/50 hover:text-red-300 transition-all disabled:opacity-50"
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex gap-2 border-t border-navy-800/60 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'catalog'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>🎮</span>
            <span>Catálogo de Videojuegos</span>
            <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
              {initialCatalogData.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'accounts'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>👥</span>
            <span>Cuentas Compartidas</span>
            <span className="rounded-full bg-navy-800 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
              {accounts.length}
            </span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
        {activeTab === 'catalog' ? (
          <CatalogManager initialData={initialCatalogData} />
        ) : (
          <SharedAccountsManager accounts={accounts} />
        )}
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect, useTransition, useId } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CatalogFiltersProps {
  initialQuery?: string
  initialPlatform?: string
}

interface PlatformOption {
  id: string
  label: string
  shortLabel: string
  accentColor: string
  activeBg: string
}

const PLATFORMS: PlatformOption[] = [
  {
    id: '',
    label: 'Todas las consolas',
    shortLabel: 'Todas',
    accentColor: 'hover:border-gray-400',
    activeBg: 'border-white/80 bg-white/10 text-white shadow-sm',
  },
  {
    id: 'Xbox',
    label: 'Xbox Series / One',
    shortLabel: 'Xbox',
    accentColor: 'hover:border-emerald-500/60 hover:text-emerald-300',
    activeBg: 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]',
  },
  {
    id: 'PS5',
    label: 'PlayStation 5',
    shortLabel: 'PS5',
    accentColor: 'hover:border-blue-500/60 hover:text-blue-300',
    activeBg: 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]',
  },
  {
    id: 'PC',
    label: 'PC Digital',
    shortLabel: 'PC',
    accentColor: 'hover:border-purple-500/60 hover:text-purple-300',
    activeBg: 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]',
  },
  {
    id: 'Nintendo Switch',
    label: 'Nintendo Switch',
    shortLabel: 'Switch',
    accentColor: 'hover:border-red-500/60 hover:text-red-300',
    activeBg: 'border-red-500 bg-red-500/20 text-red-300 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]',
  },
]

export default function CatalogFilters({
  initialQuery = '',
  initialPlatform = '',
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchInputId = useId()

  const [query, setQuery] = useState(initialQuery)
  const currentPlatform = searchParams.get('platform') || initialPlatform || ''

  // Sincronizar estado local si cambia la URL externamente (ej. navegación atrás/adelante)
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Debounce para la búsqueda de texto (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || ''
      const trimmedQuery = query.trim()

      if (trimmedQuery !== currentQ) {
        updateFilters({ q: trimmedQuery, page: '1' })
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  const updateFilters = (updates: { q?: string; platform?: string; page?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    // Actualizar o eliminar 'q'
    if (updates.q !== undefined) {
      if (updates.q) {
        params.set('q', updates.q)
      } else {
        params.delete('q')
      }
    }

    // Actualizar o eliminar 'platform'
    if (updates.platform !== undefined) {
      if (updates.platform) {
        params.set('platform', updates.platform)
      } else {
        params.delete('platform')
      }
    }

    // Resetear 'page' a la primera página al cambiar filtros
    if (updates.page) {
      params.delete('page')
    }

    const queryString = params.toString()
    startTransition(() => {
      router.push(queryString ? `/?${queryString}` : '/', { scroll: false })
    })
  }

  const handlePlatformClick = (platformId: string) => {
    // Si pulsa el mismo chip activo (diferente de 'Todas'), lo apaga volviendo a 'Todas'
    const newPlatform = currentPlatform === platformId && platformId !== '' ? '' : platformId
    updateFilters({ platform: newPlatform, page: '1' })
  }

  const handleClearSearch = () => {
    setQuery('')
    updateFilters({ q: '', page: '1' })
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Barra de Búsqueda con Debounce y feedback de carga */}
      <div className="relative">
        <label htmlFor={searchInputId} className="sr-only">
          Buscar videojuegos en el catálogo
        </label>
        <div className="relative flex items-center">
          <svg
            className="pointer-events-none absolute left-4 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            id={searchInputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título (ej: GTA, FIFA, Zelda, Elden Ring, Mario)..."
            className="input-field pl-12 pr-24 py-3.5 text-sm md:text-base bg-navy-900/80 border-navy-700/80 focus:border-red-500"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {isPending && (
              <span className="flex items-center gap-1.5 text-xs text-red-400 animate-pulse">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="hidden sm:inline">Buscando</span>
              </span>
            )}

            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                className="rounded-md bg-navy-800 p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chips Rápidos de Consolas / Plataformas */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Filtrar por consola:
        </p>
        <div
          role="group"
          aria-label="Filtro de plataformas de videojuegos"
          className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar text-xs md:text-sm font-medium"
        >
          {PLATFORMS.map((platform) => {
            const isActive = currentPlatform === platform.id

            return (
              <button
                key={platform.id || 'all'}
                type="button"
                onClick={() => handlePlatformClick(platform.id)}
                aria-pressed={isActive}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 transition-all duration-200 active:scale-95 ${
                  isActive
                    ? platform.activeBg
                    : `border-navy-700/80 bg-navy-900/60 text-gray-300 ${platform.accentColor} hover:bg-navy-800/80`
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-current opacity-80" />
                <span className="hidden sm:inline">{platform.label}</span>
                <span className="sm:hidden">{platform.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

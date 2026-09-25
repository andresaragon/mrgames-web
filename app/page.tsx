import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import CatalogFilters from '@/components/CatalogFilters'
import HowItWorks from '@/components/HowItWorks'
import { getProductBadge } from '@/utils/badges'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string | null
  platform: string | null
  condition: string
}

const PAGE_SIZE = 24

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; platform?: string; page?: string }>
}) {
  const { q, platform, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let query = supabase
    .from('products')
    .select('id, name, slug, price, image_url, platform, condition', { count: 'exact' })
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  if (platform) {
    query = query.eq('platform', platform)
  }
  const { data: products, count, error } = await query.range(from, to)
  if (error) {
    console.error(error)
  }

  const totalItems = count || 0
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (platform) params.set('platform', platform)
    if (targetPage > 1) params.set('page', targetPage.toString())
    const queryString = params.toString()
    return queryString ? `/?${queryString}` : '/'
  }
  return (
    <>
      <Link href="/bonos" className="block bg-red-600 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-red-500">
        🎁 Gana bonos y juegos de regalo con tus compras — Ver cómo funciona →
      </Link>
      <div className="relative overflow-hidden border-b border-red-600/20 bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950 px-6 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
            Xbox · PlayStation · Switch · PC
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-white md:text-6xl">
            Tu próximo juego <span className="text-red-500">te espera</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-400 md:text-lg">
            Catálogo de videojuegos destacados y cuentas compartidas — consulta disponibilidad inmediata o arma tu combo en WhatsApp.
          </p>
        </div>
      </div>
      <HowItWorks />
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="font-display mb-6 text-2xl font-bold uppercase tracking-wide md:text-3xl">Catálogo</h2>
        <Suspense fallback={<div className="mb-8 h-28 w-full animate-pulse rounded-xl bg-navy-900/40" />}>
          <CatalogFilters initialQuery={q} initialPlatform={platform} />
        </Suspense>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400">
          <p>
            {totalItems > 0 ? (
              <>
                Mostrando <span className="font-semibold text-white">{from + 1}</span>–
                <span className="font-semibold text-white">{Math.min(to + 1, totalItems)}</span> de{' '}
                <span className="font-semibold text-white">{totalItems}</span> títulos
              </>
            ) : (
              '0 títulos encontrados'
            )}
          </p>
          {totalPages > 1 && (
            <p>
              Página <span className="font-semibold text-white">{currentPage}</span> de{' '}
              <span className="font-semibold text-white">{totalPages}</span>
            </p>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product: Product, index: number) => {
              const badge = getProductBadge(product.name, product.price)

              return (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  className="card-glow group block overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-navy-900">
                    {badge && (
                      <div className="absolute left-2.5 top-2.5 z-20">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${badge.colorClasses}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    )}
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        priority={index < 4}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">Sin imagen</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-3 md:p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold md:text-base">{product.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {product.platform} · {product.condition}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {product.price > 0 ? (
                      <p className="font-display text-base font-bold text-red-400 md:text-lg">
                        ${product.price.toLocaleString('es-CO')}
                      </p>
                    ) : (
                      <p className="font-display text-xs font-bold uppercase tracking-wider text-emerald-400 md:text-sm">
                        Consultar
                      </p>
                    )}
                    <span className="text-[11px] font-medium text-gray-400 group-hover:text-red-400">
                      Ver →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
          </div>
        ) : (
          <div className="rounded-xl border border-navy-700 bg-navy-800/40 p-12 text-center">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-gray-200">
              No se encontraron videojuegos
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              {q || platform
                ? 'No encontramos coincidencias para tu búsqueda o filtro seleccionado.'
                : 'El catálogo no tiene productos disponibles en este momento.'}
            </p>
            {(q || platform) && (
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-all"
              >
                Limpiar filtros y ver todo el catálogo
              </Link>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Paginación del catálogo" className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-red-600/40 hover:text-white"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-navy-800 bg-navy-900/40 px-4 py-2 text-sm font-semibold text-gray-600">
                ← Anterior
              </span>
            )}

            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = []
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  if (currentPage <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i)
                    pages.push('...')
                    pages.push(totalPages)
                  } else if (currentPage >= totalPages - 3) {
                    pages.push(1)
                    pages.push('...')
                    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1)
                    pages.push('...')
                    pages.push(currentPage - 1)
                    pages.push(currentPage)
                    pages.push(currentPage + 1)
                    pages.push('...')
                    pages.push(totalPages)
                  }
                }
                return pages.map((p, idx) =>
                  typeof p === 'number' ? (
                    <Link
                      key={`page-${p}`}
                      href={buildPageUrl(p)}
                      className={`min-w-[38px] rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-all ${
                        p === currentPage
                          ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'border-navy-700 bg-navy-800 text-gray-300 hover:border-red-600/40 hover:text-white'
                      }`}
                    >
                      {p}
                    </Link>
                  ) : (
                    <span key={`dots-${idx}`} className="px-2 text-sm text-gray-500">
                      …
                    </span>
                  )
                )
              })()}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-red-600/40 hover:text-white"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-navy-800 bg-navy-900/40 px-4 py-2 text-sm font-semibold text-gray-600">
                Siguiente →
              </span>
            )}
          </nav>
        )}
      </main>
    </>
  )
}
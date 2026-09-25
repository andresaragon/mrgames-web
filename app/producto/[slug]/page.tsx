import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProductActions from '@/components/ProductActions'
import { getProductBadge } from '@/utils/badges'

interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  stock?: number
  image_url: string | null
  platform: string | null
  condition: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, platform, price')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) {
    return {
      title: 'Juego no encontrado',
    }
  }

  const title = `${product.name} (${product.platform || 'Digital'})`
  const description =
    product.price > 0
      ? `Juego digital garantizado para ${product.platform || 'tu consola'} · Ref. $${product.price.toLocaleString('es-CO')} COP. Consulta disponibilidad y cotiza combos por WhatsApp.`
      : `Juego digital garantizado para ${product.platform || 'tu consola'}. Consulta disponibilidad y arma tu combo en WhatsApp.`

  return {
    title,
    description,
    openGraph: {
      title: `${product.name} | MrGames`,
      description,
      url: `https://mrgames.com.co/producto/${slug}`,
      siteName: 'MrGames',
      locale: 'es_CO',
      type: 'website',
      images: product.image_url
        ? [
            {
              url: product.image_url,
              width: 600,
              height: 900,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | MrGames`,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

function getPlatformBadgeClasses(platform: string | null) {
  switch (platform) {
    case 'Xbox':
      return 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
    case 'PS5':
      return 'border-blue-500/40 bg-blue-950/40 text-blue-300'
    case 'PC':
      return 'border-purple-500/40 bg-purple-950/40 text-purple-300'
    case 'Nintendo Switch':
      return 'border-red-500/40 bg-red-950/40 text-red-300'
    default:
      return 'border-navy-700 bg-navy-800 text-gray-300'
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Consultar el producto principal
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, stock, image_url, platform, condition')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error || !product) {
    notFound()
  }

  // 2. Consultar hasta 4 juegos recomendados de la misma plataforma
  let relatedQuery = supabase
    .from('products')
    .select('id, name, slug, price, image_url, platform, condition')
    .eq('active', true)
    .neq('id', product.id)

  if (product.platform) {
    relatedQuery = relatedQuery.eq('platform', product.platform)
  }

  const { data: relatedProducts } = await relatedQuery
    .order('created_at', { ascending: false })
    .limit(4)

  const platformBadge = getPlatformBadgeClasses(product.platform)
  const productBadge = getProductBadge(product.name, product.price)
  const defaultDescription = `Juego digital garantizado para ${
    product.platform || 'tu consola'
  }. Consulta disponibilidad para entrega inmediata o arma tu combo en WhatsApp.`

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10">
      {/* Breadcrumbs de Navegación */}
      <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-white transition-colors">
          Inicio
        </Link>
        <span>/</span>
        {product.platform ? (
          <Link
            href={`/?platform=${encodeURIComponent(product.platform)}`}
            className="hover:text-white transition-colors"
          >
            {product.platform}
          </Link>
        ) : (
          <span>Catálogo</span>
        )}
        <span>/</span>
        <span className="truncate text-gray-200 max-w-[220px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Detalle Principal del Producto */}
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Carátula */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-navy-700 bg-navy-900 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.8)]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">
              Sin imagen disponible
            </div>
          )}
        </div>

        {/* Información y Acciones */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${platformBadge}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {product.platform || 'Digital'}
            </span>
            <span className="rounded-full border border-navy-700 bg-navy-850 px-2.5 py-1 text-xs text-gray-400">
              {product.condition}
            </span>
            {productBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${productBadge.colorClasses}`}
              >
                <span>{productBadge.icon}</span>
                <span>{productBadge.label}</span>
              </span>
            )}
          </div>

          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {product.name}
          </h1>

          {/* Bloque de Precio */}
          {product.price > 0 ? (
            <div className="mt-4">
              <span className="text-xs uppercase tracking-wider text-gray-400">Precio de referencia</span>
              <p className="font-display text-3xl font-bold text-red-400">
                ${product.price.toLocaleString('es-CO')}{' '}
                <span className="text-sm font-normal text-gray-400">COP</span>
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="font-display text-2xl font-bold uppercase tracking-wide text-emerald-400">
                Precio a consultar
              </p>
              <span className="text-xs text-gray-400">
                Varía según modalidad (código digital o cuenta compartida)
              </span>
            </div>
          )}

          {/* Descripción */}
          <p className="mt-5 leading-relaxed text-gray-300 text-sm md:text-base">
            {product.description || defaultDescription}
          </p>

          {/* Badge de Disponibilidad Inmediata */}
          <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Disponible para consulta y entrega inmediata
          </div>

          {/* Botones de Acción (WhatsApp + Cotizador de Combo) */}
          <div className="mt-6">
            <ProductActions
              id={product.id}
              name={product.name}
              price={product.price}
              slug={product.slug}
              platform={product.platform}
            />
          </div>

          {/* Sellos de Confianza y Garantía Gamer */}
          <div className="mt-8 rounded-xl border border-navy-700/80 bg-navy-900/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Garantía Mr Games
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <span className="text-base">⚡</span>
                <div>
                  <p className="font-semibold text-white">Entrega Directa</p>
                  <p className="text-[11px] text-gray-400">Envío de credenciales al instante por WhatsApp</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base">🛡️</span>
                <div>
                  <p className="font-semibold text-white">100% Original</p>
                  <p className="text-[11px] text-gray-400">Cuentas y licencias garantizadas</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base">🎁</span>
                <div>
                  <p className="font-semibold text-white">Acumula Bonos</p>
                  <p className="text-[11px] text-gray-400">Suma compras para juegos de regalo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Más juegos recomendados para armar combo */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-navy-800 pt-10">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold uppercase tracking-wide md:text-2xl text-white">
                Más juegos de {product.platform || 'la tienda'}
              </h2>
              <p className="text-xs text-gray-400">
                Arma tu combo con varios títulos y consulta descuento especial en WhatsApp.
              </p>
            </div>
            {product.platform && (
              <Link
                href={`/?platform=${encodeURIComponent(product.platform)}`}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Ver catálogo completo de {product.platform} →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((rel: Product) => {
              const relBadge = getProductBadge(rel.name, rel.price)

              return (
                <Link
                  key={rel.id}
                  href={`/producto/${rel.slug}`}
                  className="card-glow group block overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-navy-900">
                    {relBadge && (
                      <div className="absolute left-2.5 top-2.5 z-20">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${relBadge.colorClasses}`}
                        >
                          <span>{relBadge.icon}</span>
                          <span>{relBadge.label}</span>
                        </span>
                      </div>
                    )}
                    {rel.image_url ? (
                      <Image
                        src={rel.image_url}
                        alt={rel.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                        Sin imagen
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-xs font-semibold md:text-sm text-gray-100 group-hover:text-red-400 transition-colors">
                    {rel.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {rel.platform} · {rel.condition}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {rel.price > 0 ? (
                      <span className="font-display text-sm font-bold text-red-400">
                        ${rel.price.toLocaleString('es-CO')}
                      </span>
                    ) : (
                      <span className="font-display text-xs font-bold uppercase text-emerald-400">
                        Consultar
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 group-hover:text-white">
                      Ver →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
          </div>
        </section>
      )}
    </main>
  )
}
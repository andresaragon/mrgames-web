import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string | null
  platform: string | null
  condition: string
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; platform?: string }>
}) {
  const { q, platform } = await searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let query = supabase
    .from('products')
    .select('id, name, slug, price, image_url, platform, condition')
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }
  if (platform) {
    query = query.eq('platform', platform)
  }
  const { data: products, error } = await query
  if (error) {
    console.error(error)
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
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="font-display mb-6 text-2xl font-bold uppercase tracking-wide md:text-3xl">Catálogo</h2>
        <form action="/" method="get" className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar juego..."
            className="input-field flex-1 min-w-[200px]"
          />
          <select name="platform" defaultValue={platform || ''} className="input-field w-auto min-w-[170px]">
            <option value="">Todas las plataformas</option>
            <option value="Xbox">Xbox</option>
            <option value="PS5">PS5</option>
            <option value="PC">PC</option>
            <option value="Nintendo Switch">Nintendo Switch</option>
          </select>
          <button type="submit" className="btn-primary">
            Buscar
          </button>
        </form>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products?.map((product: Product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="card-glow group block overflow-hidden rounded-xl"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-navy-900">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
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
          ))}
        </div>
      </main>
    </>
  )
}
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductActions from '@/components/ProductActions'
import Image from 'next/image'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, stock, image_url, platform, condition')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error || !product) {
    notFound()
  }
  return (
    <main className="max-w-5xl mx-auto grid gap-8 p-6 md:grid-cols-2 md:p-10">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-navy-700 bg-navy-900 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]">
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
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">Sin imagen</div>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
          {product.platform} · {product.condition}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">{product.name}</h1>
        {product.price > 0 ? (
          <div className="mt-4">
            <span className="text-xs uppercase tracking-wider text-gray-400">Precio de referencia</span>
            <p className="font-display text-3xl font-bold text-red-400">
              ${product.price.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-400">COP</span>
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="font-display text-2xl font-bold text-red-400">
              Precio a consultar
            </p>
            <span className="text-xs text-gray-400">Varía según modalidad (código digital o cuenta compartida)</span>
          </div>
        )}
        <p className="mt-4 leading-relaxed text-gray-300">
          {product.description || "Juego digital original garantizado para Xbox One y Xbox Series X|S. Consulta disponibilidad para entrega inmediata por WhatsApp."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Disponible para entrega / coordinación inmediata
        </div>
        <ProductActions
          id={product.id}
          name={product.name}
          price={product.price}
          slug={product.slug}
          platform={product.platform}
        />
      </div>
    </main>
  )
}
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
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
        <p className="font-display mt-4 text-3xl font-bold text-red-400">
          ${product.price.toLocaleString('es-CO')}
        </p>
        <p className="mt-4 leading-relaxed text-gray-300">{product.description}</p>
        <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
        </p>
        <AddToCartButton id={product.id} name={product.name} price={product.price} slug={product.slug} />
      </div>
    </main>
  )
}
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

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
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-500 mt-1">{product.platform} · {product.condition}</p>
      <p className="text-2xl font-bold mt-4">${product.price.toLocaleString('es-CO')}</p>
      <p className="mt-4 text-gray-300">{product.description}</p>
      <p className="mt-4 text-sm text-gray-500">
        {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
      </p>
    </main>
  )
}
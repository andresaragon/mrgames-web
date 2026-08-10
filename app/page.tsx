import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image_url: string | null
  platform: string | null
  condition: string
}

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url, platform, condition')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Catálogo MrGames</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products?.map((product: Product) => (
          <Link key={product.id} href={`/producto/${product.slug}`} className="border rounded-lg p-4 block hover:border-gray-400">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.platform} · {product.condition}</p>
            <p className="font-bold mt-2">
              ${product.price.toLocaleString('es-CO')}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
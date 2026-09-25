"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"
import { requireAdmin } from "@/utils/supabase/require-admin"

export interface AdminProduct {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  platform: string
  condition: string
  description: string | null
  image_url: string | null
  active: boolean
  created_at: string
}

export interface ProductFilters {
  q?: string
  platform?: string
  status?: string // 'all' | 'active' | 'inactive'
  page?: number
  pageSize?: number
}

// ----------------------------------------------------
// 1. PRODUCTOS: CONSULTA CON FILTROS Y PAGINACIÓN
// ----------------------------------------------------
export async function getAdminProducts(filters: ProductFilters = {}) {
  await requireAdmin()
  const admin = createAdminClient()

  const {
    q = '',
    platform = 'all',
    status = 'all',
    page = 1,
    pageSize = 25,
  } = filters

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('products')
    .select('id, name, slug, price, stock, platform, condition, description, image_url, active, created_at', { count: 'exact' })

  if (q.trim()) {
    query = query.or(`name.ilike.%${q.trim()}%,slug.ilike.%${q.trim()}%`)
  }

  if (platform !== 'all') {
    query = query.eq('platform', platform)
  }

  if (status === 'active') {
    query = query.eq('active', true)
  } else if (status === 'inactive') {
    query = query.eq('active', false)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching admin products:', error)
    throw new Error('Error al cargar productos')
  }

  // Métricas rápidas
  const { count: totalActive } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)

  const { count: totalInactive } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('active', false)

  return {
    products: (data || []) as AdminProduct[],
    totalCount: count || 0,
    totalActive: totalActive || 0,
    totalInactive: totalInactive || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

// ----------------------------------------------------
// 2. EDICIÓN RÁPIDA (PRECIO, STOCK, ACTIVO)
// ----------------------------------------------------
export async function updateProductQuick(
  id: string,
  updates: { price?: number; stock?: number; active?: boolean }
) {
  await requireAdmin()
  const admin = createAdminClient()

  const patch: Record<string, unknown> = {}
  if (typeof updates.price === 'number') patch.price = Math.max(0, updates.price)
  if (typeof updates.stock === 'number') patch.stock = Math.max(0, updates.stock)
  if (typeof updates.active === 'boolean') patch.active = updates.active

  if (Object.keys(patch).length === 0) return

  const { error } = await admin.from('products').update(patch).eq('id', id)
  if (error) {
    console.error('Error in updateProductQuick:', error)
    throw new Error('No se pudo actualizar el producto')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ----------------------------------------------------
// 3. GUARDAR / EDITAR PRODUCTO COMPLETO
// ----------------------------------------------------
export async function saveAdminProduct(productData: {
  id?: string
  name: string
  slug: string
  price: number
  stock: number
  platform: string
  condition: string
  description?: string
  image_url?: string
  active: boolean
}) {
  await requireAdmin()
  const admin = createAdminClient()

  const record = {
    name: productData.name.trim(),
    slug: productData.slug.trim(),
    price: Math.max(0, Number(productData.price) || 0),
    stock: Math.max(0, Number(productData.stock) || 0),
    platform: productData.platform || 'Xbox',
    condition: productData.condition || 'nuevo',
    description: productData.description?.trim() || null,
    image_url: productData.image_url?.trim() || null,
    active: Boolean(productData.active),
  }

  if (productData.id) {
    // Actualizar existente
    const { error } = await admin
      .from('products')
      .update(record)
      .eq('id', productData.id)

    if (error) {
      console.error('Error updating product:', error)
      throw new Error(`Error al actualizar producto: ${error.message}`)
    }
  } else {
    // Insertar nuevo
    const { error } = await admin
      .from('products')
      .insert(record)

    if (error) {
      console.error('Error creating product:', error)
      throw new Error(`Error al crear producto: ${error.message}`)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ----------------------------------------------------
// 4. ELIMINAR PRODUCTO
// ----------------------------------------------------
export async function deleteAdminProduct(id: string) {
  await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) {
    console.error('Error deleting product:', error)
    throw new Error('No se pudo eliminar el producto')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// ----------------------------------------------------
// 5. BÚSQUEDA AUTOMÁTICA DE CARÁTULA EN STEAMGRIDDB
// ----------------------------------------------------
export async function searchCoverSGDB(gameName: string, targetSlug?: string) {
  await requireAdmin()
  const apiKey = process.env.STEAMGRIDDB_API_KEY
  if (!apiKey) {
    throw new Error('STEAMGRIDDB_API_KEY no configurada en el servidor')
  }

  const cleanQuery = gameName
    .replace(/\s*\+\s*.*$/i, '')
    .replace(/\b(deluxe|gold|ultimate|special|revolution|complete|premium|remastered|enhanced)\s+edition\b/gi, '')
    .trim()

  const searchUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(cleanQuery)}`
  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'MrGames/1.0',
    },
  })

  if (!searchRes.ok) {
    throw new Error('Error al conectar con la API de SteamGridDB')
  }

  const searchData = await searchRes.json()
  if (!searchData?.data?.length) {
    throw new Error(`No se encontró ningún juego para "${gameName}"`)
  }

  // Filtrar herramientas/mods
  const candidates = searchData.data.filter((g: { name: string }) => !/tool|mod|server|soundtrack/i.test(g.name))
  const selectedGame = candidates[0] || searchData.data[0]

  // Buscar carátulas 600x900
  const gridsUrl = `https://www.steamgriddb.com/api/v2/grids/game/${selectedGame.id}?dimensions=600x900`
  const gridsRes = await fetch(gridsUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'MrGames/1.0',
    },
  })

  if (!gridsRes.ok) {
    throw new Error('Error al buscar carátulas en SteamGridDB')
  }

  const gridsData = await gridsRes.json()
  if (!gridsData?.data?.length) {
    throw new Error(`No hay carátulas en 600x900 disponibles para "${selectedGame.name}"`)
  }

  const safeGrids = gridsData.data.filter((g: { nsfw?: boolean; humor?: boolean; epilepsy?: boolean }) => !g.nsfw && !g.humor && !g.epilepsy)
  const chosenGrid = safeGrids[0] || gridsData.data[0]

  // Descargar imagen
  const imgRes = await fetch(chosenGrid.url)
  if (!imgRes.ok) {
    throw new Error('Error al descargar la imagen de SteamGridDB')
  }

  const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
  const isPng = chosenGrid.url.toLowerCase().endsWith('.png')
  const ext = isPng ? 'png' : 'jpg'
  const fileSlug = targetSlug || gameName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const storagePath = `covers/${fileSlug}.${ext}`

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('product-images')
    .upload(storagePath, imgBuffer, {
      contentType: isPng ? 'image/png' : 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error subiendo imagen a Supabase Storage:', uploadError)
    throw new Error('Error al subir la imagen al almacenamiento de Supabase')
  }

  const { data: publicUrlData } = admin.storage
    .from('product-images')
    .getPublicUrl(storagePath)

  return {
    matchedName: selectedGame.name,
    imageUrl: publicUrlData.publicUrl,
  }
}

// ----------------------------------------------------
// 6. CERRAR SESIÓN ADMIN
// ----------------------------------------------------
export async function logoutAdmin() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  redirect('/login')
}

// ----------------------------------------------------
// 7. CUENTAS COMPARTIDAS (PREEXISTENTE)
// ----------------------------------------------------
export async function createSharedAccount(formData: {
  platform: string
  identifier: string
  capacity: number
}) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from("shared_accounts").insert({
    platform: formData.platform,
    identifier: formData.identifier,
    capacity: formData.capacity,
  })
  if (error) throw new Error("No se pudo crear la cuenta compartida")
  revalidatePath("/admin")
}

export async function createSlot(formData: {
  sharedAccountId: string
  customerName: string
  customerPhone: string
  startsAt: string
  endsAt: string
}) {
  await requireAdmin()
  const admin = createAdminClient()
  const { data: account } = await admin
    .from("shared_accounts")
    .select("capacity")
    .eq("id", formData.sharedAccountId)
    .single()
  const { count } = await admin
    .from("account_slots")
    .select("id", { count: "exact", head: true })
    .eq("shared_account_id", formData.sharedAccountId)
    .eq("status", "active")
  if (account && count !== null && count >= account.capacity) {
    throw new Error("Esta cuenta ya no tiene cupos disponibles")
  }
  const { error } = await admin.from("account_slots").insert({
    shared_account_id: formData.sharedAccountId,
    customer_name: formData.customerName,
    customer_phone: formData.customerPhone,
    starts_at: formData.startsAt,
    ends_at: formData.endsAt,
    status: "active",
  })
  if (error) throw new Error("No se pudo crear el cupo")
  revalidatePath("/admin")
}
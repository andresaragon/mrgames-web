"use client"
import { useState, useEffect, useCallback, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AdminProduct,
  getAdminProducts,
  updateProductQuick,
  deleteAdminProduct,
} from '@/app/admin/actions'
import ProductModal from '@/components/admin/ProductModal'

interface CatalogManagerProps {
  initialData?: {
    products: AdminProduct[]
    totalCount: number
    totalActive: number
    totalInactive: number
  }
}

export default function CatalogManager({ initialData }: CatalogManagerProps) {
  const [products, setProducts] = useState<AdminProduct[]>(initialData?.products || [])
  const [totalCount, setTotalCount] = useState(initialData?.totalCount || 0)
  const [totalActive, setTotalActive] = useState(initialData?.totalActive || 0)
  const [totalInactive, setTotalInactive] = useState(initialData?.totalInactive || 0)

  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 25

  const [loading, setLoading] = useState(!initialData)
  const [isPending, startTransition] = useTransition()
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modal de creación / edición
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)

  // Precios en edición rápida
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<number | string>('')

  // Stock en edición rápida
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [tempStock, setTempStock] = useState<number | string>('')

  // Debounce para búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [q])

  // Cargar productos
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminProducts({
        q: debouncedQ,
        platform,
        status,
        page,
        pageSize,
      })
      setProducts(res.products)
      setTotalCount(res.totalCount)
      setTotalActive(res.totalActive)
      setTotalInactive(res.totalInactive)
    } catch {
      showNotice('error', 'Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, platform, status, page])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // Toggle Activo / Pausado (Optimistic)
  const handleToggleActive = async (p: AdminProduct) => {
    const newStatus = !p.active
    // Optimistic update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, active: newStatus } : item))
    )
    if (newStatus) {
      setTotalActive((c) => c + 1)
      setTotalInactive((c) => Math.max(0, c - 1))
    } else {
      setTotalActive((c) => Math.max(0, c - 1))
      setTotalInactive((c) => c + 1)
    }

    try {
      await updateProductQuick(p.id, { active: newStatus })
      showNotice('success', `"${p.name}" ahora está ${newStatus ? 'ACTIVO' : 'PAUSADO'}`)
    } catch {
      // Revertir en caso de fallo
      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, active: p.active } : item))
      )
      showNotice('error', 'Error al cambiar estado del juego')
    }
  }

  // Guardar precio rápido
  const handleSavePrice = async (p: AdminProduct) => {
    const num = Number(tempPrice)
    if (isNaN(num) || num < 0) {
      setEditingPriceId(null)
      return
    }
    setEditingPriceId(null)
    if (num === p.price) return

    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, price: num } : item))
    )

    try {
      await updateProductQuick(p.id, { price: num })
      showNotice('success', `Precio actualizado: $${num.toLocaleString('es-CO')} COP`)
    } catch {
      showNotice('error', 'Error al guardar precio')
      loadProducts()
    }
  }

  // Guardar stock rápido
  const handleSaveStock = async (p: AdminProduct) => {
    const num = Number(tempStock)
    if (isNaN(num) || num < 0) {
      setEditingStockId(null)
      return
    }
    setEditingStockId(null)
    if (num === p.stock) return

    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, stock: num } : item))
    )

    try {
      await updateProductQuick(p.id, { stock: num })
      showNotice('success', `Stock actualizado a ${num} unidades`)
    } catch {
      showNotice('error', 'Error al guardar stock')
      loadProducts()
    }
  }

  // Eliminar producto
  const handleDelete = async (p: AdminProduct) => {
    if (!window.confirm(`¿Seguro que deseas eliminar definitivamente "${p.name}" del catálogo?`)) {
      return
    }
    startTransition(async () => {
      try {
        await deleteAdminProduct(p.id)
        showNotice('success', `"${p.name}" eliminado del catálogo`)
        loadProducts()
      } catch {
        showNotice('error', 'Error al eliminar el producto')
      }
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Notificación flotante */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl p-4 shadow-2xl backdrop-blur-md border text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-glow rounded-xl p-4 bg-navy-900/60 border border-navy-700/80">
          <p className="text-xs uppercase font-semibold text-gray-400">Total en Catálogo</p>
          <p className="text-2xl font-bold font-display text-white mt-1">{totalCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Juegos registrados</p>
        </div>
        <div className="card-glow rounded-xl p-4 bg-navy-900/60 border border-navy-700/80">
          <p className="text-xs uppercase font-semibold text-emerald-400">Visibles en Tienda</p>
          <p className="text-2xl font-bold font-display text-emerald-400 mt-1">{totalActive}</p>
          <p className="text-[11px] text-gray-500 mt-1">Disponibles para cotizar</p>
        </div>
        <div className="card-glow rounded-xl p-4 bg-navy-900/60 border border-navy-700/80">
          <p className="text-xs uppercase font-semibold text-gray-400">Pausados</p>
          <p className="text-2xl font-bold font-display text-gray-300 mt-1">{totalInactive}</p>
          <p className="text-[11px] text-gray-500 mt-1">Ocultos del catálogo</p>
        </div>
        <div className="card-glow rounded-xl p-4 bg-navy-900/60 border border-navy-700/80 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-red-400">Acción Rápida</p>
            <p className="text-sm font-semibold text-gray-200 mt-1">Sumar Nuevo Título</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null)
              setIsModalOpen(true)
            }}
            className="btn-primary mt-2 !py-2 !px-3 text-xs w-full"
          >
            ➕ Nuevo Juego
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="rounded-xl border border-navy-700/80 bg-navy-900/50 p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-gray-500">🔍</span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o slug (ej. FC 25, Forza, Elden...)"
              className="input-field pl-9 pr-8 text-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-3 top-3 text-gray-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-1 rounded-lg border border-navy-700 bg-navy-950/60 p-1">
            <button
              type="button"
              onClick={() => { setStatus('all'); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                status === 'all' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => { setStatus('active'); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                status === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => { setStatus('inactive'); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                status === 'inactive' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pausados
            </button>
          </div>
        </div>

        {/* Chips de Plataforma */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs uppercase font-semibold text-gray-500 mr-1">Plataforma:</span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'Xbox', label: 'Xbox' },
            { id: 'PlayStation 5', label: 'PS5' },
            { id: 'Nintendo Switch', label: 'Switch' },
            { id: 'PC', label: 'PC' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPlatform(p.id); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                platform === p.id
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-navy-700/80 bg-navy-900/60 text-gray-400 hover:border-navy-600 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="rounded-xl border border-navy-700/80 bg-navy-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-950/70 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4 w-16">Portada</th>
                <th className="py-3.5 px-4">Juego / Slug</th>
                <th className="py-3.5 px-4 w-28">Consola</th>
                <th className="py-3.5 px-4 w-36">Precio (COP)</th>
                <th className="py-3.5 px-4 w-24">Stock</th>
                <th className="py-3.5 px-4 w-28 text-center">Estado</th>
                <th className="py-3.5 px-4 w-28 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      Cargando catálogo...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No se encontraron videojuegos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-navy-800/40 transition-colors">
                    {/* Portada */}
                    <td className="py-3 px-4">
                      <div className="relative h-14 w-10 overflow-hidden rounded border border-navy-700 bg-navy-950 flex-shrink-0">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-gray-600">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Nombre y Link */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-100">{p.name}</span>
                        <Link
                          href={`/producto/${p.slug}`}
                          target="_blank"
                          title="Ver en tienda"
                          className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                        >
                          ↗
                        </Link>
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
                        {p.slug}
                      </span>
                    </td>

                    {/* Plataforma */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-950/80 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            p.platform === 'Xbox'
                              ? 'bg-emerald-500'
                              : p.platform === 'PlayStation 5'
                              ? 'bg-blue-500'
                              : p.platform === 'Nintendo Switch'
                              ? 'bg-red-500'
                              : 'bg-purple-500'
                          }`}
                        />
                        {p.platform || 'Xbox'}
                      </span>
                    </td>

                    {/* Precio Editable */}
                    <td className="py-3 px-4">
                      {editingPriceId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            autoFocus
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onBlur={() => handleSavePrice(p)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(p)
                              if (e.key === 'Escape') setEditingPriceId(null)
                            }}
                            className="w-24 rounded border border-red-500 bg-navy-950 px-2 py-1 text-xs text-white outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(p.id)
                            setTempPrice(p.price)
                          }}
                          className="group flex items-center gap-1.5 font-semibold text-gray-200 hover:text-red-400 transition-colors"
                          title="Clic para editar precio"
                        >
                          <span>${p.price.toLocaleString('es-CO')}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-500">✏️</span>
                        </button>
                      )}
                    </td>

                    {/* Stock Editable */}
                    <td className="py-3 px-4">
                      {editingStockId === p.id ? (
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          value={tempStock}
                          onChange={(e) => setTempStock(e.target.value)}
                          onBlur={() => handleSaveStock(p)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveStock(p)
                            if (e.key === 'Escape') setEditingStockId(null)
                          }}
                          className="w-14 rounded border border-red-500 bg-navy-950 px-2 py-1 text-xs text-white outline-none text-center"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockId(p.id)
                            setTempStock(p.stock)
                          }}
                          className="group inline-flex items-center gap-1 font-semibold text-gray-300 hover:text-red-400"
                          title="Clic para editar stock"
                        >
                          <span>{p.stock}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-500">✏️</span>
                        </button>
                      )}
                    </td>

                    {/* Toggle Activo */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all border ${
                          p.active
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-navy-950/80 border-navy-700 text-gray-500 hover:text-gray-300'
                        }`}
                        title={p.active ? 'Clic para pausar' : 'Clic para activar'}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${p.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                        {p.active ? 'Activo' : 'Pausado'}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p)
                            setIsModalOpen(true)
                          }}
                          className="rounded p-1.5 text-gray-400 hover:bg-navy-800 hover:text-white transition-colors"
                          title="Editar detalles completos"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(p)}
                          className="rounded p-1.5 text-gray-500 hover:bg-red-950/60 hover:text-red-400 transition-colors"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-navy-700/80 bg-navy-950/70 p-4 text-xs text-gray-400">
          <div>
            Mostrando página <span className="font-bold text-white">{page}</span> de{' '}
            <span className="font-bold text-white">{totalPages}</span> ({totalCount} videojuegos en total)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Crear / Editar */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSaved={() => {
          showNotice('success', selectedProduct ? 'Juego actualizado con éxito' : 'Nuevo juego creado con éxito')
          loadProducts()
        }}
      />
    </div>
  )
}

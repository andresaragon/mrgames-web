"use client"
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AdminProduct, saveAdminProduct, searchCoverSGDB } from '@/app/admin/actions'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: AdminProduct | null
  onSaved: () => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  onSaved,
}: ProductModalProps) {
  const isEditing = Boolean(product?.id)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState<number | string>(99000)
  const [stock, setStock] = useState<number | string>(2)
  const [platform, setPlatform] = useState('Xbox')
  const [condition, setCondition] = useState('nuevo')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [active, setActive] = useState(true)

  const [saving, setSaving] = useState(false)
  const [searchingCover, setSearchingCover] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sgdbFeedback, setSgdbFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setSlug(product.slug || '')
      setPrice(product.price ?? 99000)
      setStock(product.stock ?? 2)
      setPlatform(product.platform || 'Xbox')
      setCondition(product.condition || 'nuevo')
      setDescription(product.description || '')
      setImageUrl(product.image_url || '')
      setActive(product.active ?? true)
    } else {
      setName('')
      setSlug('')
      setPrice(99000)
      setStock(2)
      setPlatform('Xbox')
      setCondition('nuevo')
      setDescription('Juego digital garantizado. Entrega inmediata y soporte guiado por WhatsApp de Mr Games.')
      setImageUrl('')
      setActive(true)
    }
    setError(null)
    setSgdbFeedback(null)
  }, [product, isOpen])

  if (!isOpen) return null

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEditing) {
      setSlug(slugify(val) + (platform !== 'Xbox' ? `-${platform.toLowerCase()}` : '-xbox'))
    }
  }

  const handleSearchCover = async () => {
    if (!name.trim()) {
      setError('Escribe primero el nombre del juego para buscar su carátula')
      return
    }
    setSearchingCover(true)
    setError(null)
    setSgdbFeedback(null)
    try {
      const res = await searchCoverSGDB(name, slug || slugify(name))
      setImageUrl(res.imageUrl)
      setSgdbFeedback(`¡Carátula oficial HD encontrada para "${res.matchedName}" y subida a tu CDN!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo obtener la carátula'
      setError(msg)
    } finally {
      setSearchingCover(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del juego es obligatorio')
      return
    }
    if (!slug.trim()) {
      setError('El slug del juego es obligatorio')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveAdminProduct({
        id: product?.id,
        name,
        slug,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        platform,
        condition,
        description,
        image_url: imageUrl,
        active,
      })
      onSaved()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-navy-700 bg-navy-900/95 p-6 shadow-2xl my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-navy-700/80 pb-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              {isEditing ? 'Editar Videojuego' : 'Agregar Nuevo Videojuego'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {isEditing ? `Modificando ID: ${product?.id}` : 'El juego se sumará al catálogo y estará disponible para consultas'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {sgdbFeedback && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-3 text-sm text-emerald-300">
            {sgdbFeedback}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fila 1: Nombre y Plataforma */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Nombre del Juego *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. EA Sports FC 25"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Plataforma
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="input-field"
              >
                <option value="Xbox">Xbox</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="Nintendo Switch">Nintendo Switch</option>
                <option value="PC">PC</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Slug y Condición */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Slug URL (identificador único) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej-sports-fc-25-xbox"
                className="input-field text-sm font-mono text-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Condición
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="input-field"
              >
                <option value="nuevo">Digital Garantizado (Nuevo)</option>
                <option value="usado">Usado</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Precio, Stock y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Precio (COP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field pl-8 font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Cupos / Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Estado en Tienda
              </label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                  active
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                    : 'bg-navy-800 border-navy-700 text-gray-400'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                {active ? 'Activo (Visible)' : 'Pausado (Oculto)'}
              </button>
            </div>
          </div>

          {/* Sección de Carátula */}
          <div className="rounded-xl border border-navy-700/80 bg-navy-950/40 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Carátula Oficial Box Art (HD 2:3)
              </label>
              <button
                type="button"
                onClick={handleSearchCover}
                disabled={searchingCover || !name.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                {searchingCover ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    Buscando en SteamGridDB...
                  </>
                ) : (
                  '⚡ Auto-buscar en SteamGridDB'
                )}
              </button>
            </div>

            <div className="flex gap-4 items-start">
              {imageUrl ? (
                <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-navy-700 shadow-md">
                  <Image
                    src={imageUrl}
                    alt={name || 'Carátula'}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-28 w-20 flex-shrink-0 flex items-center justify-center rounded-lg border border-dashed border-navy-700 bg-navy-900/50 text-gray-500 text-xs text-center p-1">
                  Sin portada
                </div>
              )}
              <div className="flex-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://...supabase.co/.../covers/juego.png"
                  className="input-field text-xs text-gray-300 font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Puedes buscarla automáticamente con el botón superior o pegar un enlace directo.
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Descripción para la Ficha y WhatsApp
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del juego, garantía y entrega..."
              className="input-field text-sm"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-700/80">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Videojuego'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

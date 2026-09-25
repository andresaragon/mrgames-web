"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"
import { getGameInquiryUrl } from "@/utils/whatsapp"

interface ProductActionsProps {
  id: string
  name: string
  price: number
  slug: string
  platform?: string | null
}

export default function ProductActions({ id, name, price, slug, platform }: ProductActionsProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id, name, price, slug })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const whatsappUrl = getGameInquiryUrl(name, platform)

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Botón Principal: Consulta directa por WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3.5 font-bold text-white shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_28px_-4px_rgba(16,185,129,0.7)] active:scale-[0.98]"
      >
        <svg
          className="h-5 w-5 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.084-2.123-.505-1.579-.652-2.614-2.28-2.695-2.387-.078-.107-.64-8.52-.64-1.626 0-.773.407-1.154.551-1.311.144-.157.316-.197.421-.197.106 0 .212.001.304.005.099.004.23.036.353.332.144.348.494 1.205.536 1.293.042.088.07.191.012.308-.058.118-.088.191-.174.294-.088.103-.186.23-.265.31-.088.089-.18.187-.078.362.102.176.452.746.969 1.208.665.594 1.226.779 1.399.866.174.088.276.073.379-.044.103-.118.439-.513.557-.689.117-.176.235-.147.394-.088.158.058 1.002.472 1.174.559.172.088.287.132.33.205.043.074.043.43-.101.835z" />
        </svg>
        <span>Consultar por WhatsApp</span>
      </a>

      {/* Botón Secundario: Agregar a mi combo */}
      <button
        onClick={handleAdd}
        className="btn-secondary py-3 text-center sm:w-auto"
      >
        {added ? "✓ ¡Agregado a tu combo!" : "+ Agregar a mi combo"}
      </button>
    </div>
  )
}

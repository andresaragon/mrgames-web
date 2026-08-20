"use client"
import { useCart } from '@/context/CartContext'

interface AddToCartButtonProps {
  id: string
  name: string
  price: number
  slug: string
}

export default function AddToCartButton({ id, name, price, slug }: AddToCartButtonProps) {
  const { addItem } = useCart()
  return (
    <button onClick={() => addItem({ id, name, price, slug })} className="btn-primary mt-6 w-full md:w-auto">
      Agregar al carrito
    </button>
  )
}
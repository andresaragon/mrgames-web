"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  addItem as addItemToCart,
  cartTotal,
  parseStoredCart,
  removeItem as removeItemFromCart,
  updateQuantity as updateItemQuantity,
  type CartItem,
} from '@/utils/cart'

export type { CartItem }

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mrgames-cart')
      if (stored) {
        // Hidratar desde localStorage tras montar: leerlo en el render rompería la hidratación SSR.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parseStoredCart(stored))
      }
    } catch (err) {
      console.error('Error al recuperar el carrito de localStorage:', err)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem('mrgames-cart', JSON.stringify(items))
      } catch (err) {
        console.error('Error al guardar el carrito en localStorage:', err)
      }
    }
  }, [items, loaded])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => addItemToCart(prev, item))
  }

  const removeItem = (id: string) => {
    setItems((prev) => removeItemFromCart(prev, id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => updateItemQuantity(prev, id, quantity))
  }

  const clearCart = () => setItems([])

  const total = cartTotal(items)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider')
  }
  return context
}

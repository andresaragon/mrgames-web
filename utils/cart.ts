export type CartItem = {
  id: string
  name: string
  price: number
  slug: string
  quantity: number
}

export function addItem(
  items: CartItem[],
  item: Omit<CartItem, "quantity">
): CartItem[] {
  const exists = items.some((i) => i.id === item.id)
  if (exists) {
    return items.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    )
  }
  return [...items, { ...item, quantity: 1 }]
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((i) => i.id !== id)
}

export function updateQuantity(
  items: CartItem[],
  id: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeItem(items, id)
  }
  return items.map((i) => (i.id === id ? { ...i, quantity } : i))
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as CartItem[]
    }
    return []
  } catch {
    return []
  }
}

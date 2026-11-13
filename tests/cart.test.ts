import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import {
  addItem,
  cartTotal,
  parseStoredCart,
  removeItem,
  updateQuantity,
  type CartItem,
} from "@/utils/cart"

const raiz = path.resolve(__dirname, "..")
const leer = (rel: string) => readFileSync(path.join(raiz, rel), "utf8")

const a: CartItem = { id: "a", name: "Juego A", price: 50000, slug: "juego-a", quantity: 1 }
const b: CartItem = { id: "b", name: "Juego B", price: 80000, slug: "juego-b", quantity: 2 }
const c: CartItem = { id: "c", name: "Juego C", price: 12500, slug: "juego-c", quantity: 3 }

function congelar<T>(valor: T): T {
  if (valor && typeof valor === "object") {
    Object.values(valor).forEach(congelar)
    Object.freeze(valor)
  }
  return valor
}
const sinCantidad = ({ id, name, price, slug }: CartItem) => ({ id, name, price, slug })

describe("addItem (criterios 1 y 2)", () => {
  it("agrega un id nuevo al final con quantity 1 y conserva el orden previo", () => {
    const r = addItem([a, b], sinCantidad(c))
    expect(r.map((i) => i.id)).toEqual(["a", "b", "c"])
    expect(r[2]).toEqual({ ...c, quantity: 1 })
    expect(r[0]).toEqual(a)
    expect(r[1]).toEqual(b)
  })

  it("sobre carrito vacío crea una sola línea", () => {
    expect(addItem([], sinCantidad(a))).toEqual([{ ...a, quantity: 1 }])
  })

  it("con un id existente suma 1 sin duplicar ni mover la línea", () => {
    const r = addItem([a, b, c], sinCantidad(b))
    expect(r.map((i) => i.id)).toEqual(["a", "b", "c"])
    expect(r[1].quantity).toBe(3)
    expect(r[0]).toEqual(a)
    expect(r[2]).toEqual(c)
  })
})

describe("removeItem (criterio 3)", () => {
  it("quita la línea con ese id", () => {
    expect(removeItem([a, b, c], "b")).toEqual([a, c])
  })
  it("con un id inexistente deja los mismos ítems", () => {
    expect(removeItem([a, b], "zzz")).toEqual([a, b])
  })
  it("sobre carrito vacío devuelve vacío", () => {
    expect(removeItem([], "a")).toEqual([])
  })
})

describe("updateQuantity (criterios 4 y 5)", () => {
  it("fija la cantidad exacta (no suma) solo en el ítem indicado", () => {
    const r = updateQuantity([a, b, c], "b", 7)
    expect(r.find((i) => i.id === "b")?.quantity).toBe(7)
    expect(r.find((i) => i.id === "a")).toEqual(a)
    expect(r.find((i) => i.id === "c")).toEqual(c)
    expect(r).toHaveLength(3)
  })
  it("fijar la cantidad actual la deja igual", () => {
    expect(updateQuantity([a, b], "b", 2)).toEqual([a, b])
  })
  it("con un id inexistente no cambia nada", () => {
    expect(updateQuantity([a, b], "zzz", 5)).toEqual([a, b])
  })
  it("cantidad 0 quita la línea", () => {
    expect(updateQuantity([a, b, c], "b", 0)).toEqual([a, c])
  })
  it("cantidad negativa quita la línea", () => {
    expect(updateQuantity([a, b, c], "a", -3)).toEqual([b, c])
  })
  it("cantidad 0 sobre id inexistente no cambia nada", () => {
    expect(updateQuantity([a, b], "zzz", 0)).toEqual([a, b])
  })
})

describe("cartTotal (criterio 6)", () => {
  it("suma price * quantity de todas las líneas", () => {
    expect(cartTotal([a, b, c])).toBe(50000 * 1 + 80000 * 2 + 12500 * 3)
  })
  it("carrito vacío es 0", () => {
    expect(cartTotal([])).toBe(0)
  })
  it("una línea con cantidad 1 es su precio", () => {
    expect(cartTotal([a])).toBe(50000)
  })
})

describe("parseStoredCart (criterio 7)", () => {
  it("null, vacío o JSON inválido dan []", () => {
    expect(parseStoredCart(null)).toEqual([])
    expect(parseStoredCart("")).toEqual([])
    expect(parseStoredCart("{no es json")).toEqual([])
  })
  it("JSON válido que no es arreglo da []", () => {
    for (const raw of ['{"id":"a"}', "42", '"texto"', "null", "true"]) {
      expect(parseStoredCart(raw)).toEqual([])
    }
  })
  it("un arreglo válido se devuelve tal cual y en el mismo orden", () => {
    expect(parseStoredCart(JSON.stringify([b, a]))).toEqual([b, a])
    expect(parseStoredCart("[]")).toEqual([])
  })
  it("ida y vuelta con JSON.stringify", () => {
    const carrito = [a, b, c]
    expect(parseStoredCart(JSON.stringify(carrito))).toEqual(carrito)
  })
})

describe("inmutabilidad (criterio 8)", () => {
  it("ninguna función muta la entrada y las de cambio devuelven un arreglo nuevo", () => {
    const entrada = congelar([structuredClone(a), structuredClone(b)])
    const copia = structuredClone(entrada)

    const r1 = addItem(entrada, sinCantidad(a))
    const r2 = addItem(entrada, sinCantidad(c))
    const r3 = removeItem(entrada, "a")
    const r4 = updateQuantity(entrada, "a", 9)
    const r5 = updateQuantity(entrada, "a", 0)
    const r6 = removeItem(entrada, "zzz")
    const r7 = updateQuantity(entrada, "zzz", 1)

    expect(entrada).toEqual(copia)
    for (const r of [r1, r2, r3, r4, r5, r6, r7]) expect(r).not.toBe(entrada)
    cartTotal(entrada)
    expect(entrada).toEqual(copia)
  })
})

describe("módulo puro y contexto conectado (criterios 9 y 10)", () => {
  it("utils/cart.ts no importa react, next ni supabase", () => {
    const src = leer("utils/cart.ts")
    expect(src).not.toMatch(/from\s+["']react["']/)
    expect(src).not.toMatch(/from\s+["']react\/[^"']*["']/)
    expect(src).not.toMatch(/from\s+["']next(\/[^"']*)?["']/)
    expect(src).not.toMatch(/from\s+["']@supabase\/[^"']*["']/)
    expect(src).not.toMatch(/localStorage/)
  })

  it("CartContext importa @/utils/cart y no duplica la lógica", () => {
    const src = leer("context/CartContext.tsx")
    expect(src).toMatch(/from\s+["']@\/utils\/cart["']/)
    expect(src).not.toContain("prev.find(")
    expect(src).not.toContain("prev.filter(")
    expect(src).not.toContain("reduce(")
  })

  it("CartContext conserva su API pública y la clave de localStorage", () => {
    const src = leer("context/CartContext.tsx")
    expect(src).toContain("mrgames-cart")
    for (const nombre of ["CartProvider", "useCart", "clearCart", "updateQuantity", "removeItem", "addItem"]) {
      expect(src).toContain(nombre)
    }
  })
})

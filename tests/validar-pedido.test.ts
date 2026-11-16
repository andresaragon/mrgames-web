import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { MAX_CANTIDAD, MAX_ITEMS, MAX_TOTAL_UNIDADES, validarPedido } from "@/utils/validar-pedido"

const UUID = "123e4567-e89b-42d3-a456-426614174000"
const base = () => ({
  checkoutId: UUID,
  customerName: "Ana Pérez",
  customerPhone: "300 123 4567",
  paymentMethod: "whatsapp",
  items: [{ id: "juego-1", quantity: 1 }],
})

function falla(entrada: unknown) {
  const r = validarPedido(entrada)
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.error.length).toBeGreaterThan(0)
}

describe("criterio 1: pedido válido", () => {
  it("lo acepta y normaliza nombre y teléfono", () => {
    const r = validarPedido({ ...base(), customerName: "  Ana Pérez  ", customerPhone: "+57 (300) 123-4567" })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.valor.customerName).toBe("Ana Pérez")
      expect(r.valor.customerPhone).toBe("+573001234567")
      expect(r.valor.paymentMethod).toBe("whatsapp")
      expect(r.valor.checkoutId).toBe(UUID)
    }
  })
  it("acepta un pedido sin checkoutId", () => {
    const { checkoutId: _omitido, ...sin } = base()
    void _omitido
    expect(validarPedido(sin).ok).toBe(true)
  })
})

describe("criterio 2: entrada que no es un objeto", () => {
  it.each([null, undefined, "x", 42, []])("rechaza %j", (e) => falla(e))
})

describe("criterio 3: nombre", () => {
  it.each(["", "   ", "A", "x".repeat(81), "Ana\u0000Pérez", "Ana\nPérez", 123, null])("rechaza %j", (n) =>
    falla({ ...base(), customerName: n })
  )
  it("acepta 2 y 80 caracteres", () => {
    expect(validarPedido({ ...base(), customerName: "Al" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerName: "x".repeat(80) }).ok).toBe(true)
  })
})

describe("criterio 4: teléfono celular Colombia", () => {
  it.each([
    "",
    "abc",
    "123456",
    "1234567",
    "6012345678",
    "2001234567",
    "+15551234567",
    "300123456",
    "30012345678",
    "1".repeat(16),
    "300-123-45a7",
    "300+1234567",
    3001234567,
    null,
  ])("rechaza %j", (t) => falla({ ...base(), customerPhone: t }))

  it("acepta celular colombiano con o sin indicativo (+57, 57, 0057) y con caracteres de separación (espacios, guiones, puntos, paréntesis)", () => {
    expect(validarPedido({ ...base(), customerPhone: "3001234567" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "310 987 6543" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "300.123.4567" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "+57 323 504 5163" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "+57.300.123.4567" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "573235045163" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "0057 300 123 4567" }).ok).toBe(true)
    expect(validarPedido({ ...base(), customerPhone: "+57 (300) 123-4567" }).ok).toBe(true)
  })
})

describe("criterio 5: método de pago", () => {
  it.each(["", "efectivo", "ONLINE", null, 1])("rechaza %j", (m) => falla({ ...base(), paymentMethod: m }))
  it("acepta online y whatsapp", () => {
    expect(validarPedido({ ...base(), paymentMethod: "online" }).ok).toBe(true)
    expect(validarPedido({ ...base(), paymentMethod: "whatsapp" }).ok).toBe(true)
  })
})

describe("criterio 6: items", () => {
  it("rechaza lista vacía o que no es lista", () => {
    falla({ ...base(), items: [] })
    falla({ ...base(), items: "juego-1" })
    falla({ ...base(), items: undefined })
  })
  it(`rechaza más de ${MAX_ITEMS} juegos distintos`, () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({ id: `j${i}`, quantity: 1 }))
    falla({ ...base(), items })
    expect(validarPedido({ ...base(), items: items.slice(0, MAX_ITEMS) }).ok).toBe(true)
  })
  it.each(["", "   ", "x".repeat(65), 7, null])("rechaza id %j", (id) =>
    falla({ ...base(), items: [{ id, quantity: 1 }] })
  )
  it.each([0, -1, 1.5, NaN, Infinity, MAX_CANTIDAD + 1, "2", null])("rechaza cantidad %j", (q) =>
    falla({ ...base(), items: [{ id: "juego-1", quantity: q }] })
  )
  it(`acepta cantidad ${MAX_CANTIDAD}`, () => {
    expect(validarPedido({ ...base(), items: [{ id: "juego-1", quantity: MAX_CANTIDAD }] }).ok).toBe(true)
  })
})

describe("criterio 6b: tope global de unidades acumuladas", () => {
  it(`acepta pedidos con hasta ${MAX_TOTAL_UNIDADES} unidades en total`, () => {
    expect(validarPedido({ ...base(), items: [{ id: "j1", quantity: MAX_TOTAL_UNIDADES }] }).ok).toBe(true)
    expect(
      validarPedido({
        ...base(),
        items: [
          { id: "j1", quantity: 5 },
          { id: "j2", quantity: 5 },
        ],
      }).ok
    ).toBe(true)
    expect(
      validarPedido({
        ...base(),
        items: [
          { id: "j1", quantity: 4 },
          { id: "j2", quantity: 3 },
          { id: "j3", quantity: 3 },
        ],
      }).ok
    ).toBe(true)
    const diez = Array.from({ length: MAX_TOTAL_UNIDADES }, (_, i) => ({ id: `j${i}`, quantity: 1 }))
    expect(validarPedido({ ...base(), items: diez }).ok).toBe(true)
  })

  it(`rechaza pedidos que superen ${MAX_TOTAL_UNIDADES} unidades en total`, () => {
    falla({
      ...base(),
      items: [
        { id: "j1", quantity: 6 },
        { id: "j2", quantity: 5 },
      ],
    })
    falla({
      ...base(),
      items: [
        { id: "j1", quantity: 4 },
        { id: "j2", quantity: 4 },
        { id: "j3", quantity: 3 },
      ],
    })
  })
})

describe("criterio 7: ids repetidos", () => {
  it("los fusiona sumando cantidades", () => {
    const r = validarPedido({
      ...base(),
      items: [
        { id: "a", quantity: 2 },
        { id: "b", quantity: 1 },
        { id: "a", quantity: 3 },
      ],
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.valor.items).toHaveLength(2)
      expect(r.valor.items.find((i) => i.id === "a")?.quantity).toBe(5)
      expect(r.valor.items.find((i) => i.id === "b")?.quantity).toBe(1)
    }
  })
  it(`rechaza si la suma supera ${MAX_CANTIDAD}`, () => {
    falla({
      ...base(),
      items: [
        { id: "a", quantity: MAX_CANTIDAD },
        { id: "a", quantity: 1 },
      ],
    })
  })
})

describe("criterio 8: checkoutId", () => {
  it.each(["", "no-es-uuid", "123e4567-e89b-42d3-a456-42661417400", 5, null])("rechaza %j si viene", (c) =>
    falla({ ...base(), checkoutId: c })
  )
})

describe("criterio 9: no se confía en campos extra", () => {
  it("el valor devuelto solo trae los campos conocidos", () => {
    const r = validarPedido({ ...base(), total: 1, status: "paid", items: [{ id: "a", quantity: 1, unit_price: 0 }] })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(Object.keys(r.valor).sort()).toEqual(["checkoutId", "customerName", "customerPhone", "items", "paymentMethod"])
      expect(Object.keys(r.valor.items[0]).sort()).toEqual(["id", "quantity"])
    }
  })
})

describe("criterio 10: createOrder usa el validador", () => {
  const src = readFileSync(path.resolve(__dirname, "../app/checkout/actions.ts"), "utf8")
  it("importa y llama a validarPedido antes de crear el cliente admin", () => {
    expect(src).toMatch(/from\s+["']@\/utils\/validar-pedido["']/)
    const iVal = src.indexOf("validarPedido(")
    const iAdmin = src.indexOf("createAdminClient()")
    expect(iVal).toBeGreaterThan(-1)
    expect(iAdmin).toBeGreaterThan(iVal)
  })
})

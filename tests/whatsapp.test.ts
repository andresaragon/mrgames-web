import { describe, expect, it } from "vitest"

import {
  WHATSAPP_NUMBER,
  getComboInquiryUrl,
  getGameInquiryUrl,
  getGeneralInquiryUrl,
  getQuickComboUrl,
} from "@/utils/whatsapp"

function partes(url: string) {
  const u = new URL(url)
  return { origen: u.origin, ruta: u.pathname, texto: u.searchParams.get("text") ?? "" }
}
const cop = (n: number) => n.toLocaleString("es-CO")

describe("getGameInquiryUrl", () => {
  it("apunta a wa.me con el número del negocio", () => {
    const p = partes(getGameInquiryUrl("Hades"))
    expect(p.origen).toBe("https://wa.me")
    expect(p.ruta).toBe(`/${WHATSAPP_NUMBER}`)
  })

  it("incluye el nombre del juego y la plataforma si viene", () => {
    const t = partes(getGameInquiryUrl("Hades", "PS5")).texto
    expect(t).toContain("Hades")
    expect(t).toContain("para PS5")
  })

  it("sin plataforma (undefined o null) no escribe «para»", () => {
    expect(partes(getGameInquiryUrl("Hades")).texto).not.toContain(" para ")
    expect(partes(getGameInquiryUrl("Hades", null)).texto).not.toContain(" para ")
  })

  it("codifica caracteres especiales y los recupera al decodificar", () => {
    const nombre = "Pokémon & Friends #1 100%"
    const url = getGameInquiryUrl(nombre)
    expect(url).not.toContain(" ")
    expect(url).not.toContain("&Friends")
    expect(partes(url).texto).toContain(nombre)
  })
})

describe("getComboInquiryUrl", () => {
  const items = [
    { name: "Hades", quantity: 1, unit_price: 50000 },
    { name: "Celeste", quantity: 2, unit_price: 30000 },
    { name: "Gratis", quantity: 1 },
  ]

  it("usa los 8 primeros caracteres del id del pedido con #", () => {
    const t = partes(getComboInquiryUrl("abcdef1234567890", items, "Ana")).texto
    expect(t).toContain("#abcdef12)")
    expect(t).not.toContain("abcdef123")
  })

  it("lista cada ítem con cantidad y, si hay unit_price > 0, el precio de referencia total de la línea", () => {
    const lineas = partes(getComboInquiryUrl("id-123456789", items, "Ana")).texto.split("\n")
    expect(lineas).toContain(`- Hades x1 (ref. $${cop(50000)})`)
    expect(lineas).toContain(`- Celeste x2 (ref. $${cop(60000)})`)
    expect(lineas).toContain("- Gratis x1")
  })

  it("unit_price 0 no muestra precio", () => {
    const t = partes(getComboInquiryUrl("id-123456789", [{ name: "X", quantity: 3, unit_price: 0 }], "Ana")).texto
    expect(t).toContain("- X x3")
    expect(t).not.toContain("ref.")
  })

  it("muestra el total solo si es mayor que 0", () => {
    const con = partes(getComboInquiryUrl("id-123456789", items, "Ana", 110000)).texto
    expect(con).toContain(`Total de referencia: $${cop(110000)}`)
    expect(partes(getComboInquiryUrl("id-123456789", items, "Ana", 0)).texto).not.toContain("Total de referencia")
    expect(partes(getComboInquiryUrl("id-123456789", items, "Ana")).texto).not.toContain("Total de referencia")
    expect(partes(getComboInquiryUrl("id-123456789", items, "Ana", -1000)).texto).not.toContain("Total de referencia")
  })

  it("recorta el nombre del cliente", () => {
    const t = partes(getComboInquiryUrl("id-123456789", items, "  Ana Pérez  ")).texto
    expect(t).toContain("Nombre: Ana Pérez")
    expect(t).not.toContain("Nombre:  Ana")
  })

  it("termina pidiendo confirmación de disponibilidad", () => {
    const t = partes(getComboInquiryUrl("id-123456789", items, "Ana")).texto
    expect(t.trimEnd().endsWith("?")).toBe(true)
    expect(t).toContain("disponibilidad")
  })

  it("el orden es: saludo, ítems, total, nombre", () => {
    const t = partes(getComboInquiryUrl("id-123456789", items, "Ana", 110000)).texto
    const i = (s: string) => t.indexOf(s)
    expect(i("Solicitud")).toBeLessThan(i("- Hades"))
    expect(i("- Gratis")).toBeLessThan(i("Total de referencia"))
    expect(i("Total de referencia")).toBeLessThan(i("Nombre:"))
  })
})

describe("getGeneralInquiryUrl", () => {
  it("sin mensaje usa el texto por defecto sobre el catálogo", () => {
    const p = partes(getGeneralInquiryUrl())
    expect(p.ruta).toBe(`/${WHATSAPP_NUMBER}`)
    expect(p.texto).toContain("catálogo")
  })

  it("con mensaje propio lo usa tal cual", () => {
    expect(partes(getGeneralInquiryUrl("Hola, ¿envían a Cali?")).texto).toBe("Hola, ¿envían a Cali?")
  })
})

describe("getQuickComboUrl", () => {
  const items = [
    { name: "Hades", quantity: 1 },
    { name: "Celeste", quantity: 2, price: 30000 },
  ]

  it("lista nombre y cantidad sin precios por línea", () => {
    const lineas = partes(getQuickComboUrl(items)).texto.split("\n")
    expect(lineas).toContain("- Hades x1")
    expect(lineas).toContain("- Celeste x2")
    expect(partes(getQuickComboUrl(items)).texto).not.toContain("30")
  })

  it("muestra «Total ref» solo con total > 0", () => {
    expect(partes(getQuickComboUrl(items, 60000)).texto).toContain(`Total ref: $${cop(60000)}`)
    expect(partes(getQuickComboUrl(items, 0)).texto).not.toContain("Total ref")
    expect(partes(getQuickComboUrl(items)).texto).not.toContain("Total ref")
    expect(partes(getQuickComboUrl(items, -1000)).texto).not.toContain("Total ref")
  })

  it("pregunta por el descuento del combo y apunta al número del negocio", () => {
    const p = partes(getQuickComboUrl(items))
    expect(p.ruta).toBe(`/${WHATSAPP_NUMBER}`)
    expect(p.texto).toContain("descuento")
  })

  it("con carrito vacío sigue generando un enlace válido", () => {
    expect(() => new URL(getQuickComboUrl([]))).not.toThrow()
  })
})

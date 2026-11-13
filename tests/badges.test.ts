import { describe, expect, it } from "vitest"

import { getProductBadge } from "@/utils/badges"

describe("getProductBadge — Top Ventas", () => {
  it.each(["GTA V", "Grand Theft Auto VI", "FC 25", "EA Sports FC 24", "Call of Duty: Modern Warfare", "Minecraft", "Elden Ring", "Game Pass Ultimate", "Steam Wallet 20 USD"])(
    "%s es Top Ventas",
    (nombre) => {
      expect(getProductBadge(nombre, 250000)?.label).toBe("Top Ventas")
    }
  )

  it("ignora mayúsculas y minúsculas", () => {
    expect(getProductBadge("MINECRAFT")?.label).toBe("Top Ventas")
    expect(getProductBadge("minecraft")?.label).toBe("Top Ventas")
  })

  it("no depende del precio", () => {
    expect(getProductBadge("Minecraft", 0)?.label).toBe("Top Ventas")
    expect(getProductBadge("Minecraft", 500000)?.label).toBe("Top Ventas")
  })

  it("devuelve ícono y clases de color no vacíos", () => {
    const b = getProductBadge("Minecraft")
    expect(b?.icon).toBe("🔥")
    expect(b?.colorClasses.length).toBeGreaterThan(0)
  })
})

describe("getProductBadge — Destacado", () => {
  it.each(["Cyberpunk Deluxe Edition", "Starfield Ultimate", "Witcher Game of the Year", "Mafia Definitive Edition", "Uncharted Remastered", "Borderlands Complete"])(
    "%s es Destacado",
    (nombre) => {
      expect(getProductBadge(nombre, 250000)?.label).toBe("Destacado")
    }
  )

  it("Destacado gana a Ideal Combo aunque el precio sea bajo", () => {
    expect(getProductBadge("Cyberpunk Deluxe", 50000)?.label).toBe("Destacado")
  })

  it("Top Ventas gana a Destacado", () => {
    expect(getProductBadge("Minecraft Deluxe Edition", 50000)?.label).toBe("Top Ventas")
  })

  it("usa el ícono ⭐", () => {
    expect(getProductBadge("Algo Deluxe")?.icon).toBe("⭐")
  })
})

describe("getProductBadge — Ideal Combo", () => {
  it("precio de 1 a 99000 (inclusive) sin otra señal es Ideal Combo", () => {
    expect(getProductBadge("Juego Cualquiera", 1)?.label).toBe("Ideal Combo")
    expect(getProductBadge("Juego Cualquiera", 50000)?.label).toBe("Ideal Combo")
    expect(getProductBadge("Juego Cualquiera", 99000)?.label).toBe("Ideal Combo")
  })

  it("99001 ya no es Ideal Combo", () => {
    expect(getProductBadge("Juego Cualquiera", 99001)).toBeNull()
  })

  it("usa el ícono 🎁", () => {
    expect(getProductBadge("Juego Cualquiera", 50000)?.icon).toBe("🎁")
  })
})

describe("getProductBadge — sin badge", () => {
  it("precio 0 por defecto y sin señales → null", () => {
    expect(getProductBadge("Juego Cualquiera")).toBeNull()
    expect(getProductBadge("Juego Cualquiera", 0)).toBeNull()
  })

  it("precio negativo → null", () => {
    expect(getProductBadge("Juego Cualquiera", -5000)).toBeNull()
  })

  it("precio alto sin señales → null", () => {
    expect(getProductBadge("Juego Cualquiera", 250000)).toBeNull()
  })

  it("nombre vacío: solo el precio decide", () => {
    expect(getProductBadge("", 50000)?.label).toBe("Ideal Combo")
    expect(getProductBadge("", 0)).toBeNull()
  })
})

describe("getProductBadge — los tres badges son distintos", () => {
  it("cada nivel devuelve etiqueta, ícono y clases propias", () => {
    const top = getProductBadge("Minecraft")!
    const dest = getProductBadge("Algo Deluxe")!
    const combo = getProductBadge("Juego Cualquiera", 50000)!
    expect(new Set([top.label, dest.label, combo.label]).size).toBe(3)
    expect(new Set([top.icon, dest.icon, combo.icon]).size).toBe(3)
    expect(new Set([top.colorClasses, dest.colorClasses, combo.colorClasses]).size).toBe(3)
  })
})

export interface ProductBadge {
  label: string
  icon: string
  colorClasses: string
}

/**
 * Determina dinámicamente si un videojuego califica para un badge visual de conversión:
 * - 🔥 Top Ventas (franquicias más jugadas y demandadas)
 * - ⭐ Destacado (ediciones Deluxe, Definitive, GotY o remasterizadas)
 * - 🎁 Ideal Combo (juegos con precio de referencia óptimo para paquetes)
 */
export function getProductBadge(name: string, price: number = 0): ProductBadge | null {
  const lower = name.toLowerCase()

  // 1. Franquicias Top Ventas en Colombia
  const topSellers = [
    'gta',
    'grand theft auto',
    'fifa',
    'ea sports',
    'fc 24',
    'fc 25',
    'call of duty',
    'black ops',
    'warzone',
    'minecraft',
    'red dead',
    'mortal kombat',
    'mario',
    'zelda',
    'pokemon',
    'spider-man',
    'god of war',
    'resident evil',
    'forza',
    'halo',
    'elden ring',
    'hogwarts',
    'dragon ball',
    'naruto',
    'batman',
    'the last of us',
    'crash bandicoot',
    'far cry',
    'battlefield',
    'game pass',
    'steam wallet',
  ]

  if (topSellers.some((term) => lower.includes(term))) {
    return {
      label: 'Top Ventas',
      icon: '🔥',
      colorClasses:
        'border-amber-500/50 bg-amber-950/80 text-amber-300 shadow-[0_2px_12px_-2px_rgba(245,158,11,0.5)]',
    }
  }

  // 2. Ediciones especiales y remasterizadas
  if (
    lower.includes('deluxe') ||
    lower.includes('ultimate') ||
    lower.includes('game of the year') ||
    lower.includes('definitive') ||
    lower.includes('remastered') ||
    lower.includes('complete')
  ) {
    return {
      label: 'Destacado',
      icon: '⭐',
      colorClasses:
        'border-red-500/50 bg-red-950/80 text-red-300 shadow-[0_2px_12px_-2px_rgba(255,43,86,0.5)]',
    }
  }

  // 3. Títulos idóneos para armar combo con bonos comerciales
  if (price > 0 && price <= 99000) {
    return {
      label: 'Ideal Combo',
      icon: '🎁',
      colorClasses:
        'border-emerald-500/50 bg-emerald-950/80 text-emerald-300 shadow-[0_2px_12px_-2px_rgba(16,185,129,0.5)]',
    }
  }

  return null
}

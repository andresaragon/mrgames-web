---
name: Mr Games
description: Showroom oscuro de videojuegos con neón carmesí; las carátulas llevan el protagonismo y WhatsApp es la acción.
colors:
  navy-950: "#050811"
  navy-900: "#0a0f1d"
  navy-800: "#0f172a"
  navy-700: "#1e293b"
  red-700: "#c9183b"
  red-600: "#e61944"
  red-500: "#ff2b56"
  red-400: "#ff5277"
  foreground: "#f3f4f6"
  emerald-400: "#34d399"
typography:
  display:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.025em"
  headline:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.red-500}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.red-400}"
  button-secondary:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-field:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "12px"
  card-glow:
    backgroundColor: "{colors.navy-900}"
    rounded: "{rounded.xl}"
---

# Design System: Mr Games

## Overview

**Creative North Star: "La Sala de Arcade"**

Un salón oscuro donde cada carátula brilla como una pantalla encendida y el rojo neón señala dónde actuar. El fondo medianoche (#050811) desaparece para que el catálogo hable; el carmesí aparece solo donde hay decisión: el botón, el precio, el hover.

La densidad es de vitrina: rejillas de carátulas verticales 2:3, tipografía display condensada para títulos y precios, y texto de apoyo sobrio. Pensado para pulgar en móvil primero. La voz visual es de gamer cercano, no corporativa.

**Key Characteristics:**
- Oscuro en capas: superficies navy planas, brillo carmesí como respuesta a la interacción.
- Carátulas como protagonista; el chrome de la interfaz se queda atrás.
- Display condensado en mayúsculas para títulos, precios y etiquetas de acción.
- Verde esmeralda reservado para disponibilidad/consulta y WhatsApp.

## Colors

Paleta de dos mundos: medianoche azulada para superficies y carmesí neón para acción.

### Primary
- **Carmesí Neón** (#ff2b56): botón principal, acento de títulos, highlights de marca.
- **Carmesí Profundo** (#e61944): extremo oscuro del degradado del botón, selección de texto, badges de conteo.
- **Carmesí Brasa** (#c9183b): estados pulsados y fondos de alerta sutiles.
- **Carmesí Suave** (#ff5277): precios, enlaces y hover de texto sobre fondo oscuro.

### Secondary
- **Esmeralda Consulta** (#34d399): indicador de disponibilidad, estados "Consultar" y señales de WhatsApp/éxito.

### Neutral
- **Medianoche Espacial** (#050811): fondo de página.
- **Navy Profundo** (#0a0f1d): tarjetas, campos de formulario, bandas de sección.
- **Navy Tinta** (#0f172a): header y superficies elevadas.
- **Navy Borde** (#1e293b): bordes, divisores, thumb de scrollbar.
- **Blanco Humo** (#f3f4f6): texto principal. Texto de apoyo en grises de Tailwind (gray-300/400/500).

### Named Rules
**The One Signal Rule.** El carmesí marca acción o precio. Si todo es rojo, nada lo es.
**The Green Is WhatsApp Rule.** El esmeralda se reserva para WhatsApp y disponibilidad; nunca decora.

## Typography

**Display Font:** Rajdhani (600/700, con sans-serif)
**Body Font:** Geist (con sans-serif)
**Label/Mono Font:** Geist Mono, solo si se necesita código o datos tabulares.

**Character:** Rajdhani aporta el aire técnico de interfaz de juego en títulos y precios; Geist mantiene la lectura limpia en móvil.

### Hierarchy
- **Display** (700, clamp 2.25–3.75rem, 1.1): título del hero, mayúsculas, tracking amplio.
- **Headline** (700, 1.5–1.875rem, 1.2): títulos de sección como "Catálogo", mayúsculas.
- **Title** (600, 1rem, 1.4): nombre del juego en tarjeta, dos líneas máximo.
- **Body** (400, 0.875rem, 1.6): descripciones y ayudas, líneas de 65ch o menos.
- **Label** (700, 0.625–0.75rem, 0.1em, mayúsculas): badges, kickers, estados.

### Named Rules
**The Price Is Display Rule.** Los precios van en Rajdhani carmesí suave; es lo primero que se escanea después de la carátula.

## Layout

Contenedor centrado de 72rem (max-w-6xl) con gutter de 16px en móvil y 24px en escritorio. El catálogo es una rejilla de 2 columnas en móvil, 3 en sm y 4 en md, con huecos de 16px. Las secciones respiran con 48–96px verticales. Header pegajoso arriba; botón flotante de WhatsApp abajo a la derecha, siempre visible. Móvil primero.

## Elevation & Depth

Híbrido: superficies planas por tonos (navy 950 → 700) y sombras de brillo carmesí solo como respuesta (hover, botón primario). La profundidad se transmite con capas oscuras y bordes finos, no con sombras negras.

### Shadow Vocabulary
- **Glow de acción** (`box-shadow: 0 4px 24px -4px rgba(255,43,86,0.5)`): botón primario en reposo; sube a 0.7 y 32px en hover.
- **Glow de tarjeta** (`box-shadow: 0 8px 32px -8px rgba(255,43,86,0.35)`): tarjeta de juego en hover, con elevación de -4px.
- **Sombra de header** (`0 2px 20px -4px rgba(0,0,0,0.6)`): separa el header pegajoso.

### Named Rules
**The Glow Is A Response Rule.** En reposo las superficies son planas; el brillo aparece al interactuar o en la acción principal.

## Shapes

Esquinas suaves y consistentes: 8px en botones y campos, 12–16px en tarjetas y bloques, píldora completa en badges y botón flotante. Bordes de 1px en navy-700; en hover, carmesí a 50% de opacidad. Las carátulas conservan su proporción 2:3.

## Components

### Buttons
- **Shape:** esquina suave (8px).
- **Primary:** degradado vertical de #ff2b56 a #e61944, texto blanco en negrita, 12×24px, con glow carmesí.
- **Hover / Focus:** brillo +10% y glow más amplio; en pulsación escala 0.97.
- **Secondary:** fondo navy-900 al 60%, borde navy-700, texto gris claro; en hover el borde pasa a carmesí al 60%.

### Chips (filtros de consola)
- **Style:** píldoras con borde navy; la seleccionada se rellena en carmesí. Fila con scroll horizontal sin barra.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** navy-900 al 40% con desenfoque leve.
- **Shadow Strategy:** glow de tarjeta solo en hover, con elevación de -4px.
- **Border:** 1px navy-700 al 80%; carmesí al 50% en hover.
- **Internal Padding:** 12px móvil, 16px escritorio.

### Inputs / Fields
- **Style:** borde navy-700, fondo navy-900 al 50%, radio 8px, padding 12px.
- **Focus:** borde carmesí y anillo carmesí al 30%.

### Navigation
- Header pegajoso en navy-800 al 90% con desenfoque, borde inferior carmesí al 20%; logo con "Mr" blanco y "Games" carmesí en Rajdhani mayúsculas. Enlaces en mayúsculas pequeñas que pasan a carmesí suave en hover. El contador del combo es un círculo carmesí sobre el carrito.

### Botón flotante de WhatsApp (signature)
- Píldora esmeralda fija abajo a la derecha, con punto verde pulsante; cambia a "Cotizar combo (N juegos)" al agregar títulos.

### Badges de carátula (signature)
- Píldoras de 10px en mayúsculas ("Top Ventas", "Favoritos", "Ideal Combo") sobre la esquina superior izquierda de la carátula, con desenfoque.

## Do's and Don'ts

### Do:
- **Do** usar #ff2b56 solo para acción, precio y énfasis puntual.
- **Do** dejar que las carátulas 2:3 ocupen el protagonismo en rejillas de 2 columnas en móvil.
- **Do** poner títulos y precios en Rajdhani, y la lectura en Geist.
- **Do** reservar el glow para el botón primario y estados hover.
- **Do** mantener el esmeralda para WhatsApp y disponibilidad.

### Don't:
- **Don't** usar fondos claros ni blancos: el sistema es oscuro.
- **Don't** aplicar glow en reposo sobre superficies decorativas.
- **Don't** usar más de un acento fuerte por pantalla.
- **Don't** inventar urgencia, stock ni testimonios (ver PRODUCT.md).
- **Don't** cortar ni deformar las carátulas.

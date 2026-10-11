# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Gamers colombianos que llegan desde Facebook, Instagram o WhatsApp, principalmente desde el celular. Quieren ver carátulas y precios de referencia en COP y consultar rápido por WhatsApp. Tienden a desconfiar de comprar juegos digitales por internet.

## Product Purpose
Mr Games es una tienda virtual de videojuegos digitales (Xbox, PS5, PC, Switch) en Colombia. El sitio funciona como showroom visual: el comprador explora el catálogo, arma un combo y consulta por WhatsApp. El éxito es que el visitante inicie una conversación de WhatsApp con un juego o combo ya elegido.

## Positioning
Atención humana por WhatsApp con instalación guiada y garantía, en lugar de checkout automático. Se cotiza el combo y se cierra con una persona; bonos y tarifas especiales por llevar dos o más títulos.

## Operating Context
- Sin pago en línea: las solicitudes se registran en Supabase como cotizaciones coordinadas, sin bloqueo rígido de stock.
- Canales de adquisición: fanpage «Mr Games Colombia» (Facebook, publicación automática vía n8n) e Instagram.
- Dominio de producción: mrgames.com.co en Cloudflare Workers.
- WhatsApp Business oficial: +57 323 504 5163.
- Panel `/admin` para gestionar el catálogo.

## Capabilities and Constraints
- Next.js (versión con cambios rupturosos; leer `node_modules/next/dist/docs/` antes de codificar), Tailwind 4, Supabase, OpenNext/Cloudflare.
- Catálogo de unos 678 productos activos, con paginación server-side (24 por página), búsqueda con debounce y filtros por consola.
- Ficha de producto con OpenGraph dinámico para tarjetas en WhatsApp.
- Carrito reconvertido en «Armar combo» con barra de progreso de bonos.
- Botón flotante de WhatsApp reactivo al combo.
- Política de privacidad bajo la Ley 1581 (Colombia).

## Brand Commitments
- Voz en español colombiano, tuteo cercano.
- Sin restricciones visuales fijas confirmadas (la paleta carmesí/medianoche actual es la implementación vigente, no un compromiso binding).

## Evidence on Hand
- Catálogo real con carátulas HD en Supabase Storage.
- Catálogo oficial en PDF con etiqueta «Consultar».
- Existen testimonios reales de clientes, pendientes de entregar por el dueño. Usar solo esos; nunca redactar ni inventar testimonios, cifras de ventas o reseñas.

## Product Principles
1. Todo camino lleva a una conversación de WhatsApp con la menor fricción posible desde el celular.
2. La confianza se gana con transparencia: pasos claros, garantía visible, trato humano.
3. El catálogo es el protagonista: las carátulas y el precio se leen de un vistazo.
4. Incentivar el combo (2+ juegos) sin presionar ni inventar urgencia.
5. Nunca afirmar lo que no esté confirmado (stock, garantía, testimonios).

## Accessibility & Inclusion
Uso predominante en móvil con conexiones variables en Colombia: rendimiento y legibilidad en pantallas pequeñas son requisitos. No se estableció un estándar formal de accesibilidad.

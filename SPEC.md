# SPEC — Validación estricta del pedido en checkout (`createOrder`)

## Contexto
`app/checkout/actions.ts` (`createOrder`, server action) recibe datos del cliente y del carrito desde el navegador. Hoy solo comprueba que nombre y teléfono no estén vacíos y que `quantity` sea entero > 0. No limita longitudes, formato de teléfono, cantidades máximas, tamaño del carrito, ids repetidos, `paymentMethod` ni `checkoutId`. Es una ruta de pagos y datos de clientes (inserta con el cliente admin de Supabase).

## Alcance
1. Crear `utils/validar-pedido.ts` (módulo **puro**: sin imports de Next, Supabase ni `process.env`) que exporte:
   - `MAX_ITEMS = 20`, `MAX_CANTIDAD = 10`.
   - `validarPedido(entrada: unknown): { ok: true; valor: PedidoValido } | { ok: false; error: string }`.
   - `PedidoValido = { checkoutId?: string; customerName: string; customerPhone: string; paymentMethod: "online" | "whatsapp"; items: { id: string; quantity: number }[] }`.
2. `createOrder` llama a `validarPedido(input)` **antes** de `createAdminClient()`, lanza `new Error(error)` si `ok` es false y desde ahí usa solo `valor` (no `input`). Se conserva el resto del comportamiento (idempotencia, precios desde la base, fallback de `checkout_id`).
3. `error` es un mensaje en español, no vacío, sin datos sensibles.

## Reglas (Criterios de aceptación; cada uno tiene tests en `tests/validar-pedido.test.ts`)
1. Pedido válido → `ok: true`; `customerName` se devuelve recortado (`trim`); `customerPhone` se normaliza quitando espacios, guiones y paréntesis, conservando un `+` inicial (`"+57 (300) 123-4567"` → `"+573001234567"`); `checkoutId` es opcional.
2. Entrada que no es objeto (null, undefined, string, número, array) → `ok: false`.
3. Nombre: string de 2 a 80 caracteres tras `trim`, sin caracteres de control (`\u0000`–`\u001f`, `\u007f`). Otro tipo o fuera de rango → `ok: false`.
4. Teléfono: tras normalizar, `+` opcional y de 7 a 15 dígitos exactos. Letras, `+` en medio, menos de 7 o más de 15 dígitos, o tipo no string → `ok: false`.
5. `paymentMethod` debe ser exactamente `"online"` o `"whatsapp"` (sensible a mayúsculas).
6. `items`: arreglo de 1 a `MAX_ITEMS` elementos (tras fusionar repetidos); `id` string no vacío (tras `trim`) de hasta 64 caracteres; `quantity` entero de 1 a `MAX_CANTIDAD` (rechaza 0, negativos, decimales, NaN, Infinity, strings, null).
7. Ids repetidos se fusionan sumando cantidades; si la suma supera `MAX_CANTIDAD` → `ok: false`.
8. `checkoutId`, si viene (incluso `null` o `""`), debe ser un UUID (`8-4-4-4-12` hexadecimal) → si no, `ok: false`. Ausente (`undefined`) es válido.
9. El `valor` devuelto contiene **solo** las claves conocidas (`checkoutId`*, `customerName`, `customerPhone`, `paymentMethod`, `items[{id, quantity}]`): campos extra como `total`, `status` o `unit_price` se descartan. (*`checkoutId` solo si vino.)
10. `app/checkout/actions.ts` importa `@/utils/validar-pedido` y llama `validarPedido(` antes de `createAdminClient()`.

## Fuera de alcance
`app/checkout/page.tsx` (tiene un error de lint previo no relacionado), UI, migraciones de Supabase, el resto de acciones, límites de tasa. No añadir dependencias. No cambiar `package.json` ni `vitest.config.ts` (ya están listos).

## Comandos
- Tests: `npx vitest run` (alias `npm test`).
- Lint (acotado; el repo tiene 21 errores previos fuera de alcance): `npx eslint app/checkout/actions.ts utils/validar-pedido.ts`.
- Build: `npx next build`.
- `tsc --noEmit` NO es puerta: falla de antes en `app/layout.tsx` (`LayoutProps`).

## Protegidos (solo lectura)
`SPEC.md`, `tests/validar-pedido.test.ts`, `vitest.config.ts`, `package.json`, `package-lock.json`.

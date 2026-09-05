# Especificación Técnica Maestra — MRGames v1.1

**Estado:** Diseño listo para implementación controlada  
**Objetivo:** endurecimiento de seguridad, integridad transaccional y robustez del checkout.  
**Regla:** este documento es el contrato de implementación para Harness. No autoriza por sí solo cambios en producción.

---

## 0. Propósito y regla de trabajo

MRGames debe evolucionar mediante cambios pequeños, verificables y reversibles.

Harness deberá:
- analizar antes de modificar;
- respetar `AGENTS.md` y `CLAUDE.md`;
- no improvisar decisiones de arquitectura;
- no modificar producción directamente;
- crear migraciones versionadas para cambios de Supabase;
- ejecutar pruebas antes de considerar una fase terminada;
- detenerse ante datos incompatibles, migraciones destructivas o decisiones no resueltas.

---

# 1. Baseline verificado

Esta sección contiene hechos obtenidos mediante auditoría directa del repositorio y del proyecto Supabase de MRGames. Harness debe tratarlos como contexto verificado y no volver a presentarlos como hipótesis.

## 1.1 Aplicación

El proyecto utiliza:
- Next.js
- React
- TypeScript
- Tailwind
- Supabase
- Server Actions
- Cloudflare/OpenNext

El repositorio contiene `AGENTS.md` y `CLAUDE.md`.

## 1.2 Supabase

Se verificó:
- las tablas principales tienen RLS habilitado;
- existen políticas RLS sobre las tablas principales;
- `account_slots` tiene una política SELECT para `authenticated` con condición amplia;
- `shared_accounts` tiene una política SELECT para `authenticated` con condición amplia;
- `decrement_stock(uuid, integer)` existe;
- `decrement_stock` no es `SECURITY DEFINER`;
- la función actual actualiza stock condicionando `stock >= p_quantity`;
- la función no valida explícitamente `p_quantity > 0`;
- `EXECUTE` de `decrement_stock` está concedido a `PUBLIC`, `anon`, `authenticated` y `service_role`;
- `products.stock` no tiene actualmente un CHECK explícito `stock >= 0`;
- `order_items.quantity` sí tiene CHECK `quantity > 0`;
- existen foreign keys entre las entidades principales;
- no se detectaron triggers personalizados en las tablas `public` durante la auditoría;
- existen grants amplios para `anon`/`authenticated` sobre tablas principales.

### Importante sobre `decrement_stock`

El hecho de que la función tenga `EXECUTE` para varios roles NO significa por sí mismo que cualquier usuario pueda modificar stock. La capacidad efectiva depende de permisos de tabla, RLS y del contexto de ejecución.

Sí está confirmado que el checkout actual la utiliza desde backend privilegiado y que la ausencia de validación de cantidad negativa debe corregirse.

---

# 2. Problemas confirmados

## P0 — Autorización administrativa

Actualmente la autenticación no equivale a autorización administrativa.

Debe existir un mecanismo explícito de rol `admin`.

## P0 — Uso de `service_role`

Existen operaciones que utilizan privilegios elevados y deben revisarse individualmente.

No eliminar usos legítimos automáticamente; clasificar cada uso como:
- NECESARIO
- REEMPLAZABLE
- ELIMINABLE

## P0 — Checkout no atómico

La secuencia actual separa operaciones de inventario y creación de pedido.

Debe convertirse en una operación transaccional.

## P0 — Cantidades negativas

El flujo no debe permitir cantidades negativas que puedan provocar efectos no deseados sobre inventario.

La protección debe existir en:
- frontend;
- Server Action;
- PostgreSQL/RPC.

## P0 — Inventario

Agregar protección para que:

`products.stock >= 0`

## P0 — Idempotencia

No existe actualmente una garantía suficiente para impedir pedidos duplicados ante reintentos.

## P1 — Account slots

La asignación basada en `COUNT → INSERT` presenta riesgo de carrera bajo concurrencia.

## P1 — Exposición administrativa

`shared_accounts` y `account_slots` no deben estar disponibles indiscriminadamente para usuarios autenticados.

## P1 — GRANTs

Los privilegios concedidos a `anon` y `authenticated` deben reducirse al mínimo funcional.

---

# 3. Arquitectura objetivo

```text
Browser
  ↓
Next.js
  ↓
Server Action
  ↓
Supabase
  ↓
RLS / Constraints / RPC
  ↓
PostgreSQL
```

Las reglas críticas deben existir en más de una capa.

El navegador nunca será autoridad para:
- precio;
- stock;
- rol;
- autorización;
- total final;
- estado de pedido.

---

# 4. Modelo de autorización

Crear:

`public.user_roles`

Campos conceptuales:

- `user_id uuid`
- `role text`
- `created_at timestamptz`

`user_id` referencia `auth.users.id` y es PRIMARY KEY.

Inicialmente sólo se requiere el rol:

`admin`

La ausencia de registro significa usuario normal.

Un usuario NO puede autoasignarse `admin`.

---

# 5. Función `is_admin()`

Crear función central basada en:

`auth.uid() → user_roles → role = admin`

Requisitos:
- no confiar en información del cliente;
- evitar recursión de RLS;
- utilizar `SECURITY DEFINER` sólo si es necesario;
- si se utiliza `SECURITY DEFINER`, fijar un `search_path` seguro;
- restringir permisos;
- documentar propietario y comportamiento.

---

# 6. `requireAdmin()`

Las Server Actions administrativas deben utilizar una comprobación equivalente a:

`requireAdmin()`

No basta:

`requireUser()`

La protección debe cubrir:
- `/admin`;
- acciones administrativas;
- operaciones administrativas directas.

---

# 7. RLS objetivo

## products

Público:
- SELECT de productos activos.

No permitir escrituras públicas.

## orders

Un usuario sólo podrá acceder a sus propios pedidos cuando exista una relación fiable entre pedido y usuario.

Antes de introducir `orders.user_id`, verificar datos existentes y compatibilidad histórica.

## order_items

El acceso debe estar condicionado por la autorización del pedido correspondiente.

## shared_accounts

Eliminar el modelo de acceso indiscriminado de usuarios autenticados.

## account_slots

Eliminar el modelo de lectura indiscriminada.

Los administradores tendrán acceso operacional según necesidad.

---

# 8. GRANTs

Revisar cada combinación:

`rol → tabla → operación`

para:
- `anon`
- `authenticated`
- `service_role`

Eliminar únicamente privilegios que se demuestre que no son necesarios.

RLS y GRANTs deben diseñarse conjuntamente.

---

# 9. Inventario

Agregar:

`CHECK (stock >= 0)`

Validar cantidades:

`quantity > 0`

La RPC de inventario debe rechazar:
- cantidad negativa;
- cantidad cero;
- cantidad superior al stock disponible.

La operación debe ser atómica.

---

# 10. Checkout transaccional

La arquitectura objetivo es:

```text
checkout()
  ↓
BEGIN
  ↓
validar usuario
  ↓
validar checkout_id
  ↓
obtener productos reales
  ↓
validar cantidades
  ↓
obtener precios reales
  ↓
validar/reservar stock
  ↓
crear order
  ↓
crear order_items
  ↓
asignar recursos cuando corresponda
  ↓
COMMIT
```

Cualquier error:

`ROLLBACK`

Debe revertir toda la operación.

---

# 11. Nueva RPC de checkout

Nombre provisional:

`create_checkout`

Harness deberá verificar primero si existe una convención mejor.

La RPC:
- recibe sólo información necesaria;
- obtiene precios de `products`;
- obtiene stock de `products`;
- valida `active`;
- valida cantidades;
- controla inventario;
- crea pedido;
- crea líneas;
- maneja idempotencia;
- asigna recursos cuando corresponda.

No debe confiar en:
- precio enviado por frontend;
- total enviado por frontend;
- stock enviado por frontend.

---

# 12. Precios

El cliente puede enviar:

- `product_id`
- `quantity`

La BD debe obtener:

`unit_price = products.price`

y calcular:

`total = SUM(unit_price × quantity)`

---

# 13. `decrement_stock`

La implementación debe determinar si:
1. se elimina como API pública independiente;
2. se mantiene como función interna;
3. se integra dentro de la nueva RPC de checkout.

En cualquier caso:
- `p_quantity > 0`;
- actualización atómica;
- nunca incrementar stock mediante cantidad negativa;
- permisos mínimos;
- revisar EXECUTE de `PUBLIC`, `anon` y `authenticated`.

No modificar esta función sin verificar dependencias existentes.

---

# 14. Idempotencia

Introducir un identificador de checkout, conceptualmente:

`checkout_id uuid`

La BD debe garantizar unicidad.

Una misma operación repetida no puede crear pedidos duplicados.

Debe soportar:
- doble clic;
- refresh;
- retry;
- timeout;
- reenvío de request.

Antes de decidir la constraint exacta, verificar cómo se relacionan actualmente los pedidos con usuarios.

---

# 15. `orders.user_id`

Antes de agregarlo:
1. inspeccionar estructura actual;
2. inspeccionar datos existentes;
3. determinar cómo se identifican actualmente las órdenes;
4. diseñar migración compatible;
5. no romper pedidos históricos.

Si la relación usuario-pedido ya existe mediante otra estructura, reutilizarla en lugar de duplicarla.

---

# 16. `account_slots`

Eliminar la estrategia final:

`SELECT COUNT(*) → if count < capacity → INSERT`

Sustituir por una operación atómica con protección contra concurrencia.

Garantía:

`allocated_slots <= capacity`

incluso bajo solicitudes simultáneas.

---

# 17. Constraints adicionales

Evaluar, sin aplicarlas automáticamente:
- `capacity > 0`;
- `starts_at <= ends_at`;
- estados válidos;
- precios no negativos;
- totales no negativos.

Antes de agregar cada constraint, comprobar datos históricos.

Si existen registros incompatibles:
**detenerse y reportar.**

---

# 18. Storage

Auditar `product-images` antes de modificarlo.

Determinar:
- lectura;
- subida;
- actualización;
- eliminación;
- sobrescritura;
- manipulación de nombres.

No modificar Storage hasta cerrar esa revisión.

---

# 19. Migraciones

Todos los cambios de esquema deben quedar versionados.

Orden conceptual:

1. `user_roles`
2. autorización admin
3. RLS
4. inventory constraints
5. checkout idempotency
6. checkout RPC
7. account_slots
8. privilege hardening
9. Storage

Los nombres y orden definitivos pueden adaptarse a la estructura existente.

---

# 20. Compatibilidad y producción

Antes de migrar:
- snapshot/backup;
- análisis de datos;
- revisión de migración;
- ejecución controlada;
- validación.

No ejecutar migraciones destructivas.

No modificar producción directamente desde Harness sin una instrucción explícita y un procedimiento de despliegue aprobado.

---

# 21. Pruebas obligatorias

## Seguridad

- anonymous → `/admin` = DENIED
- customer → `/admin` = DENIED
- admin → `/admin` = ALLOWED
- customer → datos de otro usuario = DENIED
- RPC administrativa no autorizada = DENIED

## Inventario

- quantity = -1 → DENIED
- quantity = 0 → DENIED
- quantity > stock → DENIED
- quantity válida → SUCCESS
- stock nunca < 0

## Concurrencia

Con stock = 1:

- request A → SUCCESS
- request B → FAILURE

## Rollback

Forzar error después de una operación de stock y verificar que:
- stock vuelve a su estado original;
- no queda order parcial;
- no quedan order_items parciales;
- no quedan account_slots parciales.

## Idempotencia

Repetir:

`checkout(X)`

varias veces.

Resultado:

`1 pedido`

## Account slots

Con capacidad 1 y dos solicitudes simultáneas:

- una → SUCCESS;
- otra → FAILURE.

Nunca superar capacidad.

---

# 22. Protocolo Harness

## Fase A — Análisis

No modificar.

Entregar:
- archivos afectados;
- migraciones;
- dependencias;
- riesgos;
- ambigüedades.

## Fase B — Seguridad

Implementar:
- `user_roles`;
- `is_admin`;
- `requireAdmin`;
- RLS;
- GRANTs.

## Fase C — Checkout

Implementar:
- inventario;
- RPC;
- transacción;
- idempotencia;
- precios server-side.

## Fase D — Recursos

Implementar:
- account_slots;
- shared_accounts.

## Fase E — Pruebas

Ejecutar pruebas completas y documentar resultados.

---

# 23. Regla de parada

Detenerse inmediatamente ante:
- datos incompatibles;
- migración destructiva;
- pérdida potencial de datos;
- cambio incompatible;
- secreto expuesto;
- comportamiento no contemplado;
- necesidad de modificar una tabla fuera del alcance.

Reportar:

`PROBLEMA / IMPACTO / ARCHIVO O TABLA / OPCIONES / RECOMENDACIÓN`

No improvisar.

---

# 24. Git

Antes de cada fase:

`git status`

Después:

`git diff`

Después ejecutar pruebas.

Cada fase debe poder identificarse mediante un commit independiente.

No hacer push automáticamente.

---

# 25. Matriz de decisiones

Antes de implementar cualquier punto no definido, Harness debe clasificarlo como:

- DECISIÓN FIJADA POR ESTA ESPECIFICACIÓN
- REQUIERE VERIFICACIÓN
- REQUIERE DECISIÓN DE NEGOCIO

No convertir una ambigüedad de negocio en una decisión automática del agente.

---

# 26. Criterios de aceptación globales

La remediación se considera terminada sólo cuando:

- autorización administrativa implementada;
- RLS endurecido;
- GRANTs revisados;
- service_role minimizado;
- cantidades inválidas rechazadas;
- stock protegido;
- checkout atómico;
- precios calculados desde BD;
- idempotencia implementada;
- account_slots protegido contra concurrencia;
- información administrativa correctamente restringida;
- migraciones versionadas;
- pruebas de seguridad superadas;
- pruebas de concurrencia superadas;
- pruebas de rollback superadas;
- pruebas de regresión superadas;
- no existen secretos expuestos;
- no existen cambios fuera de alcance.

---

# 27. Estado

**MRGames — Especificación Técnica Maestra v1.1**

**LISTA PARA ANÁLISIS DE IMPLEMENTACIÓN CONTROLADA.**

La especificación incorpora el baseline verificado de Supabase y debe ser tratada por Harness como fuente de contexto para la implementación.

**Antes de modificar código o base de datos, Harness debe presentar su plan de ejecución y detenerse para revisión.**

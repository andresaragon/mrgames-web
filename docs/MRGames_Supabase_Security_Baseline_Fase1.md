# MRGames — Supabase Security Baseline
## Baseline de referencia para Harness — Fase 1

**Proyecto Supabase:** `qktctzsdfqhezhbeshru`  
**Propósito:** documentar el estado observado antes de implementar autorización administrativa.  
**Regla:** este documento describe el estado observado; no constituye autorización para ejecutar cambios.

## 1. Tablas públicas observadas

### products
- id uuid NOT NULL DEFAULT gen_random_uuid()
- category_id uuid NULL
- name text NOT NULL
- slug text NOT NULL
- description text NULL
- price numeric NOT NULL
- stock integer NOT NULL DEFAULT 0
- platform text NULL
- condition text NOT NULL DEFAULT 'nuevo'
- image_url text NULL
- active boolean NOT NULL DEFAULT true
- created_at timestamptz NOT NULL DEFAULT now()

### categories
- id uuid NOT NULL DEFAULT gen_random_uuid()
- name text NOT NULL
- slug text NOT NULL
- created_at timestamptz NOT NULL DEFAULT now()

### orders
- id uuid NOT NULL DEFAULT gen_random_uuid()
- customer_name text NOT NULL
- customer_phone text NOT NULL
- payment_method text NOT NULL
- status text NOT NULL DEFAULT 'pending'
- total numeric NOT NULL DEFAULT 0
- created_at timestamptz NOT NULL DEFAULT now()
- **No existe actualmente `user_id`.**

### order_items
- id uuid NOT NULL DEFAULT gen_random_uuid()
- order_id uuid NOT NULL
- product_id uuid NOT NULL
- quantity integer NOT NULL
- unit_price numeric NOT NULL

### shared_accounts
- id uuid NOT NULL DEFAULT gen_random_uuid()
- product_id uuid NULL
- platform text NOT NULL
- identifier text NOT NULL
- capacity integer NOT NULL DEFAULT 1
- status text NOT NULL DEFAULT 'active'
- created_at timestamptz NOT NULL DEFAULT now()

### account_slots
- id uuid NOT NULL DEFAULT gen_random_uuid()
- shared_account_id uuid NOT NULL
- order_id uuid NULL
- customer_name text NOT NULL
- customer_phone text NOT NULL
- starts_at date NOT NULL
- ends_at date NOT NULL
- status text NOT NULL DEFAULT 'active'
- created_at timestamptz NOT NULL DEFAULT now()

## 2. Foreign keys

- products.category_id → categories.id
- shared_accounts.product_id → products.id
- order_items.order_id → orders.id
- order_items.product_id → products.id
- account_slots.shared_account_id → shared_accounts.id
- account_slots.order_id → orders.id

## 3. Constraints relevantes

Observados:
- PK en las tablas principales.
- products.slug UNIQUE.
- categories.slug UNIQUE.
- order_items.quantity tiene CHECK de cantidad positiva.
- products.condition tiene CHECK.
- orders.payment_method tiene CHECK.
- orders.status tiene CHECK.
- account_slots.status tiene CHECK.
- shared_accounts.status tiene CHECK.

No se observó un CHECK que garantice `products.stock >= 0`.

## 4. RLS observado

Políticas existentes:

### account_slots
`Lectura para usuarios autenticados`
- rol: authenticated
- operación: SELECT
- condición: true

### categories
`Lectura pública de categorías`
- rol: public
- operación: SELECT
- condición: true

### products
`Lectura pública de productos activos`
- rol: public
- operación: SELECT
- condición: active = true

### shared_accounts
`Lectura para usuarios autenticados`
- rol: authenticated
- operación: SELECT
- condición: true

No se observaron políticas INSERT/UPDATE/DELETE en este levantamiento.

## 5. Función decrement_stock

Firma: `public.decrement_stock(uuid, integer)`

Propiedades:
- retorna boolean
- PL/pgSQL
- owner: postgres
- SECURITY INVOKER
- sin search_path configurado mediante proconfig

Lógica:
- actualiza products.stock
- exige `stock >= p_quantity`
- descuenta p_quantity
- devuelve true si actualizó una fila

Riesgo conocido:
- no valida explícitamente `p_quantity > 0`
- una cantidad negativa puede convertir conceptualmente el descuento en incremento de stock

Permisos EXECUTE observados:
- anon
- authenticated
- service_role

Esto queda para hardening posterior; NO modificarlo durante esta fase.

## 6. Autorización administrativa actual

No existe evidencia de:
- public.user_roles
- is_admin()
- rol administrativo persistente en base de datos

El código analizado por Harness utiliza requireUser() para operaciones administrativas.

## 7. Administrador inicial

Debe identificarse de forma verificable antes de insertar cualquier rol admin.

**NO inventar UUID.**
**NO insertar administrador automáticamente.**

## 8. Alcance de M001/M002

Permitido:
- crear user_roles;
- crear is_admin() segura;
- crear requireAdmin();
- proteger /admin;
- proteger Server Actions administrativas;
- aplicar RLS estrictamente necesarias.

Fuera de alcance:
- checkout;
- decrement_stock;
- inventario;
- idempotencia;
- orders.user_id;
- account_slots;
- Storage;
- hardening global de GRANTs.

## 9. Regla para Harness

Harness/Codex debe leer este baseline antes de implementar M001/M002, no inventar estructuras ni usuarios, detenerse ante incompatibilidades, no salir del alcance de Fase 1 y no hacer commit/push sin autorización explícita.

**Estado:** baseline levantado sin modificaciones al esquema.

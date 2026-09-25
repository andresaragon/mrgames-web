-- ============================================================
-- M005: Mr Games · Historial de publicaciones automáticas en Facebook
-- Tabla auxiliar para el orquestador n8n en VPS Oracle.
-- ============================================================

-- 1. Tabla fb_posts con product_id tipo UUID (coincidente con public.products.id)
create table if not exists public.fb_posts (
  id             bigserial primary key,
  product_id     uuid        not null references public.products(id) on delete cascade,
  slot           text        not null check (slot in ('am','pm')),
  post_date      date        not null default (now() at time zone 'America/Bogota')::date,
  status         text        not null check (status in ('publicado','error')),
  fb_post_id     text,
  caption        text,
  error_code     int,
  error_category text,
  error_message  text,
  created_at     timestamptz not null default now()
);

-- 2. Rotación: "¿cuándo se publicó por última vez este producto?"
create index if not exists fb_posts_product_pub_idx
  on public.fb_posts (product_id, created_at desc)
  where status = 'publicado';

-- 3. Deduplicación de alertas: "¿ya avisé de este error en las últimas 24 h?"
create index if not exists fb_posts_err_idx
  on public.fb_posts (error_code, created_at desc)
  where status = 'error';

-- 4. Candado anti doble publicación: máximo 1 post publicado por franja y día.
create unique index if not exists fb_posts_one_per_slot
  on public.fb_posts (post_date, slot)
  where status = 'publicado';

-- 5. Seguridad RLS: la tabla solo la usa n8n por conexión directa Postgres (Session Pooler).
-- Activar RLS sin policies la deja cerrada para la API pública anon/authenticated.
alter table public.fb_posts enable row level security;

comment on table public.fb_posts is
  'Historial de publicaciones y telemetría de errores del bot de Facebook en n8n.';

-- M004: Idempotency column for orders and combo requests
-- Aligned with MrGames Showroom model (stock-decoupled for digital accounts and combos)

-- 1. Add checkout_id column to orders if not exists for idempotency support
alter table public.orders
  add column if not exists checkout_id uuid unique;

create index if not exists idx_orders_checkout_id on public.orders(checkout_id);

comment on column public.orders.checkout_id is
  'Unique client-provided idempotency key for checkout combo inquiries.';

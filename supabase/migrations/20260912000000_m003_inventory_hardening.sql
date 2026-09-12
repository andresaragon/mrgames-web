-- M003: prevent negative stock and restrict decrement_stock to trusted callers.
-- decrement_stock is invoked exclusively from app/checkout/actions.ts via the
-- service_role client; anon/authenticated never need direct EXECUTE on it.
-- Negative-quantity input is now rejected earlier, in createOrder() itself
-- (app/checkout/actions.ts), before any RPC call is made.
alter table public.products
  add constraint products_stock_non_negative check (stock >= 0);

revoke execute on function public.decrement_stock(uuid, integer) from anon, authenticated;

-- M004: transactional and idempotent checkout RPC.
-- Enforces server-side price calculation, inventory locking and atomic order creation.

-- 1. Add checkout_id column to orders if not exists for idempotency support.
alter table public.orders
  add column if not exists checkout_id uuid unique;

comment on column public.orders.checkout_id is
  'Unique client-provided idempotency key for checkout transactions.';

-- 2. Create the transactional create_checkout RPC function.
create or replace function public.create_checkout(
  p_checkout_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_existing_order_id uuid;
  v_existing_total numeric;
  v_order_id uuid;
  v_total numeric := 0;
  v_status text;
  v_order_items jsonb := '[]'::jsonb;
  v_item record;
  v_result jsonb;
  v_expected_count integer;
  v_found_count integer;
begin
  -- Validate mandatory input fields
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'El nombre del cliente es obligatorio';
  end if;

  if p_customer_phone is null or trim(p_customer_phone) = '' then
    raise exception 'El teléfono del cliente es obligatorio';
  end if;

  if p_payment_method not in ('whatsapp', 'online') then
    raise exception 'Método de pago no válido: %', p_payment_method;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  -- 1. Idempotency Check: if order already exists for this checkout_id, return it immediately
  if p_checkout_id is not null then
    select o.id, o.total into v_existing_order_id, v_existing_total
    from public.orders o
    where o.checkout_id = p_checkout_id;

    if v_existing_order_id is not null then
      select jsonb_build_object(
        'order_id', v_existing_order_id,
        'total', v_existing_total,
        'items', coalesce(jsonb_agg(jsonb_build_object(
          'product_id', oi.product_id,
          'name', p.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price
        )), '[]'::jsonb)
      ) into v_result
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = v_existing_order_id;

      return v_result;
    end if;
  end if;

  -- Determine initial order status
  v_status := case when p_payment_method = 'whatsapp' then 'coordinated' else 'pending' end;

  -- 2. Verify all products exist and are active
  with parsed_items as (
    select
      (elem->>'id')::uuid as product_id,
      (elem->>'quantity')::integer as qty
    from jsonb_array_elements(p_items) as elem
  ),
  aggregated_items as (
    select
      product_id,
      sum(qty)::integer as total_qty
    from parsed_items
    group by product_id
  )
  select count(*),
         (select count(distinct p.id)
          from public.products p
          join aggregated_items ai on ai.product_id = p.id
          where p.active = true)
  into v_expected_count, v_found_count
  from aggregated_items;

  if v_expected_count <> v_found_count then
    raise exception 'Uno o más productos del pedido no están disponibles o no existen';
  end if;

  -- 3. Lock products and update stock sequentially in deterministic order (prevents deadlocks)
  for v_item in
    with parsed_items as (
      select
        (elem->>'id')::uuid as product_id,
        (elem->>'quantity')::integer as qty
      from jsonb_array_elements(p_items) as elem
    ),
    aggregated_items as (
      select
        product_id,
        sum(qty)::integer as total_qty
      from parsed_items
      group by product_id
    )
    select
      ai.product_id,
      ai.total_qty as quantity,
      p.name,
      p.price,
      p.stock
    from aggregated_items ai
    join public.products p on p.id = ai.product_id
    order by ai.product_id
    for update of p
  loop
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'Cantidad inválida para el producto: %', v_item.name;
    end if;

    if v_item.stock < v_item.quantity then
      raise exception 'Sin stock suficiente para % (disponible: %, solicitado: %)',
        v_item.name, v_item.stock, v_item.quantity;
    end if;

    -- Decrement stock atomically
    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;

    -- Accumulate total using authoritative server-side price
    v_total := v_total + (v_item.price * v_item.quantity);

    -- Build return items array
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_item.product_id,
      'name', v_item.name,
      'quantity', v_item.quantity,
      'unit_price', v_item.price
    );
  end loop;

  -- 4. Insert order record
  insert into public.orders (
    checkout_id,
    customer_name,
    customer_phone,
    payment_method,
    status,
    total
  ) values (
    p_checkout_id,
    p_customer_name,
    p_customer_phone,
    p_payment_method,
    v_status,
    v_total
  )
  returning id into v_order_id;

  -- 5. Insert order_items records in batch
  insert into public.order_items (
    order_id,
    product_id,
    quantity,
    unit_price
  )
  select
    v_order_id,
    (elem->>'product_id')::uuid,
    (elem->>'quantity')::integer,
    (elem->>'unit_price')::numeric
  from jsonb_array_elements(v_order_items) as elem;

  -- 6. Return complete order confirmation payload
  return jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total,
    'items', v_order_items
  );
end;
$$;

-- 4. Security and Least-Privilege Grants
alter function public.create_checkout(uuid, text, text, text, jsonb) owner to postgres;
revoke execute on function public.create_checkout(uuid, text, text, text, jsonb) from public;
revoke execute on function public.create_checkout(uuid, text, text, text, jsonb) from anon;
revoke execute on function public.create_checkout(uuid, text, text, text, jsonb) from authenticated;

comment on function public.create_checkout(uuid, text, text, text, jsonb) is
  'SECURITY DEFINER owned by postgres; atomic and idempotent checkout handler invoked exclusively via service_role.';

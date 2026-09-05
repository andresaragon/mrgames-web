-- M002: server-side administrative authorization and least-privilege policies.
-- SECURITY DEFINER avoids querying user_roles through its own restrictive RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter function public.is_admin() owner to postgres;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;
grant select on table public.shared_accounts to authenticated;
grant select on table public.account_slots to authenticated;
grant select on table public.account_slots to authenticated;

drop policy if exists "Users can read their own role" on public.user_roles;
drop policy if exists "Authenticated users can read roles" on public.user_roles;
drop policy if exists "Admins can read roles" on public.user_roles;

-- Replace broad authenticated reads with admin-only reads.
drop policy if exists "Lectura para usuarios autenticados" on public.shared_accounts;
drop policy if exists "Lectura para usuarios autenticados" on public.account_slots;
drop policy if exists "Admins can read shared accounts" on public.shared_accounts;
drop policy if exists "Admins can read account slots" on public.account_slots;

create policy "Admins can read roles"
  on public.user_roles for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read shared accounts"
  on public.shared_accounts for select
  to authenticated
  using (public.is_admin());

create policy "Admins can read account slots"
  on public.account_slots for select
  to authenticated
  using (public.is_admin());

comment on function public.is_admin() is
  'SECURITY DEFINER owned by postgres with fixed search_path; checks auth.uid() against user_roles to safely support RLS policies.';

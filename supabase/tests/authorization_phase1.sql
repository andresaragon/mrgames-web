-- Fase 1 authorization verification checklist.
-- Execute against a disposable Supabase database after applying M001 and M002.
-- These assertions intentionally use the owner-verified administrator UUID only.

-- Schema and seed invariants.
select count(*) = 1 as exactly_one_initial_admin
from public.user_roles
where user_id = '8e032fe0-66ec-4abf-918a-06852fdeff38'::uuid
  and role = 'admin';

select has_function_privilege('authenticated', 'public.is_admin()', 'EXECUTE')
  and not has_function_privilege('anon', 'public.is_admin()', 'EXECUTE')
  as is_admin_grants_are_minimal;

-- Policy invariants (authenticated users reach these tables only when is_admin()).
select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expression
from pg_policy
where polrelid in ('public.shared_accounts'::regclass, 'public.account_slots'::regclass,
                   'public.user_roles'::regclass)
order by polrelid::text, polname;

-- Manual session tests with Supabase Auth users:
--   anonymous/customer -> /admin redirects to /login or / respectively
--   initial admin UUID -> /admin is allowed
--   customer -> createSharedAccount/createSlot is denied
--   initial admin -> both actions are allowed
--   customer -> SELECT shared_accounts/account_slots/user_roles is denied
--   customer -> INSERT/UPDATE/DELETE user_roles is denied
--   admin -> administrative reads are allowed
--   public products/categories SELECT remains unchanged.

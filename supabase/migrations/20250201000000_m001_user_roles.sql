-- M001: explicit administrative role registry.
-- The seed is intentionally limited to the owner-verified administrator UUID.
create table if not exists public.user_roles (
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint user_roles_role_check check (role = 'admin')
);

insert into public.user_roles (user_id, role)
values ('8e032fe0-66ec-4abf-918a-06852fdeff38', 'admin');

comment on table public.user_roles is
  'Administrative roles. Initially restricted to the admin role; absence of a row means a normal user.';

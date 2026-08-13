-- Adds head-office / regional-commissioner reporting: a "scope" tier
-- orthogonal to the existing permission role (admin/official/clerk).
-- 'facility' users (the default, current behaviour) are pinned to one
-- facility_id. 'regional' users are pinned to a region (province) and
-- see a rollup across every facility in it. 'national' users see a
-- rollup across all facilities, no facility_id or region needed.

alter table public.profiles
  add column scope text not null default 'facility' check (scope in ('facility', 'regional', 'national')),
  add column region text;

-- Keep the signup trigger's default in sync (new signups still land as
-- facility-scoped clerks unless provisioned otherwise by an admin).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, scope)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'clerk'),
    coalesce(new.raw_user_meta_data->>'scope', 'facility')
  );
  return new;
end;
$$;

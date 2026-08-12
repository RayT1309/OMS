-- Replaces the old users/sessions tables with Supabase Auth (auth.users)
-- plus a profiles table holding the app-specific fields (name, role, facility_id).
-- A trigger keeps profiles in sync whenever a new auth.users row is created.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('admin', 'official', 'clerk')),
  facility_id integer references public.facilities(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own facility"
  on public.profiles for update
  using (auth.uid() = id);

-- New signups get name/role from auth metadata (set at signUp time), default role 'clerk'.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'clerk')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

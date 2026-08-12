-- Photo capture: offender intake photo and incident evidence photo.
-- Photos are uploaded to Supabase Storage by the backend (service role,
-- same as every other write path) and only the public URL is stored here.

alter table offenders add column if not exists photo_url text;
alter table incidents add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

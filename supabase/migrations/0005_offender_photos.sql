-- Photo history per offender: every mugshot update and evidence photo is
-- kept as its own row (unlike offenders.photo_url, which only ever holds
-- the current mugshot) so staff can see who/what was captured over time.

create table if not exists offender_photos (
  id serial primary key,
  offender_id integer not null references offenders(id) on delete cascade,
  kind text not null check (kind in ('mugshot', 'evidence')),
  photo_url text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists offender_photos_offender_id_idx on offender_photos(offender_id);

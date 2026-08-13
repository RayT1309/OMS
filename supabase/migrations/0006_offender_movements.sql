-- Tracks offenders temporarily booked out of their facility (court
-- appearance, hospital visit, etc). An offender is "currently out" when
-- they have a row here with returned_at still null. This is what lets
-- headcount distinguish "assigned to Pollsmoor" from "physically present
-- at Pollsmoor right now" — the number that has to reconcile against a
-- manual body-receipt count.

create table if not exists offender_movements (
  id serial primary key,
  offender_id integer not null references offenders(id) on delete cascade,
  reason text not null check (reason in ('court', 'hospital', 'other')),
  court_case_id integer references court_cases(id) on delete set null,
  out_at timestamptz not null default now(),
  expected_return timestamptz,
  returned_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists offender_movements_offender_id_idx on offender_movements(offender_id);
create index if not exists offender_movements_open_idx on offender_movements(offender_id) where returned_at is null;

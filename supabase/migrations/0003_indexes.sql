-- Foreign-key indexes for the facility-scoped queries used by computeKPIs(),
-- GET /offenders, GET /incidents, GET /incidents/outbox. Postgres does not
-- create these automatically for foreign keys (unlike primary keys), so
-- every WHERE/JOIN on these columns was doing a sequential scan.

create index if not exists idx_offenders_facility_id on offenders(facility_id);
create index if not exists idx_incidents_facility_id on incidents(facility_id);
create index if not exists idx_incidents_offender_id on incidents(offender_id);
create index if not exists idx_incidents_synced on incidents(synced);
create index if not exists idx_health_records_offender_id on health_records(offender_id);
create index if not exists idx_education_records_offender_id on education_records(offender_id);
create index if not exists idx_body_receipts_facility_id on body_receipts(facility_id);
create index if not exists idx_kpi_reports_facility_id on kpi_reports(facility_id);

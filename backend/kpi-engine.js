// KPI Materialized View Layer.
// Every metric here is computed on demand from offenders/incidents/health_records.
// Nothing is stored redundantly — this module is the single place KPI logic lives.
// Pass a facilityId to scope every metric to one management area (used by
// both the live dashboard and the daily per-facility KPI reports).

async function computeKPIs(sql, facilityId = null) {
  const offenderScope = facilityId ? sql`facility_id = ${facilityId}` : sql`TRUE`;
  const incidentScope = facilityId ? sql`facility_id = ${facilityId}` : sql`TRUE`;
  const offenderJoinScope = facilityId ? sql`o.facility_id = ${facilityId}` : sql`TRUE`;

  const [
    [offenderRow],
    [movementRow],
    [incidentRow],
    [healthRow],
    [educationRow],
    facilityRows
  ] = await Promise.all([
    sql`
      SELECT
        COUNT(*) AS total_offenders,
        COUNT(*) FILTER (WHERE status = 'released') AS released_offenders,
        COUNT(*) FILTER (WHERE status = 'incarcerated') AS incarcerated_offenders
      FROM offenders WHERE ${offenderScope}
    `,
    sql`
      SELECT COUNT(*) AS currently_out
      FROM offender_movements m
      JOIN offenders o ON o.id = m.offender_id
      WHERE m.returned_at IS NULL AND ${offenderJoinScope}
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE type IN ('escape_attempt','escape') AND synced = 1) AS escape_attempts,
        COUNT(*) FILTER (WHERE type = 'assault' AND synced = 1) AS assaults,
        COUNT(*) FILTER (WHERE type = 'assault' AND injury = true AND synced = 1) AS assault_injuries,
        COUNT(*) FILTER (WHERE synced = 1) AS synced_count,
        COUNT(DISTINCT facility_id) FILTER (WHERE synced = 1) AS distinct_live_facilities,
        COUNT(*) FILTER (WHERE synced = 0) AS pending_sync
      FROM incidents WHERE ${incidentScope}
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE h.tb_status IN ('active','cured')) AS tb_ever_affected,
        COUNT(*) FILTER (WHERE h.tb_status = 'cured') AS tb_cured
      FROM health_records h JOIN offenders o ON o.id = h.offender_id
      WHERE ${offenderJoinScope}
    `,
    sql`
      SELECT
        COUNT(*) AS education_total,
        COUNT(*) FILTER (WHERE e.status = 'completed') AS education_completed
      FROM education_records e JOIN offenders o ON o.id = e.offender_id
      WHERE ${offenderJoinScope}
    `,
    facilityId
      ? sql`SELECT COALESCE(capacity, 0) AS capacity FROM facilities WHERE id = ${facilityId}`
      : sql`SELECT COUNT(*) AS total_facilities, COALESCE(SUM(capacity), 0) AS total_capacity FROM facilities`
  ]);

  const totalOffenders = offenderRow.total_offenders;
  const releasedOffenders = offenderRow.released_offenders;
  const incarceratedOffenders = offenderRow.incarcerated_offenders;
  const currentlyOut = movementRow.currently_out;
  const physicallyPresent = incarceratedOffenders - currentlyOut;
  const escapeAttempts = incidentRow.escape_attempts;
  const assaults = incidentRow.assaults;
  const assaultInjuries = incidentRow.assault_injuries;
  const pendingSync = incidentRow.pending_sync;
  const tbEverAffected = healthRow.tb_ever_affected;
  const tbCured = healthRow.tb_cured;
  const educationTotal = educationRow.education_total;
  const educationCompleted = educationRow.education_completed;

  const sitesLive = facilityId ? (incidentRow.synced_count > 0 ? 1 : 0) : incidentRow.distinct_live_facilities;
  const totalFacilities = facilityId ? 1 : facilityRows[0].total_facilities;
  const totalCapacity = facilityId ? facilityRows[0].capacity : facilityRows[0].total_capacity;

  const escapeRate = totalOffenders > 0 ? escapeAttempts / totalOffenders : 0;
  const assaultInjuryRate = assaults > 0 ? assaultInjuries / assaults : 0;
  const tbCureRate = tbEverAffected > 0 ? tbCured / tbEverAffected : 0;
  const overcrowdingRate = totalCapacity > 0 ? physicallyPresent / totalCapacity : 0;
  const educationCompletionRate = educationTotal > 0 ? educationCompleted / educationTotal : 0;
  const releaseRate = totalOffenders > 0 ? releasedOffenders / totalOffenders : 0;

  return {
    generated_at: new Date().toISOString(),
    total_offenders: totalOffenders,
    incarcerated_offenders: incarceratedOffenders,
    currently_out: currentlyOut,
    physically_present: physicallyPresent,
    escape_rate: round(escapeRate),
    escape_attempts: escapeAttempts,
    assault_injury_rate: round(assaultInjuryRate),
    assaults,
    assault_injuries: assaultInjuries,
    overcrowding_rate: round(overcrowdingRate),
    total_capacity: totalCapacity,
    tb_cure_rate: round(tbCureRate),
    tb_cured: tbCured,
    tb_ever_affected: tbEverAffected,
    education_completion_rate: round(educationCompletionRate),
    education_completed: educationCompleted,
    education_total: educationTotal,
    release_rate: round(releaseRate),
    released_offenders: releasedOffenders,
    sites_live: sitesLive,
    total_facilities: totalFacilities,
    pending_sync: pendingSync
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

module.exports = { computeKPIs };

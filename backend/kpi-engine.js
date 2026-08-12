// KPI Materialized View Layer.
// Every metric here is computed on demand from offenders/incidents/health_records.
// Nothing is stored redundantly — this module is the single place KPI logic lives.
// Pass a facilityId to scope every metric to one management area (used by
// both the live dashboard and the daily per-facility KPI reports).

async function computeKPIs(sql, facilityId = null) {
  const [
    [{ n: totalOffenders }],
    [{ n: escapeAttempts }],
    [{ n: assaults }],
    [{ n: assaultInjuries }],
    [{ n: tbEverAffected }],
    [{ n: tbCured }],
    sitesLiveRows,
    [{ n: totalFacilitiesAll }],
    [{ n: pendingSync }],
    totalCapacityRows,
    [{ n: educationTotal }],
    [{ n: educationCompleted }],
    [{ n: releasedOffenders }]
  ] = await Promise.all([
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM offenders WHERE facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM offenders`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM incidents WHERE type IN ('escape_attempt','escape') AND synced = 1 AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM incidents WHERE type IN ('escape_attempt','escape') AND synced = 1`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM incidents WHERE type = 'assault' AND synced = 1 AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM incidents WHERE type = 'assault' AND synced = 1`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM incidents WHERE type = 'assault' AND injury = true AND synced = 1 AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM incidents WHERE type = 'assault' AND injury = true AND synced = 1`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM health_records h JOIN offenders o ON o.id = h.offender_id WHERE h.tb_status IN ('active','cured') AND o.facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM health_records h WHERE h.tb_status IN ('active','cured')`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM health_records h JOIN offenders o ON o.id = h.offender_id WHERE h.tb_status = 'cured' AND o.facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM health_records h WHERE h.tb_status = 'cured'`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM incidents WHERE synced = 1 AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(DISTINCT facility_id) AS n FROM incidents WHERE synced = 1`,
    sql`SELECT COUNT(*) AS n FROM facilities`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM incidents WHERE synced = 0 AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM incidents WHERE synced = 0`,
    facilityId
      ? sql`SELECT COALESCE(capacity, 0) AS n FROM facilities WHERE id = ${facilityId}`
      : sql`SELECT COALESCE(SUM(capacity), 0) AS n FROM facilities`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM education_records e JOIN offenders o ON o.id = e.offender_id WHERE o.facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM education_records e`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM education_records e JOIN offenders o ON o.id = e.offender_id WHERE e.status = 'completed' AND o.facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM education_records e WHERE e.status = 'completed'`,
    facilityId
      ? sql`SELECT COUNT(*) AS n FROM offenders WHERE status = 'released' AND facility_id = ${facilityId}`
      : sql`SELECT COUNT(*) AS n FROM offenders WHERE status = 'released'`
  ]);

  const sitesLive = facilityId ? (sitesLiveRows[0].n > 0 ? 1 : 0) : sitesLiveRows[0].n;
  const totalFacilities = facilityId ? 1 : totalFacilitiesAll;
  const totalCapacity = (totalCapacityRows[0] || { n: 0 }).n;

  const escapeRate = totalOffenders > 0 ? escapeAttempts / totalOffenders : 0;
  const assaultInjuryRate = assaults > 0 ? assaultInjuries / assaults : 0;
  const tbCureRate = tbEverAffected > 0 ? tbCured / tbEverAffected : 0;
  const overcrowdingRate = totalCapacity > 0 ? totalOffenders / totalCapacity : 0;
  const educationCompletionRate = educationTotal > 0 ? educationCompleted / educationTotal : 0;
  const releaseRate = totalOffenders > 0 ? releasedOffenders / totalOffenders : 0;

  return {
    generated_at: new Date().toISOString(),
    total_offenders: totalOffenders,
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

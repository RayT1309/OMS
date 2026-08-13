const express = require('express');
const sql = require('../db');
const { computeKPIs } = require('../kpi-engine');

const router = express.Router();

// Regional/national users aren't pinned to one facility_id — their scope
// determines whether metrics roll up by region or across every facility.
function resolveScope(user) {
  if (!user || user.scope === 'facility') return { facilityId: user && user.facility_id, region: null };
  if (user.scope === 'regional') return { facilityId: null, region: user.region };
  return { facilityId: null, region: null }; // national
}

router.get('/', async (req, res) => {
  const { facilityId, region } = resolveScope(req.user);
  res.json(await computeKPIs(sql, facilityId, region));
});

// Incident counts by month, for the trend chart. Derived from the event
// log the same way the KPI cards are — only synced (reconciled) incidents count.
router.get('/trend', async (req, res) => {
  const { facilityId, region } = resolveScope(req.user);
  const rows = await sql`
    SELECT to_char(timestamp::timestamptz, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM incidents
    WHERE synced = 1
      ${facilityId ? sql`AND facility_id = ${facilityId}` : sql``}
      ${region ? sql`AND facility_id IN (SELECT id FROM facilities WHERE region = ${region})` : sql``}
    GROUP BY month
    ORDER BY month
  `;
  res.json(rows);
});

// Per-facility breakdown for regional/national dashboards — head office
// needs to see which facility within the rollup is driving a metric, not
// just the aggregate.
router.get('/facilities', async (req, res) => {
  const user = req.user;
  if (!user || user.scope === 'facility') {
    return res.status(403).json({ error: 'Facility-scoped users do not have a multi-facility breakdown' });
  }

  const facilities = user.scope === 'regional'
    ? await sql`SELECT id, name, region FROM facilities WHERE region = ${user.region} ORDER BY name`
    : await sql`SELECT id, name, region FROM facilities ORDER BY region, name`;

  const rows = await Promise.all(facilities.map(async (f) => {
    const k = await computeKPIs(sql, f.id);
    return {
      facility_id: f.id,
      facility_name: f.name,
      region: f.region,
      total_offenders: k.total_offenders,
      physically_present: k.physically_present,
      overcrowding_rate: k.overcrowding_rate,
      escape_rate: k.escape_rate,
      assault_injury_rate: k.assault_injury_rate,
      pending_sync: k.pending_sync
    };
  }));

  res.json(rows);
});

module.exports = router;

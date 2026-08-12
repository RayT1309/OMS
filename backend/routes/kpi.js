const express = require('express');
const sql = require('../db');
const { computeKPIs } = require('../kpi-engine');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await computeKPIs(sql, req.user && req.user.facility_id));
});

// Incident counts by month, for the trend chart. Derived from the event
// log the same way the KPI cards are — only synced (reconciled) incidents count.
router.get('/trend', async (req, res) => {
  const facilityId = req.user && req.user.facility_id;
  const rows = await sql`
    SELECT to_char(timestamp::timestamptz, 'YYYY-MM') AS month, COUNT(*) AS count
    FROM incidents
    WHERE synced = 1 ${facilityId ? sql`AND facility_id = ${facilityId}` : sql``}
    GROUP BY month
    ORDER BY month
  `;
  res.json(rows);
});

module.exports = router;

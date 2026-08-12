const express = require('express');
const sql = require('../db');
const { generateDailyReport, getReportHistory } = require('../report-engine');

const router = express.Router();

const CSV_COLUMNS = [
  'report_date', 'total_offenders', 'escape_rate', 'escape_attempts',
  'assault_injury_rate', 'assaults', 'assault_injuries', 'overcrowding_rate',
  'total_capacity', 'tb_cure_rate', 'education_completion_rate', 'release_rate'
];

function requireFacility(req, res) {
  const facilityId = req.user && req.user.facility_id;
  if (!facilityId) {
    res.status(400).json({ error: 'Select a management area before viewing reports' });
    return null;
  }
  return facilityId;
}

router.get('/kpi', async (req, res) => {
  const facilityId = requireFacility(req, res);
  if (!facilityId) return;
  const days = Math.min(Number(req.query.days) || 30, 90);
  const history = await getReportHistory(sql, facilityId, days);
  res.json(history.reverse());
});

router.post('/kpi/generate', async (req, res) => {
  const facilityId = requireFacility(req, res);
  if (!facilityId) return;
  await generateDailyReport(sql, facilityId);
  const history = await getReportHistory(sql, facilityId, 1);
  res.json(history[0]);
});

router.get('/kpi/export.csv', async (req, res) => {
  const facilityId = requireFacility(req, res);
  if (!facilityId) return;
  const days = Math.min(Number(req.query.days) || 30, 90);
  const history = await getReportHistory(sql, facilityId, days);
  const rows = history.reverse();

  const lines = [CSV_COLUMNS.join(',')];
  rows.forEach((r) => {
    lines.push(CSV_COLUMNS.map((c) => r[c]).join(','));
  });

  const facilityRows = await sql`SELECT name FROM facilities WHERE id = ${facilityId}`;
  const facilityName = (facilityRows[0] || {}).name || 'facility';
  const filename = `kpi-report-${facilityName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(lines.join('\n'));
});

module.exports = router;

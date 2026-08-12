const express = require('express');
const sql = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const incidents = await sql`
    SELECT i.*, o.name AS offender_name, f.name AS facility_name
    FROM incidents i
    JOIN offenders o ON o.id = i.offender_id
    JOIN facilities f ON f.id = i.facility_id
    ORDER BY i.timestamp DESC
  `;
  res.json(incidents);
});

// The offline outbox: incidents currently queued (synced = 0).
router.get('/outbox', async (req, res) => {
  const queued = await sql`
    SELECT i.*, o.name AS offender_name, f.name AS facility_name
    FROM incidents i
    JOIN offenders o ON o.id = i.offender_id
    JOIN facilities f ON f.id = i.facility_id
    WHERE i.synced = 0
    ORDER BY i.timestamp DESC
  `;
  res.json(queued);
});

// Log a new incident. `offline: true` in the body simulates the facility
// being disconnected — the event is written locally with synced=0 and
// stays queued (and out of KPI computation) until /api/incidents/sync runs.
router.post('/', async (req, res) => {
  const { offender_id, type, injury, timestamp, facility_id, offline } = req.body;
  if (!offender_id || !type || !facility_id) {
    return res.status(400).json({ error: 'offender_id, type, facility_id are required' });
  }
  const synced = offline ? 0 : 1;
  const [{ id }] = await sql`
    INSERT INTO incidents (offender_id, type, injury, timestamp, facility_id, synced, logged_offline)
    VALUES (${offender_id}, ${type}, ${!!injury}, ${timestamp || new Date().toISOString()}, ${facility_id}, ${synced}, ${offline ? 1 : 0})
    RETURNING id
  `;

  res.status(201).json({ id, synced: !!synced });
});

// "Sync now" — flips every queued (synced=0) incident to synced=1.
// KPIs are recomputed on next /api/kpi read since they query live.
router.post('/sync', async (req, res) => {
  const result = await sql`UPDATE incidents SET synced = 1 WHERE synced = 0`;
  res.json({ synced_count: result.count });
});

module.exports = router;

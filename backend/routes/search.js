const express = require('express');
const sql = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  const like = `%${q}%`;

  const [offenders, warrants] = await Promise.all([
    sql`
      SELECT o.id, o.name, o.id_number, f.name AS facility_name
      FROM offenders o
      JOIN facilities f ON f.id = o.facility_id
      WHERE o.name ILIKE ${like} OR o.id_number ILIKE ${like} OR o.registration_number ILIKE ${like}
      ORDER BY o.name
      LIMIT 8
    `,
    sql`
      SELECT w.id, w.offender_id, w.warrant_type, w.warrant_category, o.name AS offender_name
      FROM warrants w
      JOIN offenders o ON o.id = w.offender_id
      WHERE w.warrant_type ILIKE ${like} OR w.charges ILIKE ${like} OR w.offence ILIKE ${like} OR o.name ILIKE ${like}
      ORDER BY w.created_at DESC
      LIMIT 5
    `
  ]);

  res.json([
    ...offenders.map((o) => ({
      type: 'offender',
      offender_id: o.id,
      title: o.name,
      meta: `${o.facility_name}${o.id_number ? ` · ${o.id_number}` : ''}`
    })),
    ...warrants.map((w) => ({
      type: 'warrant',
      offender_id: w.offender_id,
      title: `${w.warrant_type} — ${w.offender_name}`,
      meta: `Warrant · ${w.warrant_category}`
    }))
  ]);
});

module.exports = router;

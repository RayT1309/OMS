const express = require('express');
const sql = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const facilityId = req.user && req.user.facility_id;
  const warrants = await sql`
    SELECT w.*, o.name AS offender_name, f.name AS facility_name
    FROM warrants w
    JOIN offenders o ON o.id = w.offender_id
    JOIN facilities f ON f.id = o.facility_id
    ${facilityId ? sql`WHERE o.facility_id = ${facilityId}` : sql``}
    ORDER BY w.created_at DESC
  `;
  res.json(warrants);
});

module.exports = router;

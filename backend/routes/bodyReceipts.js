const express = require('express');
const sql = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const facilityId = req.user && req.user.facility_id;
  const receipts = await sql`
    SELECT b.*, f.name AS facility_name
    FROM body_receipts b
    JOIN facilities f ON f.id = b.facility_id
    ${facilityId ? sql`WHERE b.facility_id = ${facilityId}` : sql``}
    ORDER BY b.created_at DESC
  `;
  res.json(receipts);
});

router.post('/', async (req, res) => {
  const { facility_id, source_type, source, date_of_admission, total_inmates } = req.body;
  if (!facility_id || !source_type || !source || !date_of_admission || !total_inmates) {
    return res.status(400).json({ error: 'facility_id, source_type, source, date_of_admission, total_inmates are required' });
  }
  const [{ id }] = await sql`
    INSERT INTO body_receipts (facility_id, source_type, source, date_of_admission, total_inmates)
    VALUES (${facility_id}, ${source_type}, ${source}, ${date_of_admission}, ${total_inmates})
    RETURNING id
  `;

  const [created] = await sql`
    SELECT b.*, f.name AS facility_name FROM body_receipts b
    JOIN facilities f ON f.id = b.facility_id
    WHERE b.id = ${id}
  `;
  res.status(201).json(created);
});

module.exports = router;

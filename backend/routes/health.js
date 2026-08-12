const express = require('express');
const sql = require('../db');

const router = express.Router();

router.get('/:offenderId', async (req, res) => {
  const rows = await sql`SELECT * FROM health_records WHERE offender_id = ${req.params.offenderId}`;
  const record = rows[0];
  if (!record) return res.status(404).json({ error: 'No health record for this offender' });
  res.json(record);
});

router.put('/:offenderId', async (req, res) => {
  const { hiv_positive, viral_load_suppressed, tb_status } = req.body;
  const existingRows = await sql`SELECT * FROM health_records WHERE offender_id = ${req.params.offenderId}`;
  const existing = existingRows[0];

  if (existing) {
    await sql`
      UPDATE health_records SET
        hiv_positive = ${hiv_positive ?? existing.hiv_positive},
        viral_load_suppressed = ${viral_load_suppressed ?? existing.viral_load_suppressed},
        tb_status = ${tb_status ?? existing.tb_status}
      WHERE offender_id = ${req.params.offenderId}
    `;
  } else {
    await sql`
      INSERT INTO health_records (offender_id, hiv_positive, viral_load_suppressed, tb_status)
      VALUES (${req.params.offenderId}, ${!!hiv_positive}, ${!!viral_load_suppressed}, ${tb_status || 'none'})
    `;
  }
  res.json({ updated: true });
});

module.exports = router;

const express = require('express');
const sql = require('../db');
const { computeAlerts } = require('../alerts-engine');

const router = express.Router();

router.get('/', async (req, res) => {
  const facilityId = req.user && req.user.facility_id;
  res.json(await computeAlerts(sql, facilityId));
});

module.exports = router;

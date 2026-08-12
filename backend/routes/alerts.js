const express = require('express');
const sql = require('../db');
const { computeAlerts } = require('../alerts-engine');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await computeAlerts(sql));
});

module.exports = router;

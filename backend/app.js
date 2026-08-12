const express = require('express');
const cors = require('cors');
const sql = require('./db');

const offendersRouter = require('./routes/offenders');
const incidentsRouter = require('./routes/incidents');
const kpiRouter = require('./routes/kpi');
const healthRouter = require('./routes/health');
const bodyReceiptsRouter = require('./routes/bodyReceipts');
const warrantsRouter = require('./routes/warrants');
const searchRouter = require('./routes/search');
const alertsRouter = require('./routes/alerts');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./auth');
const { generateDailyReportsForAllFacilities } = require('./report-engine');

const app = express();
app.use(cors());
// Raised from Express's 100kb default to fit a base64-encoded photo
// (captured images are pre-compressed client-side, but base64 still adds
// ~33% overhead on top of the compressed size).
app.use(express.json({ limit: '8mb' }));

app.use('/api/auth', authRouter);

app.get('/api/facilities', requireAuth, async (req, res) => {
  res.json(await sql`SELECT * FROM facilities`);
});

app.use('/api/offenders', requireAuth, offendersRouter);
app.use('/api/incidents', requireAuth, incidentsRouter);
app.use('/api/kpi', requireAuth, kpiRouter);
app.use('/api/health', requireAuth, healthRouter);
app.use('/api/body-receipts', requireAuth, bodyReceiptsRouter);
app.use('/api/warrants', requireAuth, warrantsRouter);
app.use('/api/search', requireAuth, searchRouter);
app.use('/api/alerts', requireAuth, alertsRouter);
app.use('/api/reports', requireAuth, reportsRouter);

// Vercel Cron hits this to keep today's KPI snapshot current (see
// vercel.json). Guarded by the standard Vercel Cron auth header so it
// can't be triggered by arbitrary requests.
app.post('/api/cron/generate-reports', async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  await generateDailyReportsForAllFacilities(sql);
  res.json({ generated: true });
});

module.exports = app;

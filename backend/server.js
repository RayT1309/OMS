const sql = require('./db');
const app = require('./app');
const { generateDailyReportsForAllFacilities } = require('./report-engine');
const seed = require('./seed');

async function main() {
  // Ensure the DB is seeded on first run.
  const [{ n: offenderCount }] = await sql`SELECT COUNT(*) AS n FROM offenders`;
  if (Number(offenderCount) === 0) {
    await seed();
  }

  // Keep "today"'s report current on local server start (in production this
  // is handled by the Vercel Cron hitting /api/cron/generate-reports instead).
  await generateDailyReportsForAllFacilities(sql);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`OMS backend listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

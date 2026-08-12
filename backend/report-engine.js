const { computeKPIs } = require('./kpi-engine');

function dateOnly(d) {
  return d.toISOString().slice(0, 10);
}

// Upserts today's KPI snapshot for one facility. Idempotent per (facility,
// day) — safe to call repeatedly, e.g. once on every server start.
async function generateDailyReport(sql, facilityId, reportDate = dateOnly(new Date())) {
  const payload = await computeKPIs(sql, facilityId);
  await sql`
    INSERT INTO kpi_reports (facility_id, report_date, generated_at, payload)
    VALUES (${facilityId}, ${reportDate}, ${new Date().toISOString()}, ${sql.json(payload)})
    ON CONFLICT (facility_id, report_date) DO UPDATE SET generated_at = excluded.generated_at, payload = excluded.payload
  `;
}

async function generateDailyReportsForAllFacilities(sql, reportDate = dateOnly(new Date())) {
  const facilities = await sql`SELECT id FROM facilities`;
  for (const f of facilities) {
    await generateDailyReport(sql, f.id, reportDate);
  }
}

// Illustrative history only: this prototype has no real per-day incident
// deltas to replay, so past days are the current snapshot with small
// deterministic jitter — enough to make a trend view demonstrable.
async function backfillReportHistory(sql, days) {
  const facilities = await sql`SELECT id FROM facilities`;
  for (const f of facilities) {
    const base = await computeKPIs(sql, f.id);
    for (let i = days; i >= 1; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const jitter = (seed, spread) => Math.max(0, seed + (((f.id * 7 + i * 13) % 11) - 5) * spread);
      const payload = {
        ...base,
        generated_at: day.toISOString(),
        total_offenders: Math.round(jitter(base.total_offenders, 0.03)),
        escape_attempts: Math.max(0, base.escape_attempts - (i % 3 === 0 ? 1 : 0)),
        assaults: Math.max(0, base.assaults - (i % 4 === 0 ? 1 : 0))
      };
      await sql`
        INSERT INTO kpi_reports (facility_id, report_date, generated_at, payload)
        VALUES (${f.id}, ${dateOnly(day)}, ${day.toISOString()}, ${sql.json(payload)})
        ON CONFLICT (facility_id, report_date) DO NOTHING
      `;
    }
  }
}

async function getReportHistory(sql, facilityId, days = 30) {
  const rows = await sql`
    SELECT report_date, generated_at, payload FROM kpi_reports
    WHERE facility_id = ${facilityId}
    ORDER BY report_date DESC
    LIMIT ${days}
  `;
  return rows.map((r) => ({ report_date: r.report_date, generated_at: r.generated_at, ...r.payload }));
}

module.exports = { generateDailyReport, generateDailyReportsForAllFacilities, backfillReportHistory, getReportHistory };

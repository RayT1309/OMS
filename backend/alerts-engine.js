// Alerts engine — computed on demand from real operational signals, same
// on-demand-materialized-view approach as kpi-engine.js. Nothing is stored
// redundantly; every alert is derived from existing tables.

function daysBetween(dateStr) {
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function computeAlerts(sql, facilityId = null) {
  const alerts = [];
  const facilityScope = facilityId ? sql`AND o.facility_id = ${facilityId}` : sql``;

  // Court dates coming up within 7 days (or already passed and still "pending").
  const upcomingCourt = await sql`
    SELECT c.id, c.offender_id, c.case_number, c.next_court_date, o.name AS offender_name
    FROM court_cases c
    JOIN offenders o ON o.id = c.offender_id
    WHERE c.status = 'pending' AND c.next_court_date IS NOT NULL
    ${facilityScope}
  `;
  upcomingCourt.forEach((c) => {
    const days = daysBetween(c.next_court_date);
    if (days <= 7) {
      alerts.push({
        id: `court-${c.id}`,
        offender_id: c.offender_id,
        severity: days < 0 ? 'critical' : 'warning',
        title: days < 0 ? `Court date passed — ${c.offender_name}` : `Upcoming court date — ${c.offender_name}`,
        detail: `Case ${c.case_number} · ${new Date(c.next_court_date).toLocaleDateString('en-ZA')}`
      });
    }
  });

  // Parole hearings scheduled within 14 days.
  const upcomingParole = await sql`
    SELECT p.id, p.offender_id, p.hearing_date, o.name AS offender_name
    FROM parole_records p
    JOIN offenders o ON o.id = p.offender_id
    WHERE p.outcome = 'scheduled'
    ${facilityScope}
  `;
  upcomingParole.forEach((p) => {
    const days = daysBetween(p.hearing_date);
    if (days <= 14 && days >= 0) {
      alerts.push({
        id: `parole-${p.id}`,
        offender_id: p.offender_id,
        severity: days <= 3 ? 'critical' : 'warning',
        title: `Upcoming parole hearing — ${p.offender_name}`,
        detail: `${new Date(p.hearing_date).toLocaleDateString('en-ZA')} (${days} day${days === 1 ? '' : 's'})`
      });
    }
  });

  // Warrants whose custody-until date has already passed without a release on record.
  const expiredCustody = await sql`
    SELECT w.id, w.offender_id, w.custody_until_date, o.name AS offender_name
    FROM warrants w
    JOIN offenders o ON o.id = w.offender_id
    WHERE w.custody_until_date IS NOT NULL
      AND w.custody_until_date::date < current_date
      AND NOT EXISTS (SELECT 1 FROM releases r WHERE r.offender_id = w.offender_id)
    ${facilityScope}
  `;
  expiredCustody.forEach((w) => {
    alerts.push({
      id: `custody-${w.id}`,
      offender_id: w.offender_id,
      severity: 'critical',
      title: `Custody date expired — ${w.offender_name}`,
      detail: `Held to ${new Date(w.custody_until_date).toLocaleDateString('en-ZA')}, no release on record`
    });
  });

  // Incarcerated offenders with no Section D (Security) CRNA assessment on file.
  const missingSecurityAssessment = await sql`
    SELECT o.id, o.name
    FROM offenders o
    WHERE o.status = 'incarcerated'
      AND NOT EXISTS (SELECT 1 FROM section_d_assessments s WHERE s.offender_id = o.id)
    ${facilityId ? sql`AND o.facility_id = ${facilityId}` : sql``}
  `;
  missingSecurityAssessment.forEach((o) => {
    alerts.push({
      id: `crna-d-${o.id}`,
      offender_id: o.id,
      severity: 'info',
      title: `Missing Security risk assessment — ${o.name}`,
      detail: 'No CRNA Section D on file'
    });
  });

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return alerts;
}

module.exports = { computeAlerts };

// KPI groups mirror DCS's own four-pillar operating model (per the DCS URS
// dashboard requirement): Incarceration / Rehabilitation / Care / Releases.
// Traffic-light thresholds: lower is better for rates, "all sites live" is the good state.
const PILLARS = [
  {
    key: 'incarceration',
    label: 'Incarceration',
    cards: [
      {
        key: 'escape_rate', label: 'Escape Rate', format: (v) => `${(v * 100).toFixed(1)}%`,
        sub: (k) => `${k.escape_attempts} escapes/attempts / ${k.total_offenders} offenders`,
        status: (v) => (v >= 0.3 ? 'critical' : v >= 0.15 ? 'warning' : 'ok')
      },
      {
        key: 'assault_injury_rate', label: 'Assault Injury Rate', format: (v) => `${(v * 100).toFixed(1)}%`,
        sub: (k) => `${k.assault_injuries} injuries / ${k.assaults} assaults`,
        status: (v) => (v >= 0.5 ? 'critical' : v >= 0.25 ? 'warning' : 'ok')
      },
      {
        key: 'overcrowding_rate', label: 'Overcrowding', format: (v) => `${(v * 100).toFixed(0)}%`,
        sub: (k) => `${k.total_offenders} offenders / ${k.total_capacity} approved capacity`,
        status: (v) => (v > 1 ? 'critical' : v >= 0.9 ? 'warning' : 'ok')
      }
    ]
  },
  {
    key: 'rehabilitation',
    label: 'Rehabilitation',
    cards: [
      {
        key: 'education_completion_rate', label: 'Education Completion Rate', format: (v) => `${(v * 100).toFixed(1)}%`,
        sub: (k) => `${k.education_completed} completed / ${k.education_total} enrolments`,
        status: (v) => (v >= 0.5 ? 'ok' : v >= 0.25 ? 'warning' : 'critical')
      }
    ]
  },
  {
    key: 'care',
    label: 'Care',
    cards: [
      {
        key: 'tb_cure_rate', label: 'TB Cure Rate', format: (v) => `${(v * 100).toFixed(1)}%`,
        sub: (k) => `${k.tb_cured} cured / ${k.tb_ever_affected} ever affected`,
        status: (v) => (v >= 0.6 ? 'ok' : v >= 0.3 ? 'warning' : 'critical')
      }
    ]
  },
  {
    key: 'releases',
    label: 'Releases',
    cards: [
      {
        key: 'release_rate', label: 'Release Rate', format: (v) => `${(v * 100).toFixed(1)}%`,
        sub: (k) => `${k.released_offenders} released / ${k.total_offenders} offenders`,
        status: () => 'ok'
      }
    ]
  }
];

const SYSTEM_CARDS = [
  {
    key: 'sites_live', label: 'Sites Live', format: (v, k) => `${v} / ${k.total_facilities}`,
    sub: () => 'facilities with synced records',
    status: (v, k) => (v >= k.total_facilities ? 'ok' : 'warning')
  }
];

function Card({ def, kpis }) {
  return (
    <div className={`kpi-card kpi-card-${def.status(kpis[def.key], kpis)}`}>
      <div className="kpi-label">{def.label}</div>
      <div className="kpi-value">{def.format(kpis[def.key], kpis)}</div>
      <div className="kpi-sub">{def.sub(kpis)}</div>
    </div>
  );
}

export default function KpiCards({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="kpi-pillars">
      {PILLARS.map((pillar) => (
        <div className="kpi-pillar" key={pillar.key}>
          <h3 className="kpi-pillar-label">{pillar.label}</h3>
          <div className="kpi-cards">
            {pillar.cards.map((def) => <Card def={def} kpis={kpis} key={def.key} />)}
          </div>
        </div>
      ))}

      <div className="kpi-pillar" key="system">
        <h3 className="kpi-pillar-label">System</h3>
        <div className="kpi-cards">
          {SYSTEM_CARDS.map((def) => <Card def={def} kpis={kpis} key={def.key} />)}
          {kpis.pending_sync > 0 && (
            <div className="kpi-card kpi-card-warning">
              <div className="kpi-label">Pending Sync</div>
              <div className="kpi-value">{kpis.pending_sync}</div>
              <div className="kpi-sub">incidents excluded from KPIs until synced</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

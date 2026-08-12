import { useEffect, useState } from 'react';
import { api } from '../api';

const pct = (n) => `${(n * 100).toFixed(1)}%`;

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    try {
      setReports(await api.getKpiReports(30));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateKpiReport();
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportKpiReportsCsv(30);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading reports…</div>;
  if (error) return <div className="loading-screen error">{error}</div>;

  return (
    <div className="panel">
      <div className="screening-actions">
        <h2>Daily KPI Reports</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : "Generate today's report"}
          </button>
          <button type="button" className="btn-primary" onClick={handleExport} disabled={exporting || reports.length === 0}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <p className="empty">No reports yet for this management area.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Offenders</th>
                <th>Escape rate</th>
                <th>Assault injury rate</th>
                <th>Overcrowding</th>
                <th>TB cure rate</th>
                <th>Education completion</th>
                <th>Release rate</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.report_date}>
                  <td>{new Date(r.report_date).toLocaleDateString('en-ZA')}</td>
                  <td>{r.total_offenders}</td>
                  <td>{pct(r.escape_rate)}</td>
                  <td>{pct(r.assault_injury_rate)}</td>
                  <td>{pct(r.overcrowding_rate)}</td>
                  <td>{pct(r.tb_cure_rate)}</td>
                  <td>{pct(r.education_completion_rate)}</td>
                  <td>{pct(r.release_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

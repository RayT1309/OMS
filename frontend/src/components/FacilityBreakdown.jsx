import { useEffect, useState } from 'react';
import { api } from '../api';

function pct(n) {
  return `${Math.round((n || 0) * 100)}%`;
}

export default function FacilityBreakdown({ scope }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getFacilityBreakdown().then(setRows).catch((err) => setError(err.message));
  }, []);

  if (error) return null;
  if (!rows) return null;

  return (
    <div className="panel">
      <h2>{scope === 'national' ? 'All Facilities' : 'Facilities in Region'}</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Facility</th>
              {scope === 'national' && <th>Region</th>}
              <th>Offenders</th>
              <th>Physically Present</th>
              <th>Overcrowding</th>
              <th>Escape Rate</th>
              <th>Assault Injury Rate</th>
              <th>Pending Sync</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.facility_id}>
                <td>{r.facility_name}</td>
                {scope === 'national' && <td>{r.region}</td>}
                <td>{r.total_offenders}</td>
                <td>{r.physically_present}</td>
                <td>{pct(r.overcrowding_rate)}</td>
                <td>{pct(r.escape_rate)}</td>
                <td>{pct(r.assault_injury_rate)}</td>
                <td>{r.pending_sync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

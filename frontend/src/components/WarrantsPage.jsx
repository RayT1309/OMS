import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const TYPE_LABEL = {
  J7: 'J7 — Detention pending trial',
  J138A: 'J138A — Psychiatric evaluation (unsentenced)',
  J138E: 'J138E — Psychiatric evaluation (sentenced)',
  G306: 'G306 — Arrest & detention of parolee/probationer',
  SAP69: 'SAP69 — Report of convictions',
  G344: 'G344 — Inmate with further charges',
  J1: 'J1 — Warrant of liberation'
};

export default function WarrantsPage() {
  const [warrants, setWarrants] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setWarrants(await api.getWarrants());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading-screen">Loading warrants…</div>;
  if (error) return <div className="loading-screen error">Failed to load: {error}</div>;

  const filtered = category === 'all' ? warrants : warrants.filter((w) => w.warrant_category === category);

  return (
    <div className="panel">
      <div className="screening-actions">
        <h2>Warrants</h2>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          <option value="unsentenced">Unsentenced</option>
          <option value="sentenced">Sentenced</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">No warrants on record.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Inmate</th>
                <th>Facility</th>
                <th>Warrant Type</th>
                <th>Category</th>
                <th>Captured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="row-clickable" onClick={() => navigate(`/offenders/${w.offender_id}`)}>
                  <td>{w.offender_name}</td>
                  <td>{w.facility_name}</td>
                  <td>{TYPE_LABEL[w.warrant_type] || w.warrant_type}</td>
                  <td>
                    <span className={`status-pill status-${w.warrant_category === 'sentenced' ? 'incarcerated' : 'released'}`}>
                      {w.warrant_category}
                    </span>
                  </td>
                  <td>{new Date(w.created_at).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

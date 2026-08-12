import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function FacilityPicker({ user, onSelected }) {
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getFacilities().then(setFacilities).catch((err) => setError(err.message));
  }, []);

  const grouped = useMemo(() => {
    const byRegion = {};
    facilities.forEach((f) => {
      const region = f.region || 'Other';
      if (!byRegion[region]) byRegion[region] = [];
      byRegion[region].push(f);
    });
    return Object.entries(byRegion).sort(([a], [b]) => a.localeCompare(b));
  }, [facilities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const updatedUser = await api.setFacility(Number(selected));
      onSelected(updatedUser);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">OMS</div>
        <h1>Select your management area</h1>
        <p className="subtitle">{user.name}, choose the facility you work at to continue</p>

        <label className="form-field">
          <span>Management area</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} required autoFocus>
            <option value="" disabled>Select a management area…</option>
            {grouped.map(([region, list]) => (
              <optgroup label={region} key={region}>
                {list.map((f) => (
                  <option value={f.id} key={f.id}>{f.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting || !selected} style={{ width: '100%', marginTop: 4 }}>
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}

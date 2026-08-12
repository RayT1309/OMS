import { useState } from 'react';

const RELEASE_TYPES = [
  ['court', 'Court'],
  ['hospital', 'Hospital'],
  ['police_station', 'Police Station'],
  ['correctional_centre', 'Correctional Centre'],
  ['labour', 'Labour'],
  ['community_corrections', 'Community Corrections']
];

const EMPTY = { release_date: new Date().toISOString().slice(0, 10), release_type: '' };

export default function AddReleaseModal({ onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Release Inmate to Authorised Area" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Release Inmate to Authorised Area</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="wizard-grid">
            <label className="form-field">
              <span>Release Date</span>
              <input type="date" value={values.release_date} onChange={(e) => set('release_date', e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Release Type</span>
              <select value={values.release_type} onChange={(e) => set('release_type', e.target.value)} required>
                <option value="">Select…</option>
                {RELEASE_TYPES.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field checkbox-label">
            <input type="checkbox" checked={showPayment} onChange={(e) => setShowPayment(e.target.checked)} />
            <span>Payment made (bail / fine)</span>
          </label>

          {showPayment && (
            <div className="wizard-grid">
              <label className="form-field">
                <span>Amount Paid</span>
                <input type="number" step="0.01" min="0" value={values.amount_paid || ''} onChange={(e) => set('amount_paid', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Date Paid</span>
                <input type="date" value={values.date_paid || ''} onChange={(e) => set('date_paid', e.target.value)} />
              </label>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Record Release'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

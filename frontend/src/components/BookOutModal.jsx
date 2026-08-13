import { useState } from 'react';

const REASONS = [
  ['court', 'Court Appearance'],
  ['hospital', 'Hospital'],
  ['other', 'Other']
];

const EMPTY = { reason: 'court', expected_return: '', note: '' };

export default function BookOutModal({ courtCases, onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        reason: values.reason,
        expected_return: values.expected_return || null,
        note: values.note || null,
        court_case_id: values.reason === 'court' && values.court_case_id ? values.court_case_id : null
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Book Out" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Out</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-field">
            <span>Reason</span>
            <select value={values.reason} onChange={(e) => set('reason', e.target.value)} required>
              {REASONS.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          {values.reason === 'court' && courtCases.length > 0 && (
            <label className="form-field">
              <span>Court Case (optional)</span>
              <select value={values.court_case_id || ''} onChange={(e) => set('court_case_id', e.target.value)}>
                <option value="">Select…</option>
                {courtCases.map((c) => (
                  <option key={c.id} value={c.id}>{c.charge} ({c.case_number})</option>
                ))}
              </select>
            </label>
          )}

          <label className="form-field">
            <span>Expected Return</span>
            <input type="datetime-local" value={values.expected_return} onChange={(e) => set('expected_return', e.target.value)} />
          </label>

          <label className="form-field">
            <span>Note (optional)</span>
            <input type="text" value={values.note} onChange={(e) => set('note', e.target.value)} />
          </label>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Booking out…' : 'Book Out'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

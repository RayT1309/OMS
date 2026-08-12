import { useState } from 'react';

const YES_NO_FIELDS = [
  { key: 'illness_needs_treatment', specify: 'illness_specify', label: 'Suffering from any illness/disease requiring treatment?' },
  { key: 'injuries_needs_attention', specify: 'injuries_specify', label: 'Any injuries needing health care attention?' },
  { key: 'medication_in_possession', specify: 'medication_specify', label: 'Any medication in their possession?' },
  { key: 'recent_operation', specify: 'recent_operation_specify', label: 'Any operation performed in the last 3 months?' },
  { key: 'scheduled_appointments', specify: 'scheduled_appointments_specify', label: 'Any scheduled medical appointments?' },
  { key: 'medic_alert', specify: 'medic_alert_specify', label: 'Medic-alert bracelet or necklace?' },
  { key: 'disabilities', specify: 'disabilities_specify', label: 'Any disabilities?' },
  { key: 'prostheses', specify: 'prostheses_specify', label: 'Uses any prostheses/medical assistance device(s)?' },
  { key: 'hygiene_acceptable', specify: 'hygiene_specify', label: "Is personal hygiene of an acceptable standard?" }
];

const EMPTY = {
  assessment_date: new Date().toISOString().slice(0, 10),
  assessed_by: '',
  allergies: '',
  behavioural_observation: '',
  last_meal: '',
  additional_comments: '',
  ...Object.fromEntries(YES_NO_FIELDS.flatMap((f) => [[f.key, 'no'], [f.specify, '']]))
};

export default function AddHealthAssessmentModal({ onClose, onSubmit }) {
  const [values, setValues] = useState(EMPTY);
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
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Admission Health and Risk Assessment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Admission Health and Risk Assessment</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="wizard-grid">
            <label className="form-field">
              <span>Assessment Date</span>
              <input type="date" value={values.assessment_date} onChange={(e) => set('assessment_date', e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Assessed By</span>
              <input type="text" value={values.assessed_by} onChange={(e) => set('assessed_by', e.target.value)} />
            </label>
            <label className="form-field">
              <span>Allergies</span>
              <input type="text" value={values.allergies} onChange={(e) => set('allergies', e.target.value)} />
            </label>
            <label className="form-field">
              <span>Behavioural Observation</span>
              <input type="text" value={values.behavioural_observation} onChange={(e) => set('behavioural_observation', e.target.value)} placeholder="Consciousness, mental status, conduct, tremors, sweating" />
            </label>
          </div>

          {YES_NO_FIELDS.map((f) => (
            <div className="wizard-grid" key={f.key}>
              <label className="form-field">
                <span>{f.label}</span>
                <select value={values[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              {values[f.key] === 'yes' && (
                <label className="form-field">
                  <span>Specify</span>
                  <input type="text" value={values[f.specify]} onChange={(e) => set(f.specify, e.target.value)} />
                </label>
              )}
            </div>
          ))}

          <label className="form-field">
            <span>When was the last meal? (if &gt;5 hours, a snack is provided)</span>
            <input type="text" value={values.last_meal} onChange={(e) => set('last_meal', e.target.value)} placeholder="e.g. 2 hours ago" />
          </label>

          <label className="form-field">
            <span>Additional Information, Comments and Instructions</span>
            <textarea rows={3} value={values.additional_comments} onChange={(e) => set('additional_comments', e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';

const ESCAPE_CATEGORIES = [
  ['escaped', 'Escaped'], ['attempted_escape', 'Attempted to escape'],
  ['aided_escape', 'Aided an escape'], ['escape_none', 'None of the above']
];
const BREACH_CATEGORIES = [
  ['probation_revoked', 'Probation revoked'], ['breached_parole', 'Breached Parole'],
  ['breached_bail', 'Breached Bail conditions'], ['absconded', 'Absconded']
];

function CheckboxGrid({ prefix, categories, values, set }) {
  return (
    <div className="checkbox-grid">
      {categories.map(([key, label]) => (
        <label className="form-field checkbox-label" key={key}>
          <input type="checkbox" checked={!!values[`${prefix ? prefix + '_' : ''}${key}`]} onChange={(e) => set(`${prefix ? prefix + '_' : ''}${key}`, e.target.checked)} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

function YesNo({ field, label, values, set }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select value={values[field] || 'no'} onChange={(e) => set(field, e.target.value)}>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
    </label>
  );
}

function YesNoSpecify({ field, specifyField, label, values, set }) {
  return (
    <div className="wizard-grid">
      <YesNo field={field} label={label} values={values} set={set} />
      {values[field] === 'yes' && (
        <label className="form-field">
          <span>Specify</span>
          <input type="text" value={values[specifyField] || ''} onChange={(e) => set(specifyField, e.target.value)} />
        </label>
      )}
    </div>
  );
}

const EMPTY = { assessment_date: new Date().toISOString().slice(0, 10), assessed_by: '' };

export default function AddSectionDAssessmentModal({ onClose, onSubmit }) {
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
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Comprehensive Risk and Needs Assessment — Section D" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comprehensive Risk &amp; Needs Assessment — Section D: Security</h3>
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
          </div>

          <div className="assessment-section-title">Security Risk Assessment</div>
          <div className="wizard-grid">
            <label className="form-field">
              <span>Categorization of previous crimes</span>
              <select value={values.previous_crime_category || ''} onChange={(e) => set('previous_crime_category', e.target.value)}>
                <option value="">Select…</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
              </select>
            </label>
            <label className="form-field">
              <span>Category of current crime</span>
              <select value={values.current_crime_category || ''} onChange={(e) => set('current_crime_category', e.target.value)}>
                <option value="">Select…</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
              </select>
            </label>
          </div>
          <YesNo field="serving_multiple_sentences" label="Is the inmate serving more than one sentence?" values={values} set={set} />

          <div className="assessment-subsection-title">Has the inmate previously escaped, attempted to escape or aided in an escape?</div>
          <CheckboxGrid categories={ESCAPE_CATEGORIES} values={values} set={set} />

          <div className="assessment-subsection-title">Previous probation placements revoked, or breach of parole / bail conditions</div>
          <CheckboxGrid categories={BREACH_CATEGORIES} values={values} set={set} />

          <YesNo field="institutional_offences" label="Institutional offences / disciplinary actions against the offender?" values={values} set={set} />
          <YesNoSpecify field="convicted_racial_political_offence" specifyField="convicted_racial_political_offence_specify" label="Ever convicted of an offence involving racism, racial or political conflict?" values={values} set={set} />
          <YesNoSpecify field="further_charges" specifyField="further_charges_specify" label="Does the offender have further charges against him/her?" values={values} set={set} />
          <YesNoSpecify field="threatened_since_admission" specifyField="threatened_since_admission_specify" label="Since admission, has anyone verbally threatened to take something by force or by threatening to hurt the offender?" values={values} set={set} />

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

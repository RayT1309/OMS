import { useState } from 'react';

const EMPLOYMENT_TYPES = [
  'Full time / Permanent', 'Part-time', 'Seasonal employment', 'Temporary employment',
  'Self-employed', 'Consultation / Contract basis', 'Unemployed'
];

const EMPTY = {
  assessment_date: new Date().toISOString().slice(0, 10),
  assessed_by: ''
};

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

export default function AddSectionBAssessmentModal({ onClose, onSubmit }) {
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
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Comprehensive Risk and Needs Assessment — Section B" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comprehensive Risk &amp; Needs Assessment — Section B: Education, Sports, Recreation and Employment</h3>
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

          <div className="assessment-section-title">Education</div>
          <YesNo field="can_read_write" label="Can the inmate read and write?" values={values} set={set} />
          <div className="wizard-grid">
            <label className="form-field">
              <span>Highest grade the inmate passed</span>
              <select value={values.highest_grade_category || ''} onChange={(e) => set('highest_grade_category', e.target.value)}>
                <option value="">Select…</option>
                <option value="ABET level (1 to 4)">ABET level (1 to 4)</option>
                <option value="Grade (1 to 12)">Grade (1 to 12)</option>
              </select>
            </label>
            <label className="form-field">
              <span>Year qualification obtained</span>
              <input type="date" value={values.qualification_year || ''} onChange={(e) => set('qualification_year', e.target.value)} />
            </label>
          </div>
          <YesNoSpecify field="trained_profession" specifyField="trained_profession_specify" label="Trained in any specific profession, skill or trade?" values={values} set={set} />
          <div className="wizard-grid">
            <label className="form-field">
              <span>Practical experience in profession/skill/trade (years)</span>
              <input type="number" min="0" value={values.practical_experience_years || ''} onChange={(e) => set('practical_experience_years', e.target.value)} />
            </label>
          </div>
          <YesNoSpecify field="qualified_registered" specifyField="qualified_registered_specify" label="Qualified or registered for a specific profession, skill, trade?" values={values} set={set} />
          <YesNo field="tertiary_education" label="Does the inmate have any tertiary education?" values={values} set={set} />
          {values.tertiary_education === 'yes' && (
            <div className="wizard-grid">
              <label className="form-field">
                <span>Degree / Diploma / Certificate</span>
                <input type="text" value={values.tertiary_qualification || ''} onChange={(e) => set('tertiary_qualification', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Field of study</span>
                <input type="text" value={values.tertiary_field_of_study || ''} onChange={(e) => set('tertiary_field_of_study', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Year obtained</span>
                <input type="date" value={values.tertiary_year_obtained || ''} onChange={(e) => set('tertiary_year_obtained', e.target.value)} />
              </label>
            </div>
          )}
          <YesNoSpecify field="currently_studying" specifyField="currently_studying_specify" label="Currently studying or registered for studies with any institution?" values={values} set={set} />
          <YesNoSpecify field="education_training_needs" specifyField="education_training_needs_specify" label="Any specific education & training needs?" values={values} set={set} />

          <div className="assessment-section-title">Sports and Recreation</div>
          <YesNoSpecify field="has_skills_hobbies" specifyField="skills_hobbies_specify" label="Does the inmate have skills, interests and hobbies?" values={values} set={set} />
          <YesNoSpecify field="competitive_sport" specifyField="competitive_sport_specify" label="Played any competitive sport (Club, Regional or National level)?" values={values} set={set} />
          <YesNoSpecify field="sport_recreation_training" specifyField="sport_recreation_training_specify" label="Formal training in Sport and Recreation activities (e.g. coaching, sport administration)?" values={values} set={set} />
          <YesNoSpecify field="arts_cultural_training" specifyField="arts_cultural_training_specify" label="Formal training in Arts and Cultural activities (e.g. professional dancer, fine arts, graphic designer)?" values={values} set={set} />

          <div className="assessment-section-title">Employment History</div>
          <YesNo field="employed_before_incarceration" label="Was the inmate employed prior to arrest and incarceration?" values={values} set={set} />
          {values.employed_before_incarceration === 'yes' && (
            <label className="form-field">
              <span>Type of employment</span>
              <select value={values.employment_type || ''} onChange={(e) => set('employment_type', e.target.value)}>
                <option value="">Select…</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}

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

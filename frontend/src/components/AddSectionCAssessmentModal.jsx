import { useState } from 'react';

const SUPPORT_CATEGORIES = [
  ['religious_services', 'Religious Services'], ['baptism', 'Baptism'], ['counselling', 'Counselling'],
  ['spiritual_visits', 'Visits from Spiritual Care Workers'], ['marriage_counselling', 'Marriage Counselling'],
  ['consultation', 'Consultation']
];
const SIGNIFICANT_CATEGORIES = [
  ['spouse', 'Spouse'], ['parents', 'Parents'], ['grandparents', 'Grandparents'], ['siblings', 'Siblings'],
  ['uncle', 'Uncle'], ['aunt', 'Aunt'], ['own_children', 'Own Children'], ['in_laws', 'In-laws'], ['friends', 'Friends']
];
const CONTACT_CATEGORIES = [
  ['visits', 'Visits'], ['telephone', 'Telephone calls'], ['letters', 'Letters'], ['none', 'No Contact']
];
const SEX_OFFENCE_CATEGORIES = [
  ['rape', 'Rape'], ['attempted_rape', 'Attempted Rape'], ['sexual_assault', 'Sexual assault'],
  ['statutory_rape', 'Statutory Rape'], ['indecent_assault', 'Indecent Assault'], ['sodomy', 'Sodomy']
];
const ACCOMMODATION_TYPES = [
  'Own Home', 'Renting a house', 'Renting a flat/room', 'Sharing a flat/room with a relative or friend',
  'Lived on the streets', 'Lived in a shelter', 'Shack', 'Other'
];
const NEIGHBOURHOOD_TYPES = [
  'Informal settlement / Shack', 'Government housing (RDP)', 'Inner city high – flats', 'Township',
  'Suburb', 'Rural area', 'Farm / small holding', 'Hostel', 'Other'
];

function CheckboxGrid({ prefix, categories, values, set }) {
  return (
    <div className="checkbox-grid">
      {categories.map(([key, label]) => (
        <label className="form-field checkbox-label" key={key}>
          <input type="checkbox" checked={!!values[`${prefix}_${key}`]} onChange={(e) => set(`${prefix}_${key}`, e.target.checked)} />
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

export default function AddSectionCAssessmentModal({ onClose, onSubmit }) {
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
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Comprehensive Risk and Needs Assessment — Section C" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comprehensive Risk &amp; Needs Assessment — Section C: Spiritual Care, Social and Emotional Wellbeing</h3>
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

          <div className="assessment-section-title">Spiritual Care</div>
          <YesNoSpecify field="faith_member" specifyField="faith_member_specify" label="Member or follower of any faith, religion, belief or denomination?" values={values} set={set} />
          <label className="form-field">
            <span>Role or position in faith, belief, church or denomination</span>
            <input type="text" value={values.faith_role || ''} onChange={(e) => set('faith_role', e.target.value)} />
          </label>
          <YesNoSpecify field="faith_active_before" specifyField="faith_active_before_specify" label="Actively involved in church/faith activities before incarceration?" values={values} set={set} />
          <YesNo field="needs_spiritual_support" label="Needs spiritual support from church/faith representative/minister?" values={values} set={set} />
          {values.needs_spiritual_support === 'yes' && (
            <>
              <div className="assessment-subsection-title">Type of Support Needed</div>
              <CheckboxGrid prefix="support" categories={SUPPORT_CATEGORIES} values={values} set={set} />
              <label className="form-field">
                <span>Other support, specify</span>
                <input type="text" value={values.support_other || ''} onChange={(e) => set('support_other', e.target.value)} />
              </label>
            </>
          )}
          <YesNo field="wants_religious_participation" label="Wants to participate/continue with religious activities in the Correctional Centre?" values={values} set={set} />

          <div className="assessment-section-title">Social Risk Assessment</div>
          <label className="form-field">
            <span>With whom was the inmate staying at the time of arrest?</span>
            <input type="text" value={values.staying_with_at_arrest || ''} onChange={(e) => set('staying_with_at_arrest', e.target.value)} />
          </label>
          <div className="assessment-subsection-title">Current Significant Family Members, Relatives or Friends</div>
          <CheckboxGrid prefix="significant" categories={SIGNIFICANT_CATEGORIES} values={values} set={set} />
          <label className="form-field">
            <span>Others, specify</span>
            <input type="text" value={values.significant_other || ''} onChange={(e) => set('significant_other', e.target.value)} />
          </label>
          <div className="wizard-grid">
            <label className="form-field">
              <span>Type of accommodation prior to arrest and incarceration</span>
              <select value={values.accommodation_type || ''} onChange={(e) => set('accommodation_type', e.target.value)}>
                <option value="">Select…</option>
                {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            {values.accommodation_type === 'Other' && (
              <label className="form-field">
                <span>If other, specify</span>
                <input type="text" value={values.accommodation_other_specify || ''} onChange={(e) => set('accommodation_other_specify', e.target.value)} />
              </label>
            )}
          </div>
          <div className="wizard-grid">
            <label className="form-field">
              <span>Type of neighbourhood the offender grew up in</span>
              <select value={values.neighbourhood_type || ''} onChange={(e) => set('neighbourhood_type', e.target.value)}>
                <option value="">Select…</option>
                {NEIGHBOURHOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            {values.neighbourhood_type === 'Other' && (
              <label className="form-field">
                <span>If other, specify</span>
                <input type="text" value={values.neighbourhood_other_specify || ''} onChange={(e) => set('neighbourhood_other_specify', e.target.value)} />
              </label>
            )}
          </div>
          <div className="assessment-subsection-title">Type of Contact with Significant Others</div>
          <CheckboxGrid prefix="contact" categories={CONTACT_CATEGORIES} values={values} set={set} />
          <label className="form-field">
            <span>Other contact, specify</span>
            <input type="text" value={values.contact_other || ''} onChange={(e) => set('contact_other', e.target.value)} />
          </label>
          <YesNo field="wants_contact_established" label="If no contact with family/friends, does the inmate want to establish contact?" values={values} set={set} />
          <YesNoSpecify field="relationship_problems" specifyField="relationship_problems_specify" label="Relationship problems with significant others that need mediation?" values={values} set={set} />
          <YesNo field="has_dependants" label="Does the inmate have any dependants?" values={values} set={set} />
          {values.has_dependants === 'yes' && (
            <>
              <div className="wizard-grid">
                <label className="form-field">
                  <span>Number of adult dependants</span>
                  <input type="number" min="0" value={values.num_adult_dependants || ''} onChange={(e) => set('num_adult_dependants', e.target.value)} />
                </label>
                <label className="form-field">
                  <span>Number of child dependants</span>
                  <input type="number" min="0" value={values.num_child_dependants || ''} onChange={(e) => set('num_child_dependants', e.target.value)} />
                </label>
              </div>
              <YesNo field="dependants_related" label="Are the dependants related to the inmate?" values={values} set={set} />
              {values.dependants_related === 'yes' && (
                <div className="wizard-grid">
                  <label className="form-field">
                    <span>Name of dependant</span>
                    <input type="text" value={values.dependant_name || ''} onChange={(e) => set('dependant_name', e.target.value)} />
                  </label>
                  <label className="form-field">
                    <span>Relationship to inmate</span>
                    <input type="text" value={values.dependant_relationship || ''} onChange={(e) => set('dependant_relationship', e.target.value)} />
                  </label>
                  <label className="form-field">
                    <span>Age</span>
                    <input type="text" value={values.dependant_age || ''} onChange={(e) => set('dependant_age', e.target.value)} />
                  </label>
                </div>
              )}
              <div className="wizard-grid">
                <YesNo field="responsible_child_maintenance" label="Responsible for child maintenance?" values={values} set={set} />
                <YesNo field="sole_provider" label="Sole provider of the dependants?" values={values} set={set} />
              </div>
              {values.sole_provider === 'yes' && (
                <YesNo field="dependants_need_social_assistance" label="Do the dependants require social assistance?" values={values} set={set} />
              )}
            </>
          )}

          <div className="assessment-section-title">Emotional Well-Being</div>
          <YesNo field="mental_illness_treatment" label="Ever received any treatment for mental illness?" values={values} set={set} />
          {values.mental_illness_treatment === 'yes' && (
            <label className="form-field">
              <span>Specify when (year and month)</span>
              <input type="month" value={values.mental_illness_treatment_date || ''} onChange={(e) => set('mental_illness_treatment_date', e.target.value)} />
            </label>
          )}
          <YesNo field="currently_on_mental_treatment" label="Currently on treatment/medication for mental illness?" values={values} set={set} />
          <YesNoSpecify field="suicide_self_harm_treated" specifyField="suicide_self_harm_specify" label="Ever been treated for attempted suicide / self-harm?" values={values} set={set} />
          <YesNo field="suicidal_thoughts_now" label="Suicidal thoughts or thinking of harming self now?" values={values} set={set} />
          <YesNo field="flashbacks_nightmares" label="Recently experienced flashbacks or nightmares related to the victim or incident?" values={values} set={set} />

          <YesNo field="convicted_sexual_offence_ever" label="Ever been convicted of any sexual offence of any nature?" values={values} set={set} />
          {values.convicted_sexual_offence_ever === 'yes' && (
            <>
              <CheckboxGrid prefix="prev_sex" categories={SEX_OFFENCE_CATEGORIES} values={values} set={set} />
              <label className="form-field">
                <span>Other, specify</span>
                <input type="text" value={values.prev_sex_other || ''} onChange={(e) => set('prev_sex_other', e.target.value)} />
              </label>
            </>
          )}
          <YesNo field="current_conviction_sexual_offence" label="Does the inmate's current conviction involve a sexual offence?" values={values} set={set} />
          {values.current_conviction_sexual_offence === 'yes' && (
            <>
              <CheckboxGrid prefix="current_sex" categories={SEX_OFFENCE_CATEGORIES} values={values} set={set} />
              <label className="form-field">
                <span>Other, specify</span>
                <input type="text" value={values.current_sex_other || ''} onChange={(e) => set('current_sex_other', e.target.value)} />
              </label>
            </>
          )}
          <YesNoSpecify field="victim_before_imprisonment" specifyField="victim_before_imprisonment_specify" label="Before imprisonment, ever a victim of physical, emotional, sexual abuse and/or crime?" values={values} set={set} />
          <YesNo field="abused_since_admission" label="Since arrest/admission, has the inmate been physically or sexually abused?" values={values} set={set} />
          {values.abused_since_admission === 'yes' && (
            <YesNo field="abused_reported_incident" label="Has he/she reported the incident?" values={values} set={set} />
          )}
          <YesNoSpecify field="court_recommended_treatment" specifyField="court_recommended_treatment_specify" label="Did the court recommend psychological/psychiatric treatment as part of the sentence?" values={values} set={set} />

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

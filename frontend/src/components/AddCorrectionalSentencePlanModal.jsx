import { useState } from 'react';

const CATEGORY_LABEL = {
  corrections: '1. Corrections',
  development: '2. Development',
  care_spiritual: '3. Care — Spiritual Care',
  care_social: '3. Care — Social Functioning',
  care_emotional: '3. Care — Emotional/Psychological Well-being',
  care_health: '3. Care — Health Care',
  social_integration: '4. Social Integration',
  security: '5. Security',
  facilities: '6. Facilities'
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL);

const TIMEFRAME_OPTIONS = ['Short term', 'Medium term', 'Long term'];

const CORRECTIONS_CRIME_OPTIONS = [
  'Aggressive Offences (Murder, Culpable Homicide, Assault, Rape)',
  'Sexual Offences (Sexual assault, Indecent assault, rape, etc)',
  'Robbery and related offences',
  'Economic Offences (Theft related, Fraud, Deception)',
  'Drug and Alcohol related offences',
  'Weapons and Explosives offences (other than firearms and ammunition)',
  'Property and Environmental Damage',
  'Public Order and Public Welfare offences',
  'Road Traffic and Vehicle Regulatory offences',
  'Offences against Justice, Procedures, Government Security and Government Operations',
  'Trafficking related offences (human, drugs, endangered species, etc)',
  'Offences against Freedom of movement',
  'Gang membership/ Criminal associations',
  'Other'
];
const CORRECTIONS_PROGRAMME_OPTIONS = [
  'Anger Management Programme', 'Changing Lanes', 'Psychological Services', 'Social Work Services',
  'Cross Roads', 'New Beginnings', 'Behaviour Mod on Gangsterism', 'Sexual Offences Programme',
  'Preparatory Sexual Offences Programme', 'Economic Crime Programme: Theft related',
  'Economic Crime Programme: Fraud related', 'Substance Abuse Programme', 'Placement in drug-free cell',
  'Support groups e.g Alcoholics Anonymous (AA)',
  'SANCA Drug and Alcohol Treatment Programme/Service e.g Ahanang substance abuse program',
  'Placement', 'Life Skills Programme (Distancing self from high-risk offenders, ending gang membership)',
  'Place in employment work groups', 'Separate offender from other gang members'
];
const CORRECTIONS_PROVIDER_OPTIONS = [
  'Social Worker/ CO', 'CIO', 'Psychologist', 'Unit Manager', 'Centre Coordinator Security',
  'Educationist', 'Skills Developer', 'SRAC Official', 'CMC Chairman', 'Religious Worker',
  'Religious Care Clerk', 'Health Care Worker', 'Coordinator HIV/AIDS', 'Reintegration Official'
];

const DEVELOPMENT_NEED_OPTIONS = [
  'General Education and Training Certificate (GETC)', 'Further Education and Training (FETC)',
  'Higher Education and Training (HET)', 'Skills Development',
  'Sport, Recreation, Arts and Culture (SRAC)', 'Work Opportunities'
];
const DEVELOPMENT_PROGRAMME_OPTIONS = [
  'Pre-ABET', 'ABET Level 1-4', 'Grade 10-12', 'Occupation Specific (specify)', 'Certificate Course (specify)',
  'Diploma/ Postgraduate Diploma (specify)', 'Junior Degree (Specify)', 'Higher Degree (specify)',
  'Trade (specify)', 'Occupation Skills Development Courses (specify)', 'Sport Code (specify)',
  'Recreational Activity(specify)', 'Art (specify)', 'Culture (specify)', 'Production workshop',
  'Agriculture', 'Maintenance', 'Kitchen', 'Laundry', 'Other Specify'
];
const DEVELOPMENT_PROGRAMMES_NEEDING_SPECIFY = new Set(
  DEVELOPMENT_PROGRAMME_OPTIONS.filter((o) => /specify/i.test(o))
);

const CARE_SPIRITUAL_NEED_OPTIONS = [
  'Involvement in religious group', 'Leadership position in group', 'Has specific spiritual needs', 'Spiritual healing'
];
const CARE_SOCIAL_NEED_OPTIONS = [
  'Building and maintaining contact with family and friends',
  'Relationship problem with family and significant others',
  'Requires assistance for his/her dependants (Primary caregiver/ Sole provider)'
];
const CARE_EMOTIONAL_NEED_OPTIONS = [
  'Previous treatment for mental illness', 'Previous treatment for suicide attempt/ self-harm',
  'Current treatment/ medication for mental illness', 'Has suicidal thoughts/ threatening to commit suicide',
  'Is a victim of physical, sexual abuse or crime prior to incarceration',
  'Has been physically or sexually abused in the correctional centre',
  'Needs some help with nightmares/ flashbacks',
  'The court recommended psychological/ psychiatric treatment as part of the sentence'
];
const CARE_HEALTH_NEED_OPTIONS = ['HIV Aids services and Programmes'];
const CARE_PROGRAMME_OPTIONS = [
  'Weekly Church Service', 'Specify', 'Spiritual Counselling', 'NAIKAN Programme', 'Social Work Services',
  'Spiritual Care Services', 'Mediation Services: Restorative Justice Orientation Programme',
  'Restorative Justice Programme', 'Health Care Services', 'HIV/AIDS Awareness', 'Psychological / Health Care Services'
];
const CARE_PROVIDER_OPTIONS = [
  'Religious Care Clerk', 'CIO', 'Social Worker', 'Psychologist / Health Care', 'Health Care Manager', 'Coordinator HIV/AIDS'
];

const SOCIAL_INTEGRATION_NEED_OPTIONS = [
  'Preparation for release', 'Accommodation', 'Support System(s)', 'Employment', 'Other(Specify)'
];
const SOCIAL_INTEGRATION_PROGRAMME_OPTIONS = [
  'Pre-Release Programme', 'Address Confirmation', 'Telephone calls/ Visits/ Letters'
];
const SOCIAL_INTEGRATION_PROVIDER_OPTIONS = ['Reintegration Official/CIO', 'SRAC Official'];

const SECURITY_NEED_OPTIONS = [
  'Previous crimes categorized as high risks', 'Current crimes categorized as high risk',
  'Length of sentence(s)', 'Previously escaped, attempted to escape or assisted in escape',
  'Previously revoked probation placement, breached parole/ bail conditions',
  'Has institutional/ disciplinary charges',
  'Convicted of an offence that involves racism, racial/ political conflict',
  'Has received verbal threats or someone has threatened to take something from him/ her by use of force'
];
const SECURITY_DEFAULT_PROVIDER = 'Centre Coordinator Security/Unit Manager';

const FACILITIES_NEED_OPTIONS = ['Housing', 'Accessibility', 'Other'];

const EMPTY_ITEM = { category: 'corrections' };

function buildItemDefaults(category) {
  if (category === 'security') return { category, service_provider: SECURITY_DEFAULT_PROVIDER };
  return { category };
}

function ItemFields({ item, setItem }) {
  const set = (key, value) => setItem((prev) => ({ ...prev, [key]: value }));

  const needsOtherSpecify =
    (item.category === 'corrections' && item.identified_risk_need === 'Other') ||
    (item.category === 'social_integration' && item.identified_risk_need === 'Other(Specify)') ||
    (item.category === 'facilities' && item.identified_risk_need === 'Other');

  const programmeNeedsSpecify = item.category === 'development' && DEVELOPMENT_PROGRAMMES_NEEDING_SPECIFY.has(item.programme || '');
  const careProgrammeSpecify = (item.category === 'care_spiritual' || item.category === 'care_social' || item.category === 'care_emotional' || item.category === 'care_health') && item.programme === 'Specify';

  return (
    <div className="wizard-grid">
      {item.category === 'corrections' && (
        <>
          <label className="form-field">
            <span>Identified risk/need (crime/offending behaviour)</span>
            <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
              <option value="">Select…</option>
              {CORRECTIONS_CRIME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended programme/service/activity</span>
            <select value={item.programme || ''} onChange={(e) => set('programme', e.target.value)}>
              <option value="">Select…</option>
              {CORRECTIONS_PROGRAMME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended service provider</span>
            <select value={item.service_provider || ''} onChange={(e) => set('service_provider', e.target.value)}>
              <option value="">Select…</option>
              {CORRECTIONS_PROVIDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </>
      )}

      {item.category === 'development' && (
        <>
          <label className="form-field">
            <span>Identified risk/need</span>
            <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
              <option value="">Select…</option>
              {DEVELOPMENT_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended programme/service/activity</span>
            <select value={item.programme || ''} onChange={(e) => set('programme', e.target.value)}>
              <option value="">Select…</option>
              {DEVELOPMENT_PROGRAMME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </>
      )}

      {item.category === 'care_spiritual' && (
        <label className="form-field">
          <span>Identified risk/need</span>
          <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
            <option value="">Select…</option>
            {CARE_SPIRITUAL_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      {item.category === 'care_social' && (
        <label className="form-field">
          <span>Identified risk/need</span>
          <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
            <option value="">Select…</option>
            {CARE_SOCIAL_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      {item.category === 'care_emotional' && (
        <label className="form-field">
          <span>Identified risk/need</span>
          <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
            <option value="">Select…</option>
            {CARE_EMOTIONAL_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      {item.category === 'care_health' && (
        <label className="form-field">
          <span>Identified risk/need</span>
          <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
            <option value="">Select…</option>
            {CARE_HEALTH_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      {['care_spiritual', 'care_social', 'care_emotional', 'care_health'].includes(item.category) && (
        <>
          {item.identified_risk_need === 'Leadership position in group' && (
            <label className="form-field">
              <span>If Leadership Position, specify</span>
              <input type="text" value={item.identified_risk_need_other_specify || ''} onChange={(e) => set('identified_risk_need_other_specify', e.target.value)} />
            </label>
          )}
          <label className="form-field">
            <span>Recommended programme/service/activity</span>
            <select value={item.programme || ''} onChange={(e) => set('programme', e.target.value)}>
              <option value="">Select…</option>
              {CARE_PROGRAMME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended service provider</span>
            <select value={item.service_provider || ''} onChange={(e) => set('service_provider', e.target.value)}>
              <option value="">Select…</option>
              {CARE_PROVIDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </>
      )}

      {item.category === 'social_integration' && (
        <>
          <label className="form-field">
            <span>Identified risk/need</span>
            <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
              <option value="">Select…</option>
              {SOCIAL_INTEGRATION_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended programme/service/activity</span>
            <select value={item.programme || ''} onChange={(e) => set('programme', e.target.value)}>
              <option value="">Select…</option>
              {SOCIAL_INTEGRATION_PROGRAMME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended service provider</span>
            <select value={item.service_provider || ''} onChange={(e) => set('service_provider', e.target.value)}>
              <option value="">Select…</option>
              {SOCIAL_INTEGRATION_PROVIDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </>
      )}

      {item.category === 'security' && (
        <>
          <label className="form-field">
            <span>Identified risk/need</span>
            <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
              <option value="">Select…</option>
              {SECURITY_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended service provider</span>
            <input type="text" value={item.service_provider || SECURITY_DEFAULT_PROVIDER} onChange={(e) => set('service_provider', e.target.value)} />
          </label>
        </>
      )}

      {item.category === 'facilities' && (
        <>
          <label className="form-field">
            <span>Identified risk/need</span>
            <select value={item.identified_risk_need || ''} onChange={(e) => set('identified_risk_need', e.target.value)}>
              <option value="">Select…</option>
              {FACILITIES_NEED_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Recommended service/activity</span>
            <input type="text" value={item.programme || ''} onChange={(e) => set('programme', e.target.value)} />
          </label>
        </>
      )}

      {needsOtherSpecify && (
        <label className="form-field">
          <span>If Other, specify</span>
          <input type="text" value={item.identified_risk_need_other_specify || ''} onChange={(e) => set('identified_risk_need_other_specify', e.target.value)} />
        </label>
      )}
      {(programmeNeedsSpecify || careProgrammeSpecify) && (
        <label className="form-field">
          <span>Programme — specify</span>
          <input type="text" value={item.programme_other_specify || ''} onChange={(e) => set('programme_other_specify', e.target.value)} />
        </label>
      )}

      {item.category !== 'facilities' && (
        <label className="form-field">
          <span>Timeframe of intervention</span>
          <select value={item.timeframe || ''} onChange={(e) => set('timeframe', e.target.value)}>
            <option value="">Select…</option>
            {TIMEFRAME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

const EMPTY_PLAN = { plan_date: new Date().toISOString().slice(0, 10), comments: '', additional_risk_needs: '', offender_accepted: 'yes' };

export default function AddCorrectionalSentencePlanModal({ onClose, onSubmit }) {
  const [plan, setPlan] = useState(EMPTY_PLAN);
  const [draftItem, setDraftItem] = useState(EMPTY_ITEM);
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const setPlanField = (key, value) => setPlan((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (category) => {
    setDraftItem(buildItemDefaults(category));
  };

  const handleAddItem = () => {
    if (!draftItem.identified_risk_need && draftItem.category !== 'facilities') return;
    setItems((prev) => [...prev, draftItem]);
    setDraftItem(buildItemDefaults(draftItem.category));
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...plan, items });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Correctional Sentence Plan" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Correctional Sentence Plan</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="wizard-grid">
            <label className="form-field">
              <span>Plan Date</span>
              <input type="date" value={plan.plan_date} onChange={(e) => setPlanField('plan_date', e.target.value)} required />
            </label>
            <label className="form-field">
              <span>Accept or reject Correctional Sentence Plan</span>
              <select value={plan.offender_accepted} onChange={(e) => setPlanField('offender_accepted', e.target.value)}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </div>

          <div className="assessment-section-title">Intervention Items</div>

          <div className="wizard-grid">
            <label className="form-field">
              <span>Category</span>
              <select value={draftItem.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                {CATEGORY_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>
          <ItemFields item={draftItem} setItem={setDraftItem} />
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleAddItem}>Add Item</button>
          </div>

          {items.length > 0 && (
            <ul className="profile-list">
              {items.map((item, idx) => (
                <li key={idx}>
                  <span className="profile-list-title">
                    {CATEGORY_LABEL[item.category]}
                    <button type="button" className="btn-secondary" style={{ marginLeft: 12 }} onClick={() => handleRemoveItem(idx)}>Remove</button>
                  </span>
                  <span className="profile-list-meta">
                    {item.identified_risk_need || '—'}
                    {item.programme ? ` · ${item.programme}` : ''}
                    {item.service_provider ? ` · ${item.service_provider}` : ''}
                    {item.timeframe ? ` · ${item.timeframe}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="assessment-section-title">Additional</div>
          <label className="form-field">
            <span>Comments</span>
            <textarea value={plan.comments} onChange={(e) => setPlanField('comments', e.target.value)} rows={2} />
          </label>
          <label className="form-field">
            <span>Additional Risk/Needs</span>
            <textarea value={plan.additional_risk_needs} onChange={(e) => setPlanField('additional_risk_needs', e.target.value)} rows={2} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';

const VICTIM_CATEGORIES = [
  ['women', 'Woman / Women'], ['men', 'Man / Men'], ['girls', 'Girls'], ['boys', 'Boys'],
  ['aged', 'Aged/Elderly'], ['animals', 'Animals'], ['disabled', 'Disabled'],
  ['children', 'Children'], ['business', 'Business']
];
const HARM_CATEGORIES = [
  ['death', 'Caused death of victim(s)'], ['serious', 'Serious injury (wounding, maiming, disfiguring)'],
  ['minor', 'Minor injury (hitting, slapping, striking)']
];
const WEAPON_CATEGORIES = [
  ['none', 'No weapon'], ['firearm', 'Firearm'], ['knife', 'Knife'], ['explosives', 'Explosives']
];
const OFFENCE_CATEGORIES = [
  ['murder', 'Murder and related offences'], ['culpable_homicide', 'Culpable Homicide and related offences'],
  ['assault', 'Assault and related offences'], ['sexual', 'Sexual offences'],
  ['robbery', 'Robbery and related offences'], ['theft', 'Theft related offences'],
  ['fraud', 'Fraud, Deception and related offences'], ['drug_alcohol', 'Drug and Alcohol related offences'],
  ['firearm_ammo', 'Firearm and Ammunition offences'],
  ['weapons_explosives', 'Weapons and Explosives offences (other than firearms and ammunition)'],
  ['property_damage', 'Property and Environmental Damage'],
  ['public_order', 'Public Order and Public Welfare offences'],
  ['road_traffic', 'Road Traffic and Vehicle Regulatory offences'],
  ['justice_govt', 'Offences against Justice, Procedures, Government Security and Government Operations'],
  ['trafficking', 'Trafficking related offences'], ['freedom_movement', 'Offences against Freedom of movement'],
  ['misc', 'Miscellaneous offences']
];
const MOTIVE_CATEGORIES = [
  ['financial', 'Financial'], ['thrill_seeking', 'Thrill-seeking'], ['addiction', 'Addiction'],
  ['sexual', 'Sexual'], ['revenge', 'Revenge'], ['anger_aggression', 'Anger and Aggression'],
  ['hate', 'Hate'], ['provocation', 'Provocation'], ['political', 'Political'], ['racial', 'Racial'],
  ['emotional', 'Emotional'], ['other', 'Other']
];
const ADDICTION_CATEGORIES = [
  ['alcohol', 'Alcohol'], ['dagga', 'Dagga'], ['mandrax', 'Mandrax'], ['tik', 'Tik (methamphetamine)'],
  ['heroine', 'Heroine'], ['cocaine', 'Cocaine acids'], ['ecstasy', 'Ecstasy'], ['crack', 'Crack'],
  ['glue', 'Glue / adhesives'], ['prescriptive', 'Prescriptive drugs']
];
const GANG_ASSOC_CATEGORIES = [
  ['family', 'Family member(s)'], ['friends', 'Friend(s)'], ['correctional', 'Correctional Centre gangs'],
  ['community', 'Community gangs'], ['antisocial_peers', 'Anti-social peers'], ['cult', 'Cult (eg: Satanist)'],
  ['political', 'Politically motivated group'], ['mafia', 'Mafia association'],
  ['organized_crime', 'Organized Crime Syndicate'], ['criminal_peers', 'Criminal peers']
];
const GANG_MISSIONS = [
  'Violence and violent activities', 'Theft', 'Sex offences', 'Armed robbery',
  'Robbery & hijacking of cars / money', 'Drug dealing', 'Money laundering',
  'Organized crime syndicate', 'Escape', 'Prostitution', 'Power & intimidation', 'Political', 'Other'
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

function NumericGrid({ prefix, categories, values, set }) {
  return (
    <div className="wizard-grid">
      {categories.map(([key, label]) => (
        <label className="form-field" key={key}>
          <span>{label}</span>
          <input type="number" min="0" value={values[`${prefix}_${key}`] || ''} onChange={(e) => set(`${prefix}_${key}`, e.target.value)} />
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

// Reused for Youth History (checkbox victims), Adult History and Current Offence(s)
// (numeric victim counts) per the BASS field table's distinct field types.
function VictimHarmWeaponBlock({ prefix, values, set, numericVictims }) {
  return (
    <>
      <div className="assessment-subsection-title">Victims</div>
      {numericVictims
        ? <NumericGrid prefix={`${prefix}_victim`} categories={VICTIM_CATEGORIES} values={values} set={set} />
        : <CheckboxGrid prefix={`${prefix}_victim`} categories={VICTIM_CATEGORIES} values={values} set={set} />}
      <label className="form-field">
        <span>Other victim(s), specify</span>
        <input type="text" value={values[`${prefix}_victim_other`] || ''} onChange={(e) => set(`${prefix}_victim_other`, e.target.value)} />
      </label>
      <div className="wizard-grid">
        <YesNo field={`${prefix}_victim_known`} label="Inmate knew the victim(s) before the incident" values={values} set={set} />
        <YesNo field={`${prefix}_victim_stranger`} label="Victim(s) were strangers to the inmate" values={values} set={set} />
      </div>
      <div className="assessment-subsection-title">Degree of Physical Harm</div>
      <CheckboxGrid prefix={`${prefix}_harm`} categories={HARM_CATEGORIES} values={values} set={set} />
      <label className="form-field">
        <span>Other harm, specify</span>
        <input type="text" value={values[`${prefix}_harm_other`] || ''} onChange={(e) => set(`${prefix}_harm_other`, e.target.value)} />
      </label>
      <div className="assessment-subsection-title">Weapon(s) Used</div>
      <CheckboxGrid prefix={`${prefix}_weapon`} categories={WEAPON_CATEGORIES} values={values} set={set} />
      <label className="form-field">
        <span>Other weapon, specify</span>
        <input type="text" value={values[`${prefix}_weapon_other`] || ''} onChange={(e) => set(`${prefix}_weapon_other`, e.target.value)} />
      </label>
    </>
  );
}

function CrimeHistoryBlock({ prefix, ageLabel, values, set }) {
  return (
    <>
      <YesNo field={`${prefix}_convicted`} label={`Has the offender been convicted of any crimes as ${ageLabel}?`} values={values} set={set} />
      {values[`${prefix}_convicted`] === 'yes' && (
        <div className="wizard-grid">
          <label className="form-field">
            <span>Crimes committed</span>
            <input type="text" value={values[`${prefix}_crimes`] || ''} onChange={(e) => set(`${prefix}_crimes`, e.target.value)} />
          </label>
          <label className="form-field">
            <span>Sanctions received</span>
            <input type="text" value={values[`${prefix}_sanctions`] || ''} onChange={(e) => set(`${prefix}_sanctions`, e.target.value)} />
          </label>
        </div>
      )}
    </>
  );
}

const EMPTY = { assessment_date: new Date().toISOString().slice(0, 10), assessed_by: '' };

export default function AddSectionAAssessmentModal({ onClose, onSubmit }) {
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
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Comprehensive Risk and Needs Assessment — Section A" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comprehensive Risk &amp; Needs Assessment — Section A: Crime and Criminality</h3>
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

          <div className="assessment-section-title">Childhood History (below the age of 18)</div>
          <YesNo field="child_convicted" label="Has the offender been convicted of any crimes as a child?" values={values} set={set} />
          {values.child_convicted === 'yes' && (
            <div className="wizard-grid">
              <label className="form-field">
                <span>Crimes committed</span>
                <input type="text" value={values.child_crimes || ''} onChange={(e) => set('child_crimes', e.target.value)} />
              </label>
              <label className="form-field">
                <span>Sanctions received</span>
                <input type="text" value={values.child_sanctions || ''} onChange={(e) => set('child_sanctions', e.target.value)} />
              </label>
            </div>
          )}
          <YesNo field="child_placed_programme" label="Placed in a reformatory school, secure care centre or court programme?" values={values} set={set} />
          {values.child_placed_programme === 'yes' && (
            <>
              <div className="checkbox-grid">
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.child_placed_reformatory} onChange={(e) => set('child_placed_reformatory', e.target.checked)} />
                  <span>Reformatory School / School of industry</span>
                </label>
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.child_placed_secure_care} onChange={(e) => set('child_placed_secure_care', e.target.checked)} />
                  <span>Secure Care Centre</span>
                </label>
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.child_placed_court_programme} onChange={(e) => set('child_placed_court_programme', e.target.checked)} />
                  <span>Court imposed Programme</span>
                </label>
              </div>
              {values.child_placed_reformatory && (
                <label className="form-field">
                  <span>Reasons for reformatory placement</span>
                  <input type="text" value={values.child_reformatory_reasons || ''} onChange={(e) => set('child_reformatory_reasons', e.target.value)} />
                </label>
              )}
              {values.child_placed_secure_care && (
                <label className="form-field">
                  <span>Reasons for secure care placement</span>
                  <input type="text" value={values.child_secure_care_reasons || ''} onChange={(e) => set('child_secure_care_reasons', e.target.value)} />
                </label>
              )}
              {values.child_placed_court_programme && (
                <label className="form-field">
                  <span>Reasons for court programme placement</span>
                  <input type="text" value={values.child_court_programme_reasons || ''} onChange={(e) => set('child_court_programme_reasons', e.target.value)} />
                </label>
              )}
            </>
          )}
          <div className="assessment-subsection-title">School Performance History</div>
          <div className="wizard-grid">
            <YesNo field="child_special_school" label="Ever attended a special school?" values={values} set={set} />
          </div>
          <div className="wizard-grid">
            <YesNo field="child_suspended" label="Ever been suspended from school?" values={values} set={set} />
            {values.child_suspended === 'yes' && (
              <label className="form-field">
                <span>Reasons for suspension</span>
                <input type="text" value={values.child_suspended_reasons || ''} onChange={(e) => set('child_suspended_reasons', e.target.value)} />
              </label>
            )}
          </div>
          <div className="wizard-grid">
            <YesNo field="child_expelled" label="Ever been expelled from school?" values={values} set={set} />
            {values.child_expelled === 'yes' && (
              <label className="form-field">
                <span>Reasons for expulsion</span>
                <input type="text" value={values.child_expelled_reasons || ''} onChange={(e) => set('child_expelled_reasons', e.target.value)} />
              </label>
            )}
          </div>

          <div className="assessment-section-title">Youth History (18 – 25 years old)</div>
          <CrimeHistoryBlock prefix="youth" ageLabel="a youth" values={values} set={set} />
          {values.youth_convicted === 'yes' && (
            <VictimHarmWeaponBlock prefix="youth" values={values} set={set} numericVictims={false} />
          )}

          <div className="assessment-section-title">Adult History (above 25 years old)</div>
          <CrimeHistoryBlock prefix="adult" ageLabel="an adult" values={values} set={set} />
          {values.adult_convicted === 'yes' && (
            <VictimHarmWeaponBlock prefix="adult" values={values} set={set} numericVictims />
          )}

          <div className="assessment-section-title">Current Offence(s)</div>
          <div className="assessment-subsection-title">Crime Specifics</div>
          <CheckboxGrid prefix="offence" categories={OFFENCE_CATEGORIES} values={values} set={set} />
          <label className="form-field">
            <span>Other offence, specify</span>
            <input type="text" value={values.offence_other || ''} onChange={(e) => set('offence_other', e.target.value)} />
          </label>
          <VictimHarmWeaponBlock prefix="current" values={values} set={set} numericVictims />

          <div className="assessment-section-title">Motives for the Inmate's Offending / Criminal Behaviour</div>
          <CheckboxGrid prefix="motive" categories={MOTIVE_CATEGORIES} values={values} set={set} />

          <div className="assessment-section-title">Substance Use</div>
          <YesNo field="crime_under_influence" label="Was the inmate under the influence of any substances when the crime was committed?" values={values} set={set} />
          {values.crime_under_influence === 'yes' && (
            <>
              <div className="checkbox-grid">
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.influence_alcohol} onChange={(e) => set('influence_alcohol', e.target.checked)} />
                  <span>Alcohol</span>
                </label>
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.influence_dagga} onChange={(e) => set('influence_dagga', e.target.checked)} />
                  <span>Dagga</span>
                </label>
                <label className="form-field checkbox-label">
                  <input type="checkbox" checked={!!values.influence_drugs} onChange={(e) => set('influence_drugs', e.target.checked)} />
                  <span>Drugs</span>
                </label>
              </div>
              {values.influence_drugs && (
                <label className="form-field">
                  <span>If drugs, specify</span>
                  <input type="text" value={values.influence_drugs_specify || ''} onChange={(e) => set('influence_drugs_specify', e.target.value)} />
                </label>
              )}
            </>
          )}
          <YesNo field="addicted_to_substances" label="Is the inmate addicted to any substances?" values={values} set={set} />
          {values.addicted_to_substances === 'yes' && (
            <>
              <CheckboxGrid prefix="addicted" categories={ADDICTION_CATEGORIES} values={values} set={set} />
              <label className="form-field">
                <span>Other substance, specify</span>
                <input type="text" value={values.addicted_other || ''} onChange={(e) => set('addicted_other', e.target.value)} />
              </label>
              <div className="wizard-grid">
                <label className="form-field">
                  <span>Age started using substances</span>
                  <input type="number" min="0" value={values.substance_start_age || ''} onChange={(e) => set('substance_start_age', e.target.value)} />
                </label>
                <YesNo field="substance_treatment_received" label="Ever received medical treatment / counselling for substance use/abuse?" values={values} set={set} />
              </div>
            </>
          )}

          <div className="assessment-section-title">Gangs / Criminal Associations</div>
          <YesNo field="gang_member" label="Part of a gang, antisocial group, or organized crime syndicate?" values={values} set={set} />
          {values.gang_member === 'yes' && (
            <>
              <div className="assessment-subsection-title">Type of Association</div>
              <CheckboxGrid prefix="gang_assoc" categories={GANG_ASSOC_CATEGORIES} values={values} set={set} />
              <label className="form-field">
                <span>Other association, specify</span>
                <input type="text" value={values.gang_assoc_other || ''} onChange={(e) => set('gang_assoc_other', e.target.value)} />
              </label>
              <div className="wizard-grid">
                <YesNo field="crime_committed_in_group" label="Was the current crime(s) committed in a group/syndicate context?" values={values} set={set} />
                <label className="form-field">
                  <span>Inmate's position/role in the gang/syndicate</span>
                  <select value={values.gang_role || ''} onChange={(e) => set('gang_role', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="Leader">Leader</option>
                    <option value="Soldier">Soldier</option>
                    <option value="Member">Member</option>
                    <option value="Runner">Runner</option>
                  </select>
                </label>
              </div>
              <label className="form-field">
                <span>Mission / objective of the gang / syndicate group</span>
                <select value={values.gang_mission || ''} onChange={(e) => set('gang_mission', e.target.value)}>
                  <option value="">Select…</option>
                  {GANG_MISSIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              {values.gang_mission === 'Other' && (
                <label className="form-field">
                  <span>If other, specify</span>
                  <input type="text" value={values.gang_mission_other || ''} onChange={(e) => set('gang_mission_other', e.target.value)} />
                </label>
              )}
            </>
          )}
          <YesNo field="relatives_involved_in_crime" label="Are the inmate's parents, siblings, partner or other resident/interacting relatives involved in criminal activity?" values={values} set={set} />

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

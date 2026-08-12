import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import AddScreeningModal from './AddScreeningModal';
import AddPropertyModal from './AddPropertyModal';
import AddWarrantModal from './AddWarrantModal';
import AddHealthAssessmentModal from './AddHealthAssessmentModal';
import AddSectionAAssessmentModal from './AddSectionAAssessmentModal';
import AddSectionBAssessmentModal from './AddSectionBAssessmentModal';
import AddSectionCAssessmentModal from './AddSectionCAssessmentModal';
import AddSectionDAssessmentModal from './AddSectionDAssessmentModal';
import AddCorrectionalSentencePlanModal from './AddCorrectionalSentencePlanModal';
import AddReleaseModal from './AddReleaseModal';

const SENTENCE_STATUS_LABEL = {
  sentenced: 'Sentenced',
  remand: 'Remand'
};

const PROPERTY_CONDITION_LABEL = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

const STATUS_LABEL = {
  incarcerated: 'Sentenced',
  community_corrections: 'Community Corrections',
  released: 'Released'
};

const EDUCATION_STATUS_LABEL = {
  enrolled: 'Enrolled',
  completed: 'Completed',
  withdrawn: 'Withdrawn'
};

const AUTHOR_ROLE_LABEL = {
  social_work: 'Social Work',
  psychology: 'Psychology',
  spiritual_care: 'Spiritual Care'
};

const INCIDENT_TYPE_LABEL = {
  assault: 'Assault',
  escape_attempt: 'Escape Attempt',
  escape: 'Escape (Completed)',
  contraband: 'Contraband',
  disciplinary_hearing: 'Disciplinary Hearing',
  death: 'Death in Custody'
};

const ASSESSMENT_TYPE_LABEL = {
  security_classification: 'Security Classification',
  psychological: 'Psychological',
  substance_abuse: 'Substance Abuse'
};

const RISK_LEVEL_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

const COURT_CASE_STATUS_LABEL = {
  pending: 'Pending',
  postponed: 'Postponed',
  finalized: 'Finalized'
};

const PAROLE_OUTCOME_LABEL = {
  scheduled: 'Scheduled',
  granted: 'Granted',
  denied: 'Denied',
  postponed: 'Postponed'
};

const SCREENING_TYPE_LABEL = {
  prostate: 'Prostate Screening',
  cervical: 'Cervical Screening',
  cryptococcal_meningitis: 'Cryptococcal Meningitis Screening'
};

const WARRANT_TYPE_LABEL = {
  J7: 'J7 — Detention pending trial',
  J138A: 'J138A — Psychiatric evaluation (unsentenced)',
  J138E: 'J138E — Psychiatric evaluation (sentenced)',
  G306: 'G306 — Arrest & detention of parolee/probationer',
  SAP69: 'SAP69 — Report of convictions',
  G344: 'G344 — Inmate with further charges',
  J1: 'J1 — Warrant of liberation'
};

export default function OffenderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [gangDraft, setGangDraft] = useState({ prison_gang: '', prison_gang_rank: '', street_gang: '', street_gang_rank: '' });
  const [savingGang, setSavingGang] = useState(false);
  const [gangError, setGangError] = useState(null);

  const loadProfile = () => api.getOffenderProfile(id).then((data) => {
    setProfile(data);
    setGangDraft({
      prison_gang: data.gang?.prison_gang || '',
      prison_gang_rank: data.gang?.prison_gang_rank || '',
      street_gang: data.gang?.street_gang || '',
      street_gang_rank: data.gang?.street_gang_rank || ''
    });
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadProfile()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddScreening = async (screening) => {
    await api.addScreening(id, screening);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddProperty = async (item) => {
    await api.addPersonalProperty(id, item);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddWarrant = async (warrant) => {
    await api.addWarrant(id, warrant);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddHealthAssessment = async (assessment) => {
    await api.addHealthAssessment(id, assessment);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddSectionAAssessment = async (assessment) => {
    await api.addSectionAAssessment(id, assessment);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddSectionBAssessment = async (assessment) => {
    await api.addSectionBAssessment(id, assessment);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddSectionCAssessment = async (assessment) => {
    await api.addSectionCAssessment(id, assessment);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddSectionDAssessment = async (assessment) => {
    await api.addSectionDAssessment(id, assessment);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddCorrectionalSentencePlan = async (plan) => {
    await api.addCorrectionalSentencePlan(id, plan);
    await loadProfile();
    setActiveModal(null);
  };

  const handleAddRelease = async (release) => {
    await api.addRelease(id, release);
    await loadProfile();
    setActiveModal(null);
  };

  const handleSaveGang = async () => {
    setSavingGang(true);
    setGangError(null);
    try {
      await api.updateGangAffiliation(id, gangDraft);
      await loadProfile();
    } catch (err) {
      setGangError(err.message);
    } finally {
      setSavingGang(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading offender profile…</div>;
  if (error) return <div className="loading-screen error">Failed to load: {error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <Link to="/" className="back-link">&larr; Back to dashboard</Link>

      <div className="panel profile-summary">
        <div className="profile-summary-header">
          <h2>{profile.name}</h2>
          <span className={`status-pill status-${profile.status}`}>{STATUS_LABEL[profile.status]}</span>
        </div>
        <dl className="profile-fields">
          <div><dt>Facility</dt><dd>{profile.facility_name}</dd></div>
          <div><dt>Admission Date</dt><dd>{new Date(profile.admission_date).toLocaleDateString('en-ZA')}</dd></div>
          <div><dt>Next Action</dt><dd>{profile.next_action || '—'}</dd></div>
          <div><dt>ID Number</dt><dd>{profile.id_number || '—'}</dd></div>
          <div><dt>Warrant Type</dt><dd>{profile.warrant_type || '—'}</dd></div>
          <div><dt>Sentence Status</dt><dd>{SENTENCE_STATUS_LABEL[profile.sentence_status] || '—'}</dd></div>
          <div><dt>Nickname</dt><dd>{profile.nickname || '—'}</dd></div>
          <div><dt>Registration Number</dt><dd>{profile.registration_number || '—'}</dd></div>
          <div><dt>Religion</dt><dd>{profile.religion || '—'}</dd></div>
          <div><dt>Denomination</dt><dd>{profile.denomination || '—'}</dd></div>
          <div><dt>Gender</dt><dd>{profile.gender || '—'}</dd></div>
          <div><dt>Race</dt><dd>{profile.race || '—'}</dd></div>
          <div><dt>Nationality</dt><dd>{profile.nationality || '—'}</dd></div>
          <div><dt>Passport Number</dt><dd>{profile.passport_number || '—'}</dd></div>
          <div><dt>Marital Status</dt><dd>{profile.marital_status || '—'}</dd></div>
          <div><dt>Place of Birth</dt><dd>{profile.place_of_birth || '—'}</dd></div>
          <div>
            <dt>Date of Birth</dt>
            <dd>
              {profile.date_of_birth
                ? `${new Date(profile.date_of_birth).toLocaleDateString('en-ZA')} (${calculateAge(profile.date_of_birth)} yrs)`
                : '—'}
            </dd>
          </div>
          <div><dt>Number of Dependants</dt><dd>{profile.number_of_dependants ?? '—'}</dd></div>
          <div>
            <dt>Address</dt>
            <dd>
              {profile.address_street || profile.address_town || profile.address_province || profile.postal_code
                ? [profile.address_street, profile.address_town, profile.address_province, profile.postal_code].filter(Boolean).join(', ')
                : '—'}
            </dd>
          </div>
          <div><dt>Next of Kin</dt><dd>{profile.next_of_kin_name || '—'}</dd></div>
          <div><dt>Next of Kin Relationship</dt><dd>{profile.next_of_kin_relationship || '—'}</dd></div>
          <div><dt>Next of Kin Contact</dt><dd>{profile.next_of_kin_contact || '—'}</dd></div>
          <div>
            <dt>Next of Kin Address</dt>
            <dd>
              {profile.next_of_kin_town || profile.next_of_kin_province || profile.next_of_kin_postal_code
                ? [profile.next_of_kin_town, profile.next_of_kin_province, profile.next_of_kin_postal_code].filter(Boolean).join(', ')
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="health-tiles">
        <div className="health-tile">
          <div className="health-tile-label">Nutrition</div>
          <div className="health-tile-value capitalize">{profile.nutrition?.diet_type || '—'}</div>
        </div>
        <div className="health-tile">
          <div className="health-tile-label">Death</div>
          <div className="health-tile-value">{profile.status === 'released' ? '—' : 'None'}</div>
        </div>
        <div className="health-tile">
          <div className="health-tile-label">Diabetic</div>
          <div className="health-tile-value">
            {profile.nutrition?.special_requirements?.toLowerCase().includes('diabet') ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="health-tile">
          <div className="health-tile-label">HIV Status</div>
          <div className="health-tile-value">
            {profile.health ? (profile.health.hiv_positive ? 'Positive' : 'Negative') : '—'}
          </div>
        </div>
      </div>

      <div className="panel profile-section">
        <h3>Risk Assessments</h3>
        {profile.risk_assessments.length === 0 ? (
          <p className="empty">No risk assessments on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.risk_assessments.map((r) => (
              <li key={r.id}>
                <span className="profile-list-title">
                  {ASSESSMENT_TYPE_LABEL[r.assessment_type]} — {RISK_LEVEL_LABEL[r.risk_level]} risk
                </span>
                <span className="profile-list-meta">
                  {r.assessor ? `${r.assessor} · ` : ''}{new Date(r.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                {r.notes && <p className="profile-list-note">{r.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Pending Court Cases</h3>
        {profile.court_cases.length === 0 ? (
          <p className="empty">No pending court cases.</p>
        ) : (
          <ul className="profile-list">
            {profile.court_cases.map((c) => (
              <li key={c.id}>
                <span className="profile-list-title">
                  {c.charge} ({c.case_number}) — {COURT_CASE_STATUS_LABEL[c.status]}
                </span>
                <span className="profile-list-meta">
                  {c.court ? `${c.court} · ` : ''}
                  {c.next_court_date ? `Next date: ${new Date(c.next_court_date).toLocaleDateString('en-ZA')}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Criminal History</h3>
        {profile.criminal_history.length === 0 ? (
          <p className="empty">No prior offenses on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.criminal_history.map((c) => (
              <li key={c.id}>
                <span className="profile-list-title">{c.offense}</span>
                <span className="profile-list-meta">
                  {c.sentence_description ? `${c.sentence_description} · ` : ''}
                  {c.date && new Date(c.date).toLocaleDateString('en-ZA')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Parole</h3>
        {profile.parole_records.length === 0 ? (
          <p className="empty">No parole hearings on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.parole_records.map((p) => (
              <li key={p.id}>
                <span className="profile-list-title">
                  {PAROLE_OUTCOME_LABEL[p.outcome]} — {new Date(p.hearing_date).toLocaleDateString('en-ZA')}
                </span>
                {p.next_eligible_date && (
                  <span className="profile-list-meta">
                    Next eligible: {new Date(p.next_eligible_date).toLocaleDateString('en-ZA')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Health</h3>
        {profile.health ? (
          <dl className="profile-fields">
            <div><dt>HIV Status</dt><dd>{profile.health.hiv_positive ? 'Positive' : 'Negative'}</dd></div>
            {profile.health.hiv_positive === 1 && (
              <div>
                <dt>Viral Load</dt>
                <dd>{profile.health.viral_load_suppressed ? 'Suppressed' : 'Not suppressed'}</dd>
              </div>
            )}
            <div><dt>TB Status</dt><dd className="capitalize">{profile.health.tb_status}</dd></div>
          </dl>
        ) : (
          <p className="empty">No health record on file.</p>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Admission Health and Risk Assessment</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('health_assessment')}>
            Add Assessment
          </button>
        </div>
        {profile.health_assessments.length === 0 ? (
          <p className="empty">No admission health assessment on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.health_assessments.map((h) => (
              <li key={h.id}>
                <span className="profile-list-title">
                  Assessment — {new Date(h.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                <span className="profile-list-meta">
                  {h.assessed_by ? `${h.assessed_by} · ` : ''}
                  {h.allergies ? `Allergies: ${h.allergies} · ` : ''}
                  {h.last_meal ? `Last meal: ${h.last_meal}` : ''}
                </span>
                {[
                  h.illness_needs_treatment === 'yes' && `Illness: ${h.illness_specify || 'unspecified'}`,
                  h.injuries_needs_attention === 'yes' && `Injuries: ${h.injuries_specify || 'unspecified'}`,
                  h.medication_in_possession === 'yes' && `Medication: ${h.medication_specify || 'unspecified'}`,
                  h.disabilities === 'yes' && `Disability: ${h.disabilities_specify || 'unspecified'}`
                ].filter(Boolean).map((note, idx) => (
                  <p className="profile-list-note" key={idx}>{note}</p>
                ))}
                {h.additional_comments && <p className="profile-list-note">Comments: {h.additional_comments}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Health Screenings</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('prostate')}>
            Add Prostate Screening
          </button>
          <button type="button" className="btn-primary" onClick={() => setActiveModal('cervical')}>
            Add Cervical Screening
          </button>
          <button type="button" className="btn-primary" onClick={() => setActiveModal('cryptococcal_meningitis')}>
            Add Cryptococcal Meningitis Screening
          </button>
        </div>
        {profile.screenings.length === 0 ? (
          <p className="empty">No screenings on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.screenings.map((s) => (
              <li key={s.id}>
                <span className="profile-list-title">{SCREENING_TYPE_LABEL[s.screening_type]}</span>
                <span className="profile-list-meta">
                  {new Date(s.date_screened).toLocaleDateString('en-ZA')}
                  {s.lab_test ? ` · ${s.lab_test}: ${s.lab_result || 'pending'}` : ''}
                  {s.cd4_count ? ` · CD4 count: ${s.cd4_count}` : ''}
                  {s.referred_to ? ` · Referred to ${s.referred_to}` : ''}
                </span>
                {s.signs_symptoms && <p className="profile-list-note">Signs/symptoms: {s.signs_symptoms}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Nutrition</h3>
        {profile.nutrition ? (
          <dl className="profile-fields">
            <div><dt>Diet Type</dt><dd className="capitalize">{profile.nutrition.diet_type}</dd></div>
            <div><dt>Allergies</dt><dd>{profile.nutrition.allergies || '—'}</dd></div>
            <div><dt>Special Requirements</dt><dd>{profile.nutrition.special_requirements || '—'}</dd></div>
          </dl>
        ) : (
          <p className="empty">No nutrition record on file.</p>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Spiritual Care</h3>
        {profile.spiritual ? (
          <dl className="profile-fields">
            <div><dt>Religion</dt><dd>{profile.spiritual.religion || '—'}</dd></div>
            <div><dt>Programme</dt><dd>{profile.spiritual.programme || '—'}</dd></div>
            <div><dt>Notes</dt><dd>{profile.spiritual.notes || '—'}</dd></div>
          </dl>
        ) : (
          <p className="empty">No spiritual care record on file.</p>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Education</h3>
        {profile.education.length === 0 ? (
          <p className="empty">No education programme records.</p>
        ) : (
          <ul className="profile-list">
            {profile.education.map((e) => (
              <li key={e.id}>
                <span className="profile-list-title">{e.programme}</span>
                <span className="profile-list-meta">
                  {EDUCATION_STATUS_LABEL[e.status]} · {e.attendance_pct}% attendance
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Incident History</h3>
        {profile.incidents.length === 0 ? (
          <p className="empty">No incidents on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.incidents.map((i) => (
              <li key={i.id}>
                <span className="profile-list-title">
                  {INCIDENT_TYPE_LABEL[i.type]}{i.injury ? ' (injury)' : ''}
                  {!i.synced && <span className="outbox-badge profile-badge">unsynced</span>}
                </span>
                <span className="profile-list-meta">{new Date(i.timestamp).toLocaleDateString('en-ZA')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Case Notes</h3>
        {profile.case_notes.length === 0 ? (
          <p className="empty">No case notes on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.case_notes.map((n) => (
              <li key={n.id}>
                <span className="profile-list-title">
                  {n.note}
                </span>
                <span className="profile-list-meta">
                  {AUTHOR_ROLE_LABEL[n.author_role]} · {new Date(n.created_at).toLocaleDateString('en-ZA')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Gang Affiliation</h3>
        <div className="wizard-grid">
          <label className="form-field">
            <span>Prison Gang</span>
            <input
              type="text"
              value={gangDraft.prison_gang}
              onChange={(e) => setGangDraft({ ...gangDraft, prison_gang: e.target.value })}
            />
          </label>
          <label className="form-field">
            <span>Prison Gang Rank</span>
            <input
              type="text"
              value={gangDraft.prison_gang_rank}
              onChange={(e) => setGangDraft({ ...gangDraft, prison_gang_rank: e.target.value })}
            />
          </label>
          <label className="form-field">
            <span>Street Gang</span>
            <input
              type="text"
              value={gangDraft.street_gang}
              onChange={(e) => setGangDraft({ ...gangDraft, street_gang: e.target.value })}
            />
          </label>
          <label className="form-field">
            <span>Street Gang Rank</span>
            <input
              type="text"
              value={gangDraft.street_gang_rank}
              onChange={(e) => setGangDraft({ ...gangDraft, street_gang_rank: e.target.value })}
            />
          </label>
        </div>
        {gangError && <p className="form-error">{gangError}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={handleSaveGang} disabled={savingGang}>
            {savingGang ? 'Saving…' : 'Save Gang Affiliation'}
          </button>
        </div>
      </div>

      <div className="panel profile-section">
        <h3>Personal Property</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('property')}>
            Add Item
          </button>
        </div>
        {profile.personal_property.length === 0 ? (
          <p className="empty">No personal property on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.personal_property.map((item) => (
              <li key={item.id}>
                <span className="profile-list-title">
                  {item.item_description} — {PROPERTY_CONDITION_LABEL[item.condition]}
                </span>
                <span className="profile-list-meta">
                  {item.bag_number ? `Bag ${item.bag_number}` : ''}
                  {item.estimated_value != null ? ` · Est. value R${item.estimated_value}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Warrants</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('warrant')}>
            Add Warrant
          </button>
        </div>
        {profile.warrants.length === 0 ? (
          <p className="empty">No warrants on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.warrants.map((w) => (
              <li key={w.id}>
                <span className="profile-list-title">
                  {WARRANT_TYPE_LABEL[w.warrant_type] || w.warrant_type}
                  <span className={`status-pill status-${w.warrant_category === 'sentenced' ? 'incarcerated' : 'community_corrections'}`} style={{ marginLeft: 8 }}>
                    {w.warrant_category === 'sentenced' ? 'Sentenced' : 'Unsentenced'}
                  </span>
                </span>
                <span className="profile-list-meta">
                  {[w.court, w.court_case_number, w.correctional_centre, w.hospital]
                    .filter(Boolean)
                    .join(' · ') || 'No further detail captured'}
                </span>
                {w.charges && <p className="profile-list-note">Charges: {w.charges}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Comprehensive Risk &amp; Needs Assessment — Section A: Crime and Criminality</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('section_a_assessment')}>
            Add Assessment
          </button>
        </div>
        {profile.section_a_assessments.length === 0 ? (
          <p className="empty">No Section A (Crime and Criminality) assessment on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.section_a_assessments.map((s) => (
              <li key={s.id}>
                <span className="profile-list-title">
                  Assessment — {new Date(s.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                <span className="profile-list-meta">
                  {s.assessed_by ? `${s.assessed_by} · ` : ''}
                  {s.gang_member === 'yes' ? 'Gang associated' : 'No gang association'}
                  {s.crime_under_influence === 'yes' ? ' · Under influence during offence' : ''}
                </span>
                {[
                  s.child_convicted === 'yes' && `Childhood convictions: ${s.child_crimes || 'unspecified'}`,
                  s.youth_convicted === 'yes' && `Youth convictions: ${s.youth_crimes || 'unspecified'}`,
                  s.adult_convicted === 'yes' && `Adult convictions: ${s.adult_crimes || 'unspecified'}`,
                  s.gang_member === 'yes' && s.gang_role && `Gang role: ${s.gang_role}`
                ].filter(Boolean).map((note, idx) => (
                  <p className="profile-list-note" key={idx}>{note}</p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Comprehensive Risk &amp; Needs Assessment — Section B: Education, Sports, Recreation and Employment</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('section_b_assessment')}>
            Add Assessment
          </button>
        </div>
        {profile.section_b_assessments.length === 0 ? (
          <p className="empty">No Section B (Education, Sports, Recreation and Employment) assessment on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.section_b_assessments.map((s) => (
              <li key={s.id}>
                <span className="profile-list-title">
                  Assessment — {new Date(s.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                <span className="profile-list-meta">
                  {s.assessed_by ? `${s.assessed_by} · ` : ''}
                  {s.can_read_write === 'yes' ? 'Literate' : 'Not literate'}
                  {s.employed_before_incarceration === 'yes' ? ` · ${s.employment_type || 'Employed'}` : ' · Unemployed prior to incarceration'}
                </span>
                {[
                  s.tertiary_education === 'yes' && `Tertiary: ${s.tertiary_qualification || 'unspecified'}${s.tertiary_field_of_study ? ` (${s.tertiary_field_of_study})` : ''}`,
                  s.trained_profession === 'yes' && `Trade/skill: ${s.trained_profession_specify || 'unspecified'}`,
                  s.has_skills_hobbies === 'yes' && `Hobbies: ${s.skills_hobbies_specify || 'unspecified'}`
                ].filter(Boolean).map((note, idx) => (
                  <p className="profile-list-note" key={idx}>{note}</p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Comprehensive Risk &amp; Needs Assessment — Section C: Spiritual Care, Social and Emotional Wellbeing</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('section_c_assessment')}>
            Add Assessment
          </button>
        </div>
        {profile.section_c_assessments.length === 0 ? (
          <p className="empty">No Section C (Spiritual Care, Social and Emotional Wellbeing) assessment on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.section_c_assessments.map((s) => (
              <li key={s.id}>
                <span className="profile-list-title">
                  Assessment — {new Date(s.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                <span className="profile-list-meta">
                  {s.assessed_by ? `${s.assessed_by} · ` : ''}
                  {s.faith_member === 'yes' ? 'Faith member' : 'Not a faith member'}
                  {s.has_dependants === 'yes' ? ' · Has dependants' : ''}
                </span>
                {[
                  s.suicidal_thoughts_now === 'yes' && 'Current suicidal ideation flagged',
                  s.mental_illness_treatment === 'yes' && 'Prior mental illness treatment',
                  s.convicted_sexual_offence_ever === 'yes' && 'Prior sexual offence conviction',
                  s.current_conviction_sexual_offence === 'yes' && 'Current conviction involves sexual offence',
                  s.abused_since_admission === 'yes' && 'Reported abuse since admission'
                ].filter(Boolean).map((note, idx) => (
                  <p className="profile-list-note" key={idx}>{note}</p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Comprehensive Risk &amp; Needs Assessment — Section D: Security</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('section_d_assessment')}>
            Add Assessment
          </button>
        </div>
        {profile.section_d_assessments.length === 0 ? (
          <p className="empty">No Section D (Security) assessment on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.section_d_assessments.map((s) => (
              <li key={s.id}>
                <span className="profile-list-title">
                  Assessment — {new Date(s.assessment_date).toLocaleDateString('en-ZA')}
                </span>
                <span className="profile-list-meta">
                  {s.assessed_by ? `${s.assessed_by} · ` : ''}
                  {s.previous_crime_category ? `Prev: ${s.previous_crime_category}` : ''}
                  {s.current_crime_category ? ` · Current: ${s.current_crime_category}` : ''}
                </span>
                {[
                  s.escaped === 1 && 'Previously escaped',
                  s.attempted_escape === 1 && 'Attempted escape',
                  s.aided_escape === 1 && 'Aided an escape',
                  s.probation_revoked === 1 && 'Probation revoked',
                  s.breached_parole === 1 && 'Breached parole',
                  s.breached_bail === 1 && 'Breached bail conditions',
                  s.absconded === 1 && 'Absconded',
                  s.institutional_offences === 'yes' && 'Institutional offences/disciplinary actions on record',
                  s.convicted_racial_political_offence === 'yes' && `Racial/political conflict conviction: ${s.convicted_racial_political_offence_specify || 'unspecified'}`,
                  s.further_charges === 'yes' && `Further charges: ${s.further_charges_specify || 'unspecified'}`,
                  s.threatened_since_admission === 'yes' && `Threatened since admission: ${s.threatened_since_admission_specify || 'unspecified'}`
                ].filter(Boolean).map((note, idx) => (
                  <p className="profile-list-note" key={idx}>{note}</p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Correctional Sentence Plan</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('correctional_sentence_plan')}>
            Add Plan
          </button>
        </div>
        {profile.correctional_sentence_plans.length === 0 ? (
          <p className="empty">No Correctional Sentence Plan on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.correctional_sentence_plans.map((p) => (
              <li key={p.id}>
                <span className="profile-list-title">
                  Plan — {new Date(p.plan_date).toLocaleDateString('en-ZA')}
                  <span className={`status-pill status-${p.offender_accepted === 'yes' ? 'incarcerated' : 'released'}`} style={{ marginLeft: 8 }}>
                    {p.offender_accepted === 'yes' ? 'Accepted' : 'Rejected'}
                  </span>
                </span>
                <span className="profile-list-meta">{p.items.length} intervention item{p.items.length === 1 ? '' : 's'}</span>
                {p.items.map((item) => (
                  <p className="profile-list-note" key={item.id}>
                    {item.category.replace('_', ' ')}: {item.identified_risk_need || '—'}
                    {item.programme ? ` · ${item.programme}` : ''}
                    {item.service_provider ? ` · ${item.service_provider}` : ''}
                    {item.timeframe ? ` · ${item.timeframe}` : ''}
                  </p>
                ))}
                {p.comments && <p className="profile-list-note">Comments: {p.comments}</p>}
                {p.additional_risk_needs && <p className="profile-list-note">Additional risk/needs: {p.additional_risk_needs}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel profile-section">
        <h3>Releases</h3>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setActiveModal('release')}>
            Add Release
          </button>
        </div>
        {profile.releases.length === 0 ? (
          <p className="empty">No releases on record.</p>
        ) : (
          <ul className="profile-list">
            {profile.releases.map((r) => (
              <li key={r.id}>
                <span className="profile-list-title">
                  Released — {new Date(r.release_date).toLocaleDateString('en-ZA')}
                  <span className="status-pill status-released" style={{ marginLeft: 8 }}>
                    {r.release_type.replace('_', ' ')}
                  </span>
                </span>
                {r.amount_paid && (
                  <p className="profile-list-note">
                    Paid: {r.amount_paid}{r.date_paid ? ` on ${new Date(r.date_paid).toLocaleDateString('en-ZA')}` : ''}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeModal && !['property', 'warrant', 'health_assessment', 'section_a_assessment', 'section_b_assessment', 'section_c_assessment', 'section_d_assessment', 'correctional_sentence_plan', 'release'].includes(activeModal) && (
        <AddScreeningModal
          screeningType={activeModal}
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddScreening}
        />
      )}

      {activeModal === 'property' && (
        <AddPropertyModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddProperty}
        />
      )}

      {activeModal === 'warrant' && (
        <AddWarrantModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddWarrant}
        />
      )}

      {activeModal === 'health_assessment' && (
        <AddHealthAssessmentModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddHealthAssessment}
        />
      )}

      {activeModal === 'section_a_assessment' && (
        <AddSectionAAssessmentModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddSectionAAssessment}
        />
      )}

      {activeModal === 'section_b_assessment' && (
        <AddSectionBAssessmentModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddSectionBAssessment}
        />
      )}

      {activeModal === 'section_c_assessment' && (
        <AddSectionCAssessmentModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddSectionCAssessment}
        />
      )}

      {activeModal === 'section_d_assessment' && (
        <AddSectionDAssessmentModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddSectionDAssessment}
        />
      )}

      {activeModal === 'correctional_sentence_plan' && (
        <AddCorrectionalSentencePlanModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddCorrectionalSentencePlan}
        />
      )}

      {activeModal === 'release' && (
        <AddReleaseModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleAddRelease}
        />
      )}
    </div>
  );
}

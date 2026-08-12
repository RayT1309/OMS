import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const STEPS = ['Personal Details', 'Next of Kin', 'Gang Affiliation', 'Upload Photo'];

const EMPTY_PERSONAL = {
  name: '', facility_id: '', id_number: '', registration_number: '', nickname: '',
  sentence_status: 'remand', status: 'incarcerated', admission_date: '', next_action: '',
  gender: '', race: '', nationality: 'South Africa', marital_status: '', religion: '', denomination: '',
  passport_number: '', place_of_birth: '', date_of_birth: '', number_of_dependants: '',
  address_street: '', address_town: '', address_province: '', postal_code: '', warrant_type: ''
};

const EMPTY_KIN = {
  next_of_kin_name: '', next_of_kin_contact: '', next_of_kin_relationship: '',
  next_of_kin_town: '', next_of_kin_province: '', next_of_kin_postal_code: ''
};

const EMPTY_GANG = { prison_gang: '', prison_gang_rank: '', street_gang: '', street_gang_rank: '' };

const EMPTY_RECEIPT = { facility_id: '', source_type: '', source: '', date_of_admission: '', total_inmates: '' };

const SOURCE_TYPES = ['Court', 'Police', 'Correctional Centre Transfer'];

export default function FingerprintFlow({ offenders, onEnrolled }) {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [bodyReceipts, setBodyReceipts] = useState([]);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptDraft, setReceiptDraft] = useState(EMPTY_RECEIPT);
  const [creatingReceipt, setCreatingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | done
  const [mode, setMode] = useState(null); // 'verify' | 'enrol' | null
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(EMPTY_PERSONAL);
  const [kin, setKin] = useState(EMPTY_KIN);
  const [gang, setGang] = useState(EMPTY_GANG);
  const [bodyReceiptId, setBodyReceiptId] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [verifyOffenderId, setVerifyOffenderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadBodyReceipts = () => api.getBodyReceipts().then(setBodyReceipts).catch(() => {});

  useEffect(() => {
    api.getFacilities().then(setFacilities).catch(() => {});
    loadBodyReceipts();
  }, []);

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    setCreatingReceipt(true);
    setReceiptError(null);
    try {
      const created = await api.createBodyReceipt({
        ...receiptDraft,
        facility_id: Number(receiptDraft.facility_id),
        total_inmates: Number(receiptDraft.total_inmates)
      });
      await loadBodyReceipts();
      setBodyReceiptId(String(created.id));
      setReceiptDraft(EMPTY_RECEIPT);
      setShowReceiptForm(false);
    } catch (err) {
      setReceiptError(err.message);
    } finally {
      setCreatingReceipt(false);
    }
  };

  const runScan = () => {
    setScanState('scanning');
    setTimeout(() => setScanState('done'), 900);
  };

  const reset = () => {
    setScanState('idle');
    setMode(null);
    setStep(0);
    setPersonal(EMPTY_PERSONAL);
    setKin(EMPTY_KIN);
    setGang(EMPTY_GANG);
    setBodyReceiptId('');
    setPhotoName('');
    setVerifyOffenderId('');
    setSubmitError(null);
  };

  const handleVerify = () => {
    if (!verifyOffenderId) return;
    navigate(`/offenders/${verifyOffenderId}`);
  };

  const handleFinishEnrolment = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await api.createOffender({
        ...personal,
        ...kin,
        facility_id: Number(personal.facility_id),
        number_of_dependants: personal.number_of_dependants === '' ? null : Number(personal.number_of_dependants),
        admission_date: personal.admission_date || new Date().toISOString().slice(0, 10),
        body_receipt_id: bodyReceiptId ? Number(bodyReceiptId) : null
      });
      if (gang.prison_gang || gang.street_gang) {
        await api.updateGangAffiliation(created.id, gang);
      }
      if (onEnrolled) await onEnrolled();
      navigate(`/offenders/${created.id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fingerprint-page">
      <div className="panel profile-section body-receipt-panel">
        <h3>Body Receipts</h3>
        <p className="fingerprint-caption">
          The batch record an admission clerk creates on arrival of a group of inmates, before
          individual profiles are captured.
        </p>
        <div className="screening-actions">
          <button type="button" className="btn-primary" onClick={() => setShowReceiptForm((v) => !v)}>
            {showReceiptForm ? 'Cancel' : 'New Body Receipt'}
          </button>
        </div>

        {showReceiptForm && (
          <form onSubmit={handleCreateReceipt} className="wizard-panel">
            <div className="wizard-grid">
              <label className="form-field">
                <span>Facility *</span>
                <select
                  value={receiptDraft.facility_id}
                  onChange={(e) => setReceiptDraft({ ...receiptDraft, facility_id: e.target.value })}
                  required
                >
                  <option value="">Select facility…</option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Source Type *</span>
                <select
                  value={receiptDraft.source_type}
                  onChange={(e) => setReceiptDraft({ ...receiptDraft, source_type: e.target.value })}
                  required
                >
                  <option value="">Select…</option>
                  {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span>Source *</span>
                <input
                  type="text"
                  placeholder="e.g. Cape Town Magistrate Court"
                  value={receiptDraft.source}
                  onChange={(e) => setReceiptDraft({ ...receiptDraft, source: e.target.value })}
                  required
                />
              </label>
              <label className="form-field">
                <span>Date of Admission *</span>
                <input
                  type="date"
                  value={receiptDraft.date_of_admission}
                  onChange={(e) => setReceiptDraft({ ...receiptDraft, date_of_admission: e.target.value })}
                  required
                />
              </label>
              <label className="form-field">
                <span>Total Inmates *</span>
                <input
                  type="number"
                  min="1"
                  value={receiptDraft.total_inmates}
                  onChange={(e) => setReceiptDraft({ ...receiptDraft, total_inmates: e.target.value })}
                  required
                />
              </label>
            </div>
            {receiptError && <p className="form-error">{receiptError}</p>}
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={creatingReceipt}>
                {creatingReceipt ? 'Saving…' : 'Save Body Receipt'}
              </button>
            </div>
          </form>
        )}

        {bodyReceipts.length === 0 ? (
          <p className="empty">No body receipts on record.</p>
        ) : (
          <ul className="profile-list">
            {bodyReceipts.map((b) => (
              <li key={b.id}>
                <span className="profile-list-title">#{b.id} — {b.source} ({b.source_type})</span>
                <span className="profile-list-meta">
                  {b.facility_name} · {new Date(b.date_of_admission).toLocaleDateString('en-ZA')} · {b.total_inmates} inmates
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fingerprint-flow">
      <h2>Fingerprint Verification</h2>
      <p className="fingerprint-caption">
        DCS Admission flow — scan determines whether the inmate has a profile on file (Verify) or
        requires new admission capture (Enrol).
      </p>

      {scanState !== 'done' && (
        <div className="fingerprint-scanner">
          <div className={`fingerprint-icon${scanState === 'scanning' ? ' is-scanning' : ''}`} aria-hidden="true">
            👆
          </div>
          <button className="btn-primary" onClick={runScan} disabled={scanState === 'scanning'}>
            {scanState === 'scanning' ? 'Scanning…' : 'Scan Fingerprint'}
          </button>
        </div>
      )}

      {scanState === 'done' && !mode && (
        <div className="fingerprint-choice">
          <button className="btn-secondary" onClick={() => setMode('verify')}>Verify existing inmate</button>
          <button className="btn-primary" onClick={() => setMode('enrol')}>Enrol new inmate</button>
          <button className="btn-ghost" onClick={reset}>Rescan</button>
        </div>
      )}

      {mode === 'verify' && (
        <div className="fingerprint-verify">
          <label className="form-field">
            <span>Match found — select inmate profile</span>
            <select value={verifyOffenderId} onChange={(e) => setVerifyOffenderId(e.target.value)}>
              <option value="">Select offender…</option>
              {offenders.map((o) => (
                <option key={o.id} value={o.id}>{o.name} — {o.facility_name}</option>
              ))}
            </select>
          </label>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={reset}>Back</button>
            <button className="btn-primary" onClick={handleVerify} disabled={!verifyOffenderId}>Open profile</button>
          </div>
        </div>
      )}

      {mode === 'enrol' && (
        <div className="fingerprint-enrol">
          <ol className="wizard-steps">
            {STEPS.map((label, i) => (
              <li key={label} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>{label}</li>
            ))}
          </ol>

          {step === 0 && (
            <div className="wizard-panel">
              <label className="form-field">
                <span>Body Receipt</span>
                <select value={bodyReceiptId} onChange={(e) => setBodyReceiptId(e.target.value)}>
                  <option value="">None</option>
                  {bodyReceipts.map((b) => (
                    <option key={b.id} value={b.id}>#{b.id} — {b.source} ({b.date_of_admission})</option>
                  ))}
                </select>
              </label>
              <div className="wizard-grid">
                <label className="form-field"><span>Full Name *</span>
                  <input value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
                </label>
                <label className="form-field"><span>Facility *</span>
                  <select value={personal.facility_id} onChange={(e) => setPersonal({ ...personal, facility_id: e.target.value })}>
                    <option value="">Select facility…</option>
                    {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </label>
                <label className="form-field"><span>ID Number</span>
                  <input value={personal.id_number} onChange={(e) => setPersonal({ ...personal, id_number: e.target.value })} />
                </label>
                <label className="form-field"><span>Registration Number</span>
                  <input value={personal.registration_number} onChange={(e) => setPersonal({ ...personal, registration_number: e.target.value })} />
                </label>
                <label className="form-field"><span>Nickname</span>
                  <input value={personal.nickname} onChange={(e) => setPersonal({ ...personal, nickname: e.target.value })} />
                </label>
                <label className="form-field"><span>Sentence Status</span>
                  <select value={personal.sentence_status} onChange={(e) => setPersonal({ ...personal, sentence_status: e.target.value })}>
                    <option value="remand">Remand</option>
                    <option value="sentenced">Sentenced</option>
                  </select>
                </label>
                <label className="form-field"><span>Status</span>
                  <select value={personal.status} onChange={(e) => setPersonal({ ...personal, status: e.target.value })}>
                    <option value="incarcerated">Incarcerated</option>
                    <option value="community_corrections">Community Corrections</option>
                    <option value="released">Released</option>
                  </select>
                </label>
                <label className="form-field"><span>Admission Date</span>
                  <input type="date" value={personal.admission_date} onChange={(e) => setPersonal({ ...personal, admission_date: e.target.value })} />
                </label>
                <label className="form-field"><span>Warrant Type</span>
                  <input value={personal.warrant_type} onChange={(e) => setPersonal({ ...personal, warrant_type: e.target.value })} />
                </label>
                <label className="form-field"><span>Gender</span>
                  <select value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}>
                    <option value="">Select…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </label>
                <label className="form-field"><span>Race</span>
                  <input value={personal.race} onChange={(e) => setPersonal({ ...personal, race: e.target.value })} />
                </label>
                <label className="form-field"><span>Nationality</span>
                  <input value={personal.nationality} onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })} />
                </label>
                <label className="form-field"><span>Marital Status</span>
                  <input value={personal.marital_status} onChange={(e) => setPersonal({ ...personal, marital_status: e.target.value })} />
                </label>
                <label className="form-field"><span>Religion</span>
                  <input value={personal.religion} onChange={(e) => setPersonal({ ...personal, religion: e.target.value })} />
                </label>
                <label className="form-field"><span>Denomination</span>
                  <input value={personal.denomination} onChange={(e) => setPersonal({ ...personal, denomination: e.target.value })} />
                </label>
                <label className="form-field"><span>Passport Number</span>
                  <input value={personal.passport_number} onChange={(e) => setPersonal({ ...personal, passport_number: e.target.value })} />
                </label>
                <label className="form-field"><span>Place of Birth</span>
                  <input value={personal.place_of_birth} onChange={(e) => setPersonal({ ...personal, place_of_birth: e.target.value })} />
                </label>
                <label className="form-field"><span>Date of Birth</span>
                  <input type="date" value={personal.date_of_birth} onChange={(e) => setPersonal({ ...personal, date_of_birth: e.target.value })} />
                </label>
                <label className="form-field"><span>Number of Dependants</span>
                  <input type="number" min="0" value={personal.number_of_dependants} onChange={(e) => setPersonal({ ...personal, number_of_dependants: e.target.value })} />
                </label>
                <label className="form-field"><span>Street Address</span>
                  <input value={personal.address_street} onChange={(e) => setPersonal({ ...personal, address_street: e.target.value })} />
                </label>
                <label className="form-field"><span>Town</span>
                  <input value={personal.address_town} onChange={(e) => setPersonal({ ...personal, address_town: e.target.value })} />
                </label>
                <label className="form-field"><span>Province</span>
                  <input value={personal.address_province} onChange={(e) => setPersonal({ ...personal, address_province: e.target.value })} />
                </label>
                <label className="form-field"><span>Postal Code</span>
                  <input value={personal.postal_code} onChange={(e) => setPersonal({ ...personal, postal_code: e.target.value })} />
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="wizard-panel">
              <div className="wizard-grid">
                <label className="form-field"><span>Next of Kin Name</span>
                  <input value={kin.next_of_kin_name} onChange={(e) => setKin({ ...kin, next_of_kin_name: e.target.value })} />
                </label>
                <label className="form-field"><span>Contact Number</span>
                  <input value={kin.next_of_kin_contact} onChange={(e) => setKin({ ...kin, next_of_kin_contact: e.target.value })} />
                </label>
                <label className="form-field"><span>Relationship</span>
                  <input value={kin.next_of_kin_relationship} onChange={(e) => setKin({ ...kin, next_of_kin_relationship: e.target.value })} />
                </label>
                <label className="form-field"><span>Town</span>
                  <input value={kin.next_of_kin_town} onChange={(e) => setKin({ ...kin, next_of_kin_town: e.target.value })} />
                </label>
                <label className="form-field"><span>Province</span>
                  <input value={kin.next_of_kin_province} onChange={(e) => setKin({ ...kin, next_of_kin_province: e.target.value })} />
                </label>
                <label className="form-field"><span>Postal Code</span>
                  <input value={kin.next_of_kin_postal_code} onChange={(e) => setKin({ ...kin, next_of_kin_postal_code: e.target.value })} />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-panel">
              <div className="wizard-grid">
                <label className="form-field"><span>Prison Gang</span>
                  <input value={gang.prison_gang} onChange={(e) => setGang({ ...gang, prison_gang: e.target.value })} />
                </label>
                <label className="form-field"><span>Prison Gang Rank</span>
                  <input value={gang.prison_gang_rank} onChange={(e) => setGang({ ...gang, prison_gang_rank: e.target.value })} />
                </label>
                <label className="form-field"><span>Street Gang</span>
                  <input value={gang.street_gang} onChange={(e) => setGang({ ...gang, street_gang: e.target.value })} />
                </label>
                <label className="form-field"><span>Street Gang Rank</span>
                  <input value={gang.street_gang_rank} onChange={(e) => setGang({ ...gang, street_gang_rank: e.target.value })} />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-panel">
              <label className="form-field">
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files[0]?.name || '')} />
              </label>
              {photoName && <p className="fingerprint-caption">Selected: {photoName} (not persisted in this prototype)</p>}
              {submitError && <p className="form-error">{submitError}</p>}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => (step === 0 ? reset() : setStep(step - 1))}>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                className="btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && (!personal.name || !personal.facility_id)}
              >
                Next
              </button>
            ) : (
              <button className="btn-primary" onClick={handleFinishEnrolment} disabled={submitting}>
                {submitting ? 'Creating profile…' : 'Complete Admission'}
              </button>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

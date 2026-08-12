import { useState } from 'react';

const MODAL_TITLE = {
  prostate: 'Add Prostate Screening',
  cervical: 'Add Cervical Screening',
  cryptococcal_meningitis: 'Add Cryptococcal Meningitis Screening'
};

const LAB_TEST_LABEL = {
  prostate: 'PSA (Lab Test Conducted)',
  cervical: 'Pap Smear (Lab Test Conducted)'
};

const LAB_RESULT_LABEL = {
  prostate: 'Results of PSA',
  cervical: 'Results of Pap Smear'
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddScreeningModal({ screeningType, onClose, onSubmit }) {
  const [dateScreened, setDateScreened] = useState(todayISO());
  const [signsSymptoms, setSignsSymptoms] = useState('');
  const [labTest, setLabTest] = useState('');
  const [labResult, setLabResult] = useState('');
  const [cd4Count, setCd4Count] = useState('');
  const [j138Case, setJ138Case] = useState('no');
  const [referredTo, setReferredTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isCryptococcal = screeningType === 'cryptococcal_meningitis';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        screening_type: screeningType,
        date_screened: dateScreened,
        signs_symptoms: signsSymptoms || null,
        lab_test: isCryptococcal ? null : labTest || null,
        lab_result: isCryptococcal ? null : labResult || null,
        cd4_count: isCryptococcal ? cd4Count || null : null,
        j138_case: isCryptococcal ? j138Case === 'yes' : false,
        referred_to: referredTo || null
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label={MODAL_TITLE[screeningType]} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{MODAL_TITLE[screeningType]}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-field">
            <span>Date Screened</span>
            <input type="date" value={dateScreened} onChange={(e) => setDateScreened(e.target.value)} required />
          </label>

          <label className="form-field">
            <span>Signs and Symptoms</span>
            <textarea value={signsSymptoms} onChange={(e) => setSignsSymptoms(e.target.value)} rows={2} />
          </label>

          {isCryptococcal ? (
            <>
              <label className="form-field">
                <span>CD4 Count</span>
                <input type="text" value={cd4Count} onChange={(e) => setCd4Count(e.target.value)} />
              </label>
              <label className="form-field">
                <span>J138 Case</span>
                <select value={j138Case} onChange={(e) => setJ138Case(e.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              <label className="form-field">
                <span>Referred to Ext Hosp</span>
                <input type="text" value={referredTo} onChange={(e) => setReferredTo(e.target.value)} />
              </label>
            </>
          ) : (
            <>
              <label className="form-field">
                <span>{LAB_TEST_LABEL[screeningType]}</span>
                <input type="text" value={labTest} onChange={(e) => setLabTest(e.target.value)} />
              </label>
              <label className="form-field">
                <span>{LAB_RESULT_LABEL[screeningType]}</span>
                <input type="text" value={labResult} onChange={(e) => setLabResult(e.target.value)} />
              </label>
              <label className="form-field">
                <span>Referred to Dr</span>
                <input type="text" value={referredTo} onChange={(e) => setReferredTo(e.target.value)} />
              </label>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Screening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

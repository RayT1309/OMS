import { useState } from 'react';

const WARRANT_TYPES = {
  J7: {
    category: 'unsentenced',
    label: 'J7 — Detention pending trial',
    fields: [
      { key: 'police_station', label: 'Police Station' },
      { key: 'district_regional_division', label: 'District/Regional Division' },
      { key: 'cas_no', label: 'CAS No.' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'date_of_arrest', label: 'Date of Arrest', type: 'date' },
      { key: 'investigating_officer', label: 'Investigating Officer' },
      { key: 'investigating_officer_contact', label: 'Investigating Officer Contact No.' },
      { key: 'prosecutor', label: 'Prosecutor' },
      { key: 'legal_representative', label: 'Legal Representative' },
      { key: 'correctional_centre', label: 'Correctional Centre' },
      { key: 'type_of_detention', label: 'Type of Detention', type: 'select', options: ['Arraigned for trial on charge(s) of', 'Who was convicted on charge(s) of'] },
      { key: 'charges', label: 'Charges' },
      { key: 'custody_until_date', label: 'To Be Held in Custody Until', type: 'date' },
      { key: 'court', label: 'Court' },
      { key: 'bail_particulars', label: 'Bail Particulars', type: 'select', options: ['No bail application has been made', 'Bail application in process', 'Bail application considered and denied', 'Bail approved and fixed at'] },
      { key: 'bail_amount', label: 'Bail Amount' }
    ]
  },
  J138A: {
    category: 'unsentenced',
    label: 'J138A — Psychiatric evaluation (unsentenced)',
    fields: [
      { key: 'fingerprint_no', label: 'Fingerprint No.' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'cas_no', label: 'CAS No.' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'correctional_centre', label: 'Correctional Centre' },
      { key: 'hospital', label: 'Hospital' },
      { key: 'doctor', label: 'Doctor' },
      { key: 'charges', label: 'Charges' },
      { key: 'district_regional_division', label: 'District/Regional Division' },
      { key: 'provincial_local_division', label: 'Provincial/Local Division' },
      { key: 'enquiry_length_days', label: 'Enquiry Length (days)', type: 'number' },
      { key: 'act_section', label: 'Act Section' },
      { key: 'report_submission_date', label: 'Report Submission Date', type: 'date' }
    ]
  },
  J138E: {
    category: 'sentenced',
    label: 'J138E — Psychiatric evaluation (sentenced)',
    fields: [
      { key: 'fingerprint_no', label: 'Fingerprint No.' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'cr_number', label: 'CR Number' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'correctional_centre', label: 'Correctional Centre' },
      { key: 'hospital', label: 'Hospital' },
      { key: 'doctor', label: 'Doctor' },
      { key: 'charges', label: 'Charges' },
      { key: 'district_regional_division', label: 'District/Regional Division' },
      { key: 'provincial_local_division', label: 'Provincial/Local Division' },
      { key: 'enquiry_length_days', label: 'Enquiry Length (days)', type: 'number' },
      { key: 'act_section', label: 'Act Section' },
      { key: 'report_submission_date', label: 'Report Submission Date', type: 'date' }
    ]
  },
  G306: {
    category: 'sentenced',
    label: 'G306 — Arrest & detention of parolee/probationer',
    fields: [
      { key: 'fingerprint_no', label: 'Fingerprint No.' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'cas_no', label: 'CAS No.' },
      { key: 'cr_number', label: 'CR Number' },
      { key: 'docket_number', label: 'Docket Number' },
      { key: 'home_address', label: 'Home Address' },
      { key: 'telephone_home', label: 'Telephone (Home)' },
      { key: 'telephone_work', label: 'Telephone (Work)' },
      { key: 'date_of_sentence', label: 'Date of Sentence', type: 'date' },
      { key: 'court', label: 'Court' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'offence', label: 'Offence' },
      { key: 'sentence', label: 'Sentence' },
      { key: 'sentence_period_from', label: 'Sentence Period From', type: 'date' },
      { key: 'sentence_period_to', label: 'Sentence Period To', type: 'date' },
      { key: 'sentence_length', label: 'Sentence Length' },
      { key: 'parole_violation', label: 'Parole Violation', type: 'select', options: ['Community service', 'Monitoring', 'Programs', 'Compensation', 'Electronic Monitoring', 'Other'] },
      { key: 'violation_length', label: 'Violation Length' },
      { key: 'date_warrant_served', label: 'Date Warrant Served', type: 'date' },
      { key: 'community_corrections', label: 'Community Corrections' },
      { key: 'head_of_community_corrections', label: 'Head of Community Corrections' }
    ]
  },
  SAP69: {
    category: 'sentenced',
    label: 'SAP69 — Report of convictions',
    fields: [
      { key: 'number_of_warrants', label: 'Number of Warrants', type: 'number' },
      { key: 'type_of_court', label: 'Type of Court' },
      { key: 'district_regional_division', label: 'District/Regional Division' },
      { key: 'court', label: 'Court' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'cas_no', label: 'CAS No.' },
      { key: 'fingerprint_no', label: 'Fingerprint No.' },
      { key: 'charged_with', label: 'Charged With' },
      { key: 'date_offence_committed', label: 'Date Offence Committed', type: 'date' },
      { key: 'date_of_conviction', label: 'Date of Conviction', type: 'date' },
      { key: 'sentence', label: 'Sentence' },
      { key: 'classification_of_fine', label: 'Classification of Fine' },
      { key: 'date_of_sentence', label: 'Date of Sentence', type: 'date' }
    ]
  },
  G344: {
    category: 'sentenced',
    label: 'G344 — Inmate with further charges',
    fields: [
      { key: 'clerk_of_court', label: 'Clerk of the Court' },
      { key: 'cas_no', label: 'CAS Number' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'offence', label: 'Offence' },
      { key: 'correctional_centre', label: 'Correctional Centre' },
      { key: 'dcs_case_number', label: 'DCS Case Number' },
      { key: 'court', label: 'Court' },
      { key: 'date_remanded_to', label: 'Date Remanded To', type: 'date' },
      { key: 'sentence_category', label: 'Sentence Category' },
      { key: 'head_of_correctional_centre', label: 'Head of Correctional Centre' },
      { key: 'warrant_status', label: 'Warrant Status', type: 'select', options: ['Warrant for committal/detention issued', 'Warrant for release issued', 'Warrant not issued'] },
      { key: 'judgment', label: 'Judgment' },
      { key: 'sentence', label: 'Sentence' }
    ]
  },
  J1: {
    category: 'sentenced',
    label: 'J1 — Warrant of liberation',
    fields: [
      { key: 'cas_no', label: 'CAS Number' },
      { key: 'police_station', label: 'Police Station' },
      { key: 'court_case_number', label: 'Court Case Number' },
      { key: 'district_regional_division', label: 'District/Regional Division' },
      { key: 'correctional_centre', label: 'Correctional Centre' },
      { key: 'warrant_dated', label: 'Warrant Dated', type: 'date' },
      { key: 'charged_with', label: 'Charged With' },
      { key: 'sentence', label: 'Sentence' },
      { key: 'by_reason_of', label: 'By Reason Of' },
      { key: 'given_under_hand_at', label: 'Given Under Hand At' },
      { key: 'date_of_liberation', label: 'Date of Liberation', type: 'date' }
    ]
  }
};

const CATEGORY_TYPES = {
  unsentenced: ['J7', 'J138A'],
  sentenced: ['J138E', 'G306', 'SAP69', 'G344', 'J1']
};

export default function AddWarrantModal({ onClose, onSubmit }) {
  const [category, setCategory] = useState('unsentenced');
  const [warrantType, setWarrantType] = useState('J7');
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCategoryChange = (next) => {
    setCategory(next);
    setWarrantType(CATEGORY_TYPES[next][0]);
    setValues({});
  };

  const handleTypeChange = (next) => {
    setWarrantType(next);
    setValues({});
  };

  const config = WARRANT_TYPES[warrantType];

  const handleFieldChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        warrant_category: category,
        warrant_type: warrantType,
        ...values
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog-wide" role="dialog" aria-modal="true" aria-label="Add Warrant" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Warrant</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="warrant-tabs">
            <button type="button" className={category === 'unsentenced' ? 'is-active' : ''} onClick={() => handleCategoryChange('unsentenced')}>Unsentenced</button>
            <button type="button" className={category === 'sentenced' ? 'is-active' : ''} onClick={() => handleCategoryChange('sentenced')}>Sentenced</button>
          </div>

          <label className="form-field">
            <span>Warrant Type</span>
            <select value={warrantType} onChange={(e) => handleTypeChange(e.target.value)}>
              {CATEGORY_TYPES[category].map((type) => (
                <option key={type} value={type}>{WARRANT_TYPES[type].label}</option>
              ))}
            </select>
          </label>

          <div className="wizard-grid">
            {config.fields.map((field) => (
              <label className="form-field" key={field.key}>
                <span>{field.label}</span>
                {field.type === 'select' ? (
                  <select value={values[field.key] || ''} onChange={(e) => handleFieldChange(field.key, e.target.value)}>
                    <option value="">Select…</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    value={values[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Warrant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

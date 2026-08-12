import { useState } from 'react';

export default function AddPropertyModal({ onClose, onSubmit }) {
  const [itemDescription, setItemDescription] = useState('');
  const [condition, setCondition] = useState('good');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [bagNumber, setBagNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        item_description: itemDescription,
        condition,
        estimated_value: estimatedValue === '' ? null : Number(estimatedValue),
        bag_number: bagNumber || null
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Add Personal Property" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Personal Property</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-field">
            <span>Item Description</span>
            <input type="text" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} required />
          </label>
          <label className="form-field">
            <span>Condition</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </label>
          <label className="form-field">
            <span>Estimated Value (R)</span>
            <input type="number" min="0" step="0.01" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Bag Number</span>
            <input type="text" value={bagNumber} onChange={(e) => setBagNumber(e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

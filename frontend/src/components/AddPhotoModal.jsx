import { useState } from 'react';
import { fileToCompressedDataUrl } from '../utils/photo';

export default function AddPhotoModal({ onClose, onSubmit }) {
  const [kind, setKind] = useState('evidence');
  const [note, setNote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoError, setPhotoError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError(null);
    try {
      setPhotoDataUrl(await fileToCompressedDataUrl(file));
    } catch (err) {
      setPhotoError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoDataUrl) {
      setError('A photo is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ kind, photo: photoDataUrl, note: note || null });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label="Add Photo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Photo</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="form-field">
            <span>Photo Type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="mugshot">Mugshot (replaces profile photo)</option>
              <option value="evidence">Evidence</option>
            </select>
          </label>

          <label className="form-field">
            <span>Photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} />
          </label>
          {photoDataUrl && (
            <div className="photo-preview">
              <img src={photoDataUrl} alt="Captured" />
              <button type="button" className="btn-ghost" onClick={() => setPhotoDataUrl('')}>Retake</button>
            </div>
          )}
          {photoError && <p className="form-error">{photoError}</p>}

          <label className="form-field">
            <span>Note (optional)</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

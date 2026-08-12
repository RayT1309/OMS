import { useState } from 'react';

const INCIDENT_TYPES = [
  { value: 'assault', label: 'Assault' },
  { value: 'escape_attempt', label: 'Escape Attempt' },
  { value: 'escape', label: 'Escape (Completed)' },
  { value: 'contraband', label: 'Contraband' },
  { value: 'disciplinary_hearing', label: 'Disciplinary Hearing' },
  { value: 'death', label: 'Death in Custody' }
];

export default function IncidentForm({ offenders, offline, onToggleOffline, onSubmit, outbox, onSync, syncing }) {
  const [offenderId, setOffenderId] = useState('');
  const [type, setType] = useState('assault');
  const [injury, setInjury] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offenderId) return;
    setSubmitting(true);
    try {
      const offender = offenders.find((o) => String(o.id) === String(offenderId));
      const result = await onSubmit({
        offender_id: Number(offenderId),
        facility_id: offender.facility_id,
        type,
        injury,
        offline
      });
      setLastResult({ synced: result.synced });
      setInjury(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header-row">
        <h2>Log Incident</h2>
        <label className="offline-toggle">
          <input
            type="checkbox"
            role="switch"
            aria-checked={offline}
            checked={offline}
            onChange={(e) => onToggleOffline(e.target.checked)}
            aria-label="Toggle offline mode for incident logging"
          />
          <span className={`toggle-track ${offline ? 'is-offline' : 'is-online'}`} aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
          <span className={`toggle-label ${offline ? 'label-offline' : 'label-online'}`}>
            {offline ? 'OFFLINE' : 'ONLINE'}
          </span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="incident-form">
        <label>
          Offender
          <select value={offenderId} onChange={(e) => setOffenderId(e.target.value)} required>
            <option value="" disabled>Select offender…</option>
            {offenders.map((o) => (
              <option key={o.id} value={o.id}>{o.name} ({o.facility_name})</option>
            ))}
          </select>
        </label>

        <label>
          Incident Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        {type === 'assault' && (
          <label className="checkbox-label">
            <input type="checkbox" checked={injury} onChange={(e) => setInjury(e.target.checked)} />
            Resulted in injury
          </label>
        )}

        <button type="submit" disabled={submitting || !offenderId}>
          {offline ? 'Log Offline (queue locally)' : 'Log Incident'}
        </button>
      </form>

      {lastResult && (
        <p className={`log-feedback ${lastResult.synced ? 'feedback-synced' : 'feedback-queued'}`}>
          {lastResult.synced
            ? '✓ Logged and synced immediately.'
            : '⏳ Queued locally — not yet synced, not counted in KPIs.'}
        </p>
      )}

      <div className="outbox">
        <div className="outbox-header">
          <h3>Sync Queue ({outbox.length})</h3>
          <button
            className="sync-btn"
            onClick={onSync}
            disabled={syncing || outbox.length === 0}
          >
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
        {outbox.length === 0 ? (
          <p className="empty">No incidents waiting to sync.</p>
        ) : (
          <ul className="outbox-list">
            {outbox.map((item) => (
              <li key={item.id}>
                <span className="outbox-badge">unsynced</span>
                {item.offender_name} — {item.type.replace('_', ' ')} @ {item.facility_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

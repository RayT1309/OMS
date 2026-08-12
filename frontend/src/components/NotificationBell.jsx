import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const SEVERITY_LABEL = { critical: 'Critical', warning: 'Warning', info: 'Info' };

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setAlerts(await api.getAlerts());
      } catch {
        // leave previous alerts in place on transient failure
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goTo = (alert) => {
    navigate(`/offenders/${alert.offender_id}`);
    setOpen(false);
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="notif-bell" ref={boxRef}>
      <button
        type="button"
        className="notif-bell-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications (${alerts.length})`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {alerts.length > 0 && (
          <span className={`notif-bell-badge${criticalCount > 0 ? ' notif-bell-badge--critical' : ''}`}>
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          {alerts.length === 0 ? (
            <div className="notif-dropdown-empty">You&rsquo;re all caught up</div>
          ) : (
            alerts.map((a) => (
              <div className="notif-item" key={a.id} onClick={() => goTo(a)}>
                <span className={`notif-item-dot notif-item-dot--${a.severity}`} title={SEVERITY_LABEL[a.severity]} />
                <div className="notif-item-body">
                  <span className="notif-item-title">{a.title}</span>
                  <span className="notif-item-detail">{a.detail}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

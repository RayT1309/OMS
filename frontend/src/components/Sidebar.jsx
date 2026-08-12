import { NavLink } from 'react-router-dom';

function Icon({ path }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

const ICONS = {
  Dashboard: <Icon path={<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>} />,
  Fingerprint: <Icon path={<><path d="M12 3a5 5 0 0 0-5 5v2" /><path d="M17 8a5 5 0 0 0-10 0v2c0 4-1 6-2 8" /><path d="M12 8a3 3 0 0 0-3 3v1c0 5-1.5 7-3 9" /><path d="M12 8a3 3 0 0 1 3 3v2c0 4 1 6 2 8" /><path d="M8 15c-.5 2-1.5 4-2.5 6" /></>} />,
  Inmates: <Icon path={<><circle cx="9" cy="7" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17.5" cy="8" r="2.5" /><path d="M15 20a5.5 5.5 0 0 1 6.5-5.4" /></>} />,
  Warrants: <Icon path={<><path d="M9 12h6" /><path d="M9 16h6" /><path d="M9 8h1" /><rect x="4" y="3" width="16" height="18" rx="2" /></>} />,
  Reports: <Icon path={<><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>} />,
  Calendar: <Icon path={<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>} />,
  Admin: <Icon path={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04z" /></>} />
};

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', active: true },
  { label: 'Fingerprint', to: '/fingerprint', active: true },
  { label: 'Inmates', to: '/', active: true },
  { label: 'Warrants', to: '/warrants', active: true },
  { label: 'Reports', to: '/reports', active: true },
  { label: 'Calendar' },
  { label: 'Admin' }
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar-brand">OMS</div>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) =>
          item.active ? (
            <li key={item.label}>
              <NavLink to={item.to} end className={({ isActive }) => (isActive ? 'sidebar-link is-active' : 'sidebar-link')}>
                {ICONS[item.label]}
                {item.label}
              </NavLink>
            </li>
          ) : (
            <li key={item.label}>
              <span className="sidebar-link is-disabled" title="Not implemented in this prototype">
                {ICONS[item.label]}
                {item.label}
              </span>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

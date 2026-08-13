import { useEffect, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from './api';
import KpiCards from './components/KpiCards';
import IncidentTrendChart from './components/IncidentTrendChart';
import OffenderTable from './components/OffenderTable';
import FacilityBreakdown from './components/FacilityBreakdown';
import IncidentForm from './components/IncidentForm';
import OffenderProfile from './components/OffenderProfile';
import FingerprintFlow from './components/FingerprintFlow';
import WarrantsPage from './components/WarrantsPage';
import ReportsPage from './components/ReportsPage';
import TopbarSearch from './components/TopbarSearch';
import NotificationBell from './components/NotificationBell';
import LoginPage from './components/LoginPage';
import FacilityPicker from './components/FacilityPicker';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  const [offenders, setOffenders] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [offline, setOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      if (api.hasToken()) {
        try {
          setUser(await api.getMe());
        } catch {
          setUser(null);
        }
      }
      setAuthChecked(true);
    })();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  const handleChangeArea = () => {
    setUser((u) => ({ ...u, facility_id: null, facility_name: null }));
  };

  const refresh = useCallback(async () => {
    const [kpisData, trendData, outboxData] = await Promise.all([
      api.getKpis(),
      api.getTrend(),
      api.getOutbox()
    ]);
    setKpis(kpisData);
    setTrend(trendData);
    setOutbox(outboxData);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const facilityScoped = user.scope === 'facility' || !user.scope;
        const [offendersData] = await Promise.all([facilityScoped ? api.getOffenders() : Promise.resolve([]), refresh()]);
        setOffenders(offendersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, refresh]);

  const handleLogIncident = async (incident) => {
    const result = await api.logIncident(incident);
    await refresh();
    return result;
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncIncidents();
      await refresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleEnrolled = async () => {
    const offendersData = await api.getOffenders();
    setOffenders(offendersData);
    await refresh();
  };

  const isFacilityScoped = !user || !user.scope || user.scope === 'facility';

  if (!authChecked) return <div className="loading-screen">Loading OMS dashboard…</div>;
  if (!user) return <LoginPage onLogin={setUser} />;
  if (isFacilityScoped && !user.facility_id) return <FacilityPicker user={user} onSelected={setUser} />;
  if (loading) return <div className="loading-screen">Loading OMS dashboard…</div>;
  if (error) return <div className="loading-screen error">Failed to load: {error}. Is the backend running on :4000?</div>;

  const areaLabel = !isFacilityScoped
    ? (user.scope === 'national' ? 'National — all facilities' : `${user.region} region — all facilities`)
    : user.facility_name;

  return (
    <div className="app app-shell">
      <Sidebar />

      <div className="app-shell-main">
        <header className="app-header topbar">
          <div>
            <h1>Offender Management System</h1>
            <span className="subtitle">KPI-driven dashboard · {areaLabel}</span>
          </div>
          <TopbarSearch />
          <NotificationBell />
          <div className="topbar-user" title={`${user.name} · ${user.role}`}>
            <span className="topbar-user-avatar">{user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</span>
            <span className="topbar-user-email">{user.name} <span className="topbar-user-role">· {user.role}</span></span>
            {isFacilityScoped && <button type="button" className="btn-ghost topbar-logout" onClick={handleChangeArea}>Change area</button>}
            <button type="button" className="btn-ghost topbar-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <KpiCards kpis={kpis} />

                  {isFacilityScoped ? (
                    <>
                      <div className="grid-2col">
                        <IncidentTrendChart trend={trend} />
                        <IncidentForm
                          offenders={offenders}
                          offline={offline}
                          onToggleOffline={setOffline}
                          onSubmit={handleLogIncident}
                          outbox={outbox}
                          onSync={handleSync}
                          syncing={syncing}
                        />
                      </div>

                      <OffenderTable offenders={offenders} />
                    </>
                  ) : (
                    <>
                      <IncidentTrendChart trend={trend} />
                      <FacilityBreakdown scope={user.scope} />
                    </>
                  )}
                </>
              }
            />
            <Route path="/offenders/:id" element={<OffenderProfile />} />
            <Route path="/fingerprint" element={<FingerprintFlow offenders={offenders} onEnrolled={handleEnrolled} />} />
            <Route path="/warrants" element={<WarrantsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

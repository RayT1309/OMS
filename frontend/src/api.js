const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'oms_token';

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  login: async (email, password) => {
    const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem(TOKEN_KEY, result.token);
    return result.user;
  },
  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  getMe: () => request('/auth/me'),
  setFacility: (facilityId) => request('/auth/me/facility', { method: 'PUT', body: JSON.stringify({ facility_id: facilityId }) }),
  hasToken: () => !!localStorage.getItem(TOKEN_KEY),
  getFacilities: () => request('/facilities'),
  getOffenders: () => request('/offenders'),
  getWarrants: () => request('/warrants'),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  getAlerts: () => request('/alerts'),
  getKpiReports: (days = 30) => request(`/reports/kpi?days=${days}`),
  generateKpiReport: () => request('/reports/kpi/generate', { method: 'POST' }),
  exportKpiReportsCsv: async (days = 30) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${BASE_URL}/reports/kpi/export.csv?days=${days}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : 'kpi-report.csv';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
  getOffenderProfile: (id) => request(`/offenders/${id}/profile`),
  addScreening: (id, screening) => request(`/offenders/${id}/screenings`, { method: 'POST', body: JSON.stringify(screening) }),
  createOffender: (offender) => request('/offenders', { method: 'POST', body: JSON.stringify(offender) }),
  updateGangAffiliation: (id, gang) => request(`/offenders/${id}/gang`, { method: 'PUT', body: JSON.stringify(gang) }),
  addPersonalProperty: (id, item) => request(`/offenders/${id}/property`, { method: 'POST', body: JSON.stringify(item) }),
  addWarrant: (id, warrant) => request(`/offenders/${id}/warrants`, { method: 'POST', body: JSON.stringify(warrant) }),
  addHealthAssessment: (id, assessment) => request(`/offenders/${id}/health-assessments`, { method: 'POST', body: JSON.stringify(assessment) }),
  addSectionAAssessment: (id, assessment) => request(`/offenders/${id}/section-a-assessments`, { method: 'POST', body: JSON.stringify(assessment) }),
  addSectionBAssessment: (id, assessment) => request(`/offenders/${id}/section-b-assessments`, { method: 'POST', body: JSON.stringify(assessment) }),
  addSectionCAssessment: (id, assessment) => request(`/offenders/${id}/section-c-assessments`, { method: 'POST', body: JSON.stringify(assessment) }),
  addSectionDAssessment: (id, assessment) => request(`/offenders/${id}/section-d-assessments`, { method: 'POST', body: JSON.stringify(assessment) }),
  addCorrectionalSentencePlan: (id, plan) => request(`/offenders/${id}/correctional-sentence-plans`, { method: 'POST', body: JSON.stringify(plan) }),
  addRelease: (id, release) => request(`/offenders/${id}/releases`, { method: 'POST', body: JSON.stringify(release) }),
  getBodyReceipts: () => request('/body-receipts'),
  createBodyReceipt: (receipt) => request('/body-receipts', { method: 'POST', body: JSON.stringify(receipt) }),
  getKpis: () => request('/kpi'),
  getTrend: () => request('/kpi/trend'),
  getOutbox: () => request('/incidents/outbox'),
  logIncident: (incident) => request('/incidents', { method: 'POST', body: JSON.stringify(incident) }),
  syncIncidents: () => request('/incidents/sync', { method: 'POST' })
};

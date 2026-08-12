# OMS Prototype — KPI-Driven Offender Management System

A working full-stack prototype for a South African correctional services
context. Replaces the flat, always-online assumption behind the failed IIMS
project with an offline-tolerant, facility-local data model: incidents can be
logged while a facility is disconnected, queue locally, and only count toward
KPIs once explicitly synced.

## Stack

- **Backend**: Node.js + Express + better-sqlite3 (file-based SQLite, no external services)
- **Frontend**: React (Vite) + Chart.js
- No authentication, no external APIs — fully self-contained.

## Project layout

```
backend/
  server.js         Express app entrypoint, mounts routes, auto-seeds on first run
  db.js             SQLite schema (facilities, offenders, incidents, health_records)
  kpi-engine.js      All KPI computation — the single place KPI logic lives
  seed.js            Mock data: 2 facilities, 10 offenders, 15 incidents over 6 months
  routes/
    offenders.js      CRUD for offenders
    incidents.js       Incident log, offline outbox, sync endpoint
    kpi.js              /kpi and /kpi/trend
    health.js            HIV/TB record read/update
frontend/
  src/
    api.js                  fetch wrapper for the backend
    App.jsx                  page layout / data orchestration
    components/
      KpiCards.jsx            KPI cards row
      IncidentTrendChart.jsx   Chart.js line chart
      OffenderTable.jsx        offender case table
      IncidentForm.jsx          incident logging form + offline toggle + sync queue
```

## Running it

Two processes, two terminals:

```bash
# Terminal 1 — backend (http://localhost:4000)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

The SQLite database (`backend/oms.db`) is created and seeded automatically
the first time the backend starts. Delete `backend/oms.db` and restart to
reseed from scratch.

## The offline/sync story (the core feature)

The `incidents` table doubles as its own outbox: every incident row has a
`synced` flag. This models a facility-local SQLite store that only
reconciles with the wider system when connectivity returns — there's no
separate mirrored table because the incident *is* the sync unit.

1. Toggle **OFFLINE** in the incident logging form (top of the panel).
2. Log an incident. It's written to SQLite immediately with `synced = 0`
   and appears in the **Sync Queue** list — but it is *excluded* from every
   KPI (`kpi-engine.js` only counts `synced = 1` rows) and from the trend
   chart.
3. Click **Sync Now**. The backend flips all queued rows to `synced = 1` in
   one update; the frontend refetches `/api/kpi`, `/api/kpi/trend`, and the
   outbox, so the KPI cards, chart, and "Pending Sync" count all update live.

This is the same mechanism whether the facility was offline for a minute or
a week — the queue just grows until the next sync.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/facilities` | List facilities |
| GET | `/api/offenders` | List offenders |
| GET | `/api/offenders/:id` | Offender detail incl. health + incident history |
| POST | `/api/offenders` | Create offender |
| PUT | `/api/offenders/:id` | Update offender |
| DELETE | `/api/offenders/:id` | Delete offender |
| GET | `/api/incidents` | All incidents |
| GET | `/api/incidents/outbox` | Incidents queued (`synced = 0`) |
| POST | `/api/incidents` | Log incident; `{ offline: true }` queues it unsynced |
| POST | `/api/incidents/sync` | Marks all queued incidents synced |
| GET | `/api/kpi` | Computed KPIs (escape rate, assault injury rate, TB cure rate, sites live, pending sync) |
| GET | `/api/kpi/trend` | Monthly incident counts (synced only) for the trend chart |
| GET/PUT | `/api/health/:offenderId` | HIV/TB record |

## KPIs

All computed live in `backend/kpi-engine.js` from `offenders`, `incidents`,
and `health_records` — nothing is cached or stored redundantly:

- **Escape rate** = synced escape_attempt incidents / total offenders
- **Assault injury rate** = synced assaults with injury / synced assaults
- **TB cure rate** = cured / (cured + active)
- **Sites live** = distinct facilities with at least one synced incident

const express = require('express');
const sql = require('../db');
const { supabaseAnon, supabaseAdmin, requireAuth, setUserFacility } = require('../auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: email.toLowerCase(),
    password
  });
  if (error || !data.session) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const rows = await sql`
    SELECT p.id, p.email, p.name, p.role, p.facility_id, p.scope, p.region, f.name AS facility_name
    FROM profiles p
    LEFT JOIN facilities f ON f.id = p.facility_id
    WHERE p.id = ${data.user.id}
  `;
  const profile = rows[0];
  if (!profile) return res.status(401).json({ error: 'No profile found for this account' });

  res.json({
    token: data.session.access_token,
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      facility_id: profile.facility_id,
      facility_name: profile.facility_name,
      scope: profile.scope,
      region: profile.region
    }
  });
});

router.put('/me/facility', requireAuth, async (req, res) => {
  const { facility_id } = req.body;
  const rows = await sql`SELECT id, name FROM facilities WHERE id = ${facility_id}`;
  const facility = rows[0];
  if (!facility) return res.status(400).json({ error: 'Unknown facility_id' });

  await setUserFacility(req.user.id, facility.id);
  res.json({ ...req.user, facility_id: facility.id, facility_name: facility.name });
});

router.post('/logout', requireAuth, async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    await supabaseAdmin.auth.admin.signOut(token, 'global').catch(() => {});
  }
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;

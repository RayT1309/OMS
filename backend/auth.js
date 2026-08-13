require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sql = require('./db');

const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function getUserFromToken(token) {
  if (!token) return null;
  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data.user) return null;

  const rows = await sql`
    SELECT p.id, p.email, p.name, p.role, p.facility_id, p.scope, p.region, f.name AS facility_name
    FROM profiles p
    LEFT JOIN facilities f ON f.id = p.facility_id
    WHERE p.id = ${data.user.id}
  `;
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  req.user = user;
  next();
}

async function setUserFacility(userId, facilityId) {
  await sql`UPDATE profiles SET facility_id = ${facilityId} WHERE id = ${userId}`;
}

module.exports = { supabaseAnon, supabaseAdmin, getUserFromToken, requireAuth, setUserFacility };

require('dotenv').config();
const postgres = require('postgres');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (see backend/.env.example)');
}

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  // Supabase's transaction-mode pooler (Supavisor) doesn't support prepared
  // statements; this also happens to be the safe/right setting for the
  // direct connection, so leave it off unconditionally.
  prepare: false
});

module.exports = sql;

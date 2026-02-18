const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let dbAvailable = false;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://mortgage_user:mortgage_pass@localhost:5432/mortgage_tracker',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // For Render's managed Postgres (SSL required in production)
    ...(process.env.NODE_ENV === 'production' && {
      ssl: { rejectUnauthorized: false }
    })
  });

  // Test connectivity on startup
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connected successfully');
      dbAvailable = true;
    })
    .catch(err => {
      console.warn('⚠️  Database not available:', err.message);
      console.warn('⚠️  App will run but database features are disabled.');
      dbAvailable = false;
    });
} catch (err) {
  console.warn('⚠️  Failed to create database pool:', err.message);
  console.warn('⚠️  App will run but database features are disabled.');
}

function isDbAvailable() {
  return dbAvailable;
}

module.exports = pool;
module.exports.pool = pool;
module.exports.isDbAvailable = isDbAvailable;

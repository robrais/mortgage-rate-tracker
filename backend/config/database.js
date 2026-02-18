const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let dbAvailable = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mortgage_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test connectivity on startup
  pool.getConnection()
    .then(conn => {
      console.log('✅ Database connected successfully');
      dbAvailable = true;
      conn.release();
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

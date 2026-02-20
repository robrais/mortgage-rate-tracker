#!/usr/bin/env node
/**
 * Database Migration Script
 * 
 * Applies schema.sql to the remote PostgreSQL database.
 * 
 * Usage:
 *   node database/migrate.js                      # uses DATABASE_URL from .env
 *   DATABASE_URL=postgres://... node database/migrate.js   # explicit connection string
 *   node database/migrate.js --dry-run             # print SQL without executing
 */

const fs = require('fs');
const path = require('path');

// Resolve pg and dotenv from backend/node_modules since deps are installed there
const backendDir = path.join(__dirname, '..', 'backend');
const { Pool } = require(path.join(backendDir, 'node_modules', 'pg'));
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '../.env') });

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

async function migrate() {
  const dryRun = process.argv.includes('--dry-run');
  const connString = process.env.DATABASE_URL;

  if (!connString) {
    console.error('❌ DATABASE_URL is not set. Provide it via .env or environment variable.');
    process.exit(1);
  }

  // Mask credentials for logging
  const masked = connString.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log(`🔌 Target database: ${masked}`);

  // Read schema SQL
  let sql;
  try {
    sql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
  } catch (err) {
    console.error(`❌ Could not read schema file: ${SCHEMA_FILE}`);
    console.error(err.message);
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n--- DRY RUN (SQL to be executed) ---\n');
    console.log(sql);
    console.log('\n--- END DRY RUN ---');
    process.exit(0);
  }

  // Determine if SSL is needed (Render external URLs require it)
  const isRemote = !connString.includes('localhost') && !connString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: connString,
    ...(isRemote && { ssl: { rejectUnauthorized: false } }),
    connectionTimeoutMillis: 15000,
  });

  try {
    // Verify connectivity
    const { rows } = await pool.query('SELECT current_database(), current_user, version()');
    const info = rows[0];
    console.log(`✅ Connected to "${info.current_database}" as "${info.current_user}"`);
    console.log(`   PostgreSQL ${info.version.split(',')[0]}`);

    // Run schema inside a transaction so it's all-or-nothing
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('\n🚀 Applying schema...');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Schema applied successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed — rolled back.');
      console.error(err.message);
      process.exit(1);
    } finally {
      client.release();
    }

    // Quick verification: list tables
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('\n📋 Tables in public schema:');
    tables.rows.forEach(r => console.log(`   - ${r.tablename}`));

  } catch (err) {
    console.error('❌ Could not connect to database.');
    console.error(err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

#!/usr/bin/env node
/**
 * Database Truncate Script
 * 
 * Truncates (clears data from) selected tables in the remote PostgreSQL database.
 * Keeps the table schema intact.
 * 
 * Usage:
 *   node database/drop.js                          # interactive — select tables to truncate
 *   node database/drop.js --all                    # truncate all tables
 *   node database/drop.js --tables users,mortgage_rates  # truncate specific tables
 *   node database/drop.js --all --force            # truncate all, skip confirmation
 */

const path = require('path');
const readline = require('readline');
const backendDir = path.join(__dirname, '..', 'backend');
const { Pool } = require(path.join(backendDir, 'node_modules', 'pg'));
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(__dirname, '../.env') });

const ALL_TABLES = ['email_notifications', 'user_alerts', 'mortgage_rates', 'users'];

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

async function selectTables() {
  console.log('\nAvailable tables:');
  ALL_TABLES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  console.log(`  A. All tables`);

  const answer = await prompt('\nEnter table numbers (comma-separated) or "A" for all: ');

  if (answer.toLowerCase() === 'a') return [...ALL_TABLES];

  const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
  const selected = indices
    .filter(i => i >= 0 && i < ALL_TABLES.length)
    .map(i => ALL_TABLES[i]);

  if (selected.length === 0) {
    console.error('❌ No valid tables selected.');
    process.exit(1);
  }

  return selected;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const all = args.includes('--all');
  const tablesFlag = args.find((_, i) => args[i - 1] === '--tables');

  if (tablesFlag) {
    const names = tablesFlag.split(',').map(s => s.trim());
    const valid = names.filter(n => ALL_TABLES.includes(n));
    const invalid = names.filter(n => !ALL_TABLES.includes(n));
    if (invalid.length) console.warn(`⚠️  Unknown tables ignored: ${invalid.join(', ')}`);
    if (valid.length === 0) {
      console.error(`❌ No valid tables. Choose from: ${ALL_TABLES.join(', ')}`);
      process.exit(1);
    }
    return { tables: valid, force };
  }

  if (all) return { tables: [...ALL_TABLES], force };

  return { tables: null, force }; // null = interactive
}

async function truncate() {
  const { tables: argTables, force } = parseArgs();
  const connString = process.env.DATABASE_URL;

  if (!connString) {
    console.error('❌ DATABASE_URL is not set. Provide it via .env or environment variable.');
    process.exit(1);
  }

  const masked = connString.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log(`🔌 Target database: ${masked}`);

  const tables = argTables || await selectTables();

  console.log('\n⚠️  This will permanently delete all data from:');
  tables.forEach(t => console.log(`   - ${t}`));

  if (!force) {
    const answer = await prompt('\n❓ Are you sure? Type "yes" to confirm: ');
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Aborted — no changes made.');
      process.exit(0);
    }
  }

  const isRemote = !connString.includes('localhost') && !connString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: connString,
    ...(isRemote && { ssl: { rejectUnauthorized: false } }),
    connectionTimeoutMillis: 15000,
  });

  try {
    const { rows } = await pool.query('SELECT current_database(), current_user');
    console.log(`\n✅ Connected to "${rows[0].current_database}" as "${rows[0].current_user}"`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tableList = tables.join(', ');
      console.log(`\n🗑️  Truncating: ${tableList}...`);
      await client.query(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`);
      await client.query('COMMIT');
      console.log('✅ Tables truncated successfully (schema preserved).');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Truncate failed — rolled back.');
      console.error(err.message);
      process.exit(1);
    } finally {
      client.release();
    }

    // Show row counts to confirm
    console.log('\n📋 Row counts after truncate:');
    for (const t of ALL_TABLES) {
      const { rows } = await pool.query(`SELECT COUNT(*) FROM ${t}`);
      const marker = tables.includes(t) ? '✅' : '  ';
      console.log(`   ${marker} ${t}: ${rows[0].count} rows`);
    }

  } catch (err) {
    console.error('❌ Could not connect to database.');
    console.error(err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

truncate();
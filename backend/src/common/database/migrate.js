const fs = require('fs');
const path = require('path');
const pool = require('./pool');
const logger = require('../config/logger');

async function withRetry(fn, retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      logger.warn({ err, attempt: i + 1, retries }, `Database connection failed, retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 1.5;
    }
  }
}

async function runMigrations() {
  const client = await withRetry(() => pool.connect());
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    const migrationsDir = path.join(__dirname, 'migrations');
    const seedsDir = path.join(__dirname, 'seeds');
    const files = [
      ...fs.readdirSync(migrationsDir).sort().map((f) => ({ file: path.join(migrationsDir, f), name: f })),
      ...fs.readdirSync(seedsDir).sort().map((f) => ({ file: path.join(seedsDir, f), name: f })),
    ];
    for (const { file, name } of files) {
      const { rows } = await client.query('SELECT id FROM migrations WHERE name = $1', [name]);
      if (rows.length > 0) {
        logger.info(`Migration ${name} already executed, skipping`);
        continue;
      }
      const sql = fs.readFileSync(file, 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
      logger.info(`Migration ${name} executed successfully`);
    }
  } finally {
    client.release();
  }
}

module.exports = runMigrations;

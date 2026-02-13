'use strict';

const mysql  = require('mysql2/promise');
const logger = require('./logger');

/** Singleton connection pool — created once, shared across all modules. */
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT      || '3306', 10),
      user:               process.env.DB_USER     || 'dashboard_user',
      password:           process.env.DB_PASSWORD || '',
      database:           process.env.DB_NAME     || 'team_agneto_db',
      waitForConnections: true,
      connectionLimit:  parseInt(process.env.DB_POOL_LIMIT || '10', 10),
      queueLimit:         0,
      charset:            'utf8mb4',
      timezone:           '+00:00', // Store UTC in DB; convert at app layer
    });

    logger.info('MySQL connection pool created');
  }
  return pool;
}

/**
 * Convenience wrapper using prepared statements (prevents SQL injection).
 * Usage:
 *   const [rows] = await query('SELECT * FROM events WHERE id = ?', [id]);
 */
async function query(sql, params = []) {
  return getPool().execute(sql, params);
}

/**
 * Called at startup to verify DB connectivity before accepting HTTP traffic.
 * Throws on failure so the server exits cleanly instead of serving broken responses.
 */
async function testConnection() {
  const conn = await getPool().getConnection();
  await conn.ping();
  conn.release();
  logger.info('Database connection verified');
}

module.exports = { getPool, query, testConnection };

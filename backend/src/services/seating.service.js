'use strict';

const { query }    = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Returns the stored seed, or a date-based default if no row exists yet.
 */
async function getSeed() {
  const [rows] = await query('SELECT seed FROM seating_config WHERE id = 1', []);

  if (rows.length) {
    return rows[0].seed;
  }

  // No seed stored yet — return a deterministic date-based default
  return getDateSeed();
}

/**
 * Validates the password and upserts the seed.
 * @param {number} seed
 * @param {string} password
 */
async function updateSeed(seed, password) {
  const expected = process.env.SHUFFLE_PASSWORD;
  if (!expected || password !== expected) {
    throw new AppError('Invalid shuffle password', 403);
  }

  await query(
    `INSERT INTO seating_config (id, seed) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE seed = VALUES(seed)`,
    [seed],
  );

  return { seed };
}

/**
 * Same date-hash algorithm the frontend used to use as its default.
 */
function getDateSeed() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

module.exports = { getSeed, updateSeed };

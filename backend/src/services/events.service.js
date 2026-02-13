'use strict';

const { query }    = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * List events with optional filters.
 * @param {object} filters - { type: 'holiday'|'birthday'|'event', upcoming: 'true' }
 */
async function list({ type, upcoming } = {}) {
  let sql    = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (type) {
    sql += ' AND event_type = ?';
    params.push(type);
  }
  if (upcoming === 'true' || upcoming === true) {
    sql += ' AND event_date >= CURDATE()';
  }

  sql += ' ORDER BY event_date ASC';
  const [rows] = await query(sql, params);
  return rows;
}

async function getOne(id) {
  const [rows] = await query('SELECT * FROM events WHERE id = ?', [id]);
  if (!rows.length) throw new AppError(`Event ${id} not found`, 404);
  return rows[0];
}

async function create(data) {
  const {
    title,
    description  = null,
    event_type   = 'event',
    event_date,
    end_date     = null,
    all_day      = true,
    start_time   = null,
    end_time     = null,
    is_recurring = false,
    recur_rule   = null,
  } = data;

  const [result] = await query(
    `INSERT INTO events
       (title, description, event_type, event_date, end_date,
        all_day, start_time, end_time, is_recurring, recur_rule)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      title, description, event_type, event_date, end_date,
      all_day ? 1 : 0, start_time, end_time, is_recurring ? 1 : 0, recur_rule,
    ],
  );

  return getOne(result.insertId);
}

async function update(id, data) {
  await getOne(id); // throws 404 if not found

  const ALLOWED = [
    'title', 'description', 'event_type', 'event_date', 'end_date',
    'all_day', 'start_time', 'end_time', 'is_recurring', 'recur_rule',
  ];

  const fields = [];
  const params = [];

  for (const key of ALLOWED) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (!fields.length) throw new AppError('No valid fields provided to update', 400);

  params.push(id);
  await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
  return getOne(id);
}

async function remove(id) {
  await getOne(id); // throws 404 if not found
  await query('DELETE FROM events WHERE id = ?', [id]);
  return { deleted: true, id };
}

module.exports = { list, getOne, create, update, remove };

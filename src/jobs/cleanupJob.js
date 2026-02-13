'use strict';

const cron   = require('node-cron');
const logger = require('../config/logger');
const { query } = require('../config/database');

async function runCleanup() {
  const weatherDays = parseInt(process.env.WEATHER_RETAIN_DAYS     || '7',  10);
  const statsDays   = parseInt(process.env.SYSTEM_STATS_RETAIN_DAYS || '3',  10);
  const apiLogDays  = parseInt(process.env.API_LOG_RETAIN_DAYS      || '30', 10);

  try {
    const [r1] = await query(
      'DELETE FROM weather_data WHERE fetched_at < NOW() - INTERVAL ? DAY',
      [weatherDays],
    );
    const [r2] = await query(
      'DELETE FROM system_stats WHERE captured_at < NOW() - INTERVAL ? DAY',
      [statsDays],
    );
    const [r3] = await query(
      'DELETE FROM api_call_log WHERE called_at < NOW() - INTERVAL ? DAY',
      [apiLogDays],
    );
    const [r4] = await query(
      'DELETE FROM notifications_log WHERE fired_at < NOW() - INTERVAL 30 DAY',
      [],
    );

    logger.info('Cleanup job completed:', {
      weather_deleted:           r1.affectedRows,
      stats_deleted:             r2.affectedRows,
      api_log_deleted:           r3.affectedRows,
      notifications_log_deleted: r4.affectedRows,
    });
  } catch (err) {
    logger.error('Cleanup job failed:', err.message);
  }
}

/** Runs daily at 2:00 AM CST. */
module.exports = function scheduleCleanupJob() {
  cron.schedule('0 2 * * *', runCleanup, { timezone: 'America/Chicago' });
  logger.info('Cleanup cron job scheduled: daily at 2:00 AM CST');
};

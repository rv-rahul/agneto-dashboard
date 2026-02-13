'use strict';

const cron         = require('node-cron');
const logger       = require('../config/logger');
const statsService = require('../services/systemStats.service');

/** Captures system resource stats every 5 minutes. */
module.exports = function scheduleSystemStatsJob() {
  cron.schedule('*/5 * * * *', async () => {
    logger.debug('Running system stats capture job');
    try {
      const stats = await statsService.capture();
      logger.debug(
        `Stats captured — CPU: ${stats.cpu_percent}%, ` +
        `RAM: ${stats.ram_percent}%, ` +
        `Temp: ${stats.cpu_temp_c ?? 'N/A'}°C`
      );
    } catch (err) {
      logger.error('System stats job failed:', err.message);
    }
  });

  logger.info('System stats cron job scheduled: every 5 minutes');
};

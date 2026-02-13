'use strict';

const cron           = require('node-cron');
const logger         = require('../config/logger');
const weatherService = require('../services/weather.service');

/** Fetches weather immediately on startup, then every 30 minutes. */
module.exports = function scheduleWeatherJob() {
  // Initial fetch at startup
  weatherService.fetchAndStore()
    .then(() => logger.info('Initial weather fetch completed'))
    .catch(err => logger.error('Initial weather fetch failed:', err.message));

  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.debug('Running weather fetch job');
    try {
      await weatherService.fetchAndStore();
      logger.info('Weather job: data stored');
    } catch (err) {
      logger.error('Weather job failed:', err.message);
    }
  });

  logger.info('Weather cron job scheduled: every 30 minutes');
};

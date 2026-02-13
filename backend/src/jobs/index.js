'use strict';

const logger = require('../config/logger');

const scheduleWeatherJob     = require('./weatherJob');
const scheduleSystemStatsJob = require('./systemStatsJob');
const scheduleCleanupJob     = require('./cleanupJob');

module.exports = function startCronJobs() {
  logger.info('Starting background cron jobs...');
  scheduleWeatherJob();
  scheduleSystemStatsJob();
  scheduleCleanupJob();
  logger.info('All cron jobs registered');
};

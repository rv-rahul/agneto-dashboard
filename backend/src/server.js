'use strict';

const app               = require('./app');
const { testConnection } = require('./config/database');
const logger            = require('./config/logger');
const startCronJobs     = require('./jobs/index');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function bootstrap() {
  try {
    // 1. Verify database connectivity before accepting traffic
    await testConnection();

    // 2. Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Team Agneto Dashboard API running → http://localhost:${PORT}`);
      logger.info(`Swagger docs         → http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('Health check: GET /health');
    });

    // 3. Start background cron jobs (weather fetch, system stats, cleanup)
    startCronJobs();

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down gracefully');
  process.exit(0);
});

bootstrap();

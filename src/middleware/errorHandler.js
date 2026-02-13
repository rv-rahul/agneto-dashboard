'use strict';

const logger = require('../config/logger');

/**
 * AppError — operational errors that propagate cleanly through the app.
 * Usage in any service/controller:
 *   const { AppError } = require('../middleware/errorHandler');
 *   throw new AppError('Event not found', 404);
 */
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error-handling middleware.
 * Must be registered LAST in app.js (after all routes).
 * The 4-parameter signature is required by Express.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    // Expected application errors (404, 400, 422, etc.)
    logger.warn(`[${err.status}] ${req.method} ${req.originalUrl} — ${err.message}`);
    return res.status(err.status).json({
      success: false,
      error:   err.message,
    });
  }

  // Unexpected / programmer errors
  logger.error(err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

module.exports = errorHandler;
module.exports.AppError = AppError;

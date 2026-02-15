/**
 * @module utils/AppError
 * @description Custom error class for operational errors with HTTP status codes.
 * Throw this in controllers/services to send a specific status code and message
 * to the global error handler.
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 422)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

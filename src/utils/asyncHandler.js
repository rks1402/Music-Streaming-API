/**
 * @module utils/asyncHandler
 * @description Wraps async route handlers to automatically catch errors
 * and forward them to Express's global error handler via next().
 * Eliminates the need for try/catch in every controller function.
 */

/**
 * @param {Function} fn - Async Express route handler (req, res, next) => Promise
 * @returns {Function} Wrapped handler that catches rejected promises
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

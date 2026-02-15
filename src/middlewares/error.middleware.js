/**
 * @module middlewares/error
 * @description Global error handling middleware. Catches all errors forwarded
 * via next(err) or thrown inside asyncHandler-wrapped controllers.
 * Returns a consistent JSON error response.
 */

/**
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {import('express').Response} JSON error response
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  // Log the full error in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR] ${statusCode} - ${err.message}`);
    if (!err.isOperational) {
      console.error(err.stack);
    }
  }

  return res.status(statusCode).json({ message });
};

module.exports = errorHandler;

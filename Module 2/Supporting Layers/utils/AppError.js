/**
 * AppError — SOLUTION: single shared home for the operational error class.
 * Previously duplicated in services/articlesService.js and middleware/errorHandler.js.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = AppError;

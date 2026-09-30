const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Terminal 404 handler. Registered after every router so any request that
 * matched no route gets a JSON body instead of Express' default HTML page.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Central error handler.
 *
 * Errors thrown by asyncHandler carry a `status` (see utils/ids.js); anything
 * else is treated as a 500. The stack is returned only outside production so
 * it never leaks in deployed responses.
 */
// eslint-disable-next-line no-unused-vars -- Express detects error handlers by arity
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  if (status >= 500) {
    console.error("[api] unhandled error:", err);
  }

  res.status(status).json({
    message: status >= 500 ? "internal server error" : err.message,
    ...(process.env.NODE_ENV === "production" ? {} : { detail: err.message }),
  });
};

module.exports = { notFoundHandler, errorHandler, asyncHandler };

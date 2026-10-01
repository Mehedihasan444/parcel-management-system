const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Terminal 404 handler. Registered after every router so any request that
 * matched no route gets a JSON body instead of Express' default HTML page.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
};

/**
 * Central error handler.
 *
 * Errors thrown by asyncHandler carry a `status`; anything else is a 500.
 * CORS rejections and Stripe errors are normalised to JSON so the client
 * never sees an HTML stack trace.
 */
// eslint-disable-next-line no-unused-vars -- Express detects error handlers by arity
const errorHandler = (err, req, res, next) => {
  const isCorsError = err?.message?.includes("not allowed by CORS");
  const status = isCorsError ? 403 : err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error("[api] unhandled error:", err);
  }

  res.status(status).json({
    message:
      status >= 500 && process.env.NODE_ENV === "production"
        ? "internal server error"
        : err.message,
    code: err.code || (status === 404 ? "NOT_FOUND" : status >= 500 ? "INTERNAL" : "REQUEST_ERROR"),
    ...(process.env.NODE_ENV === "production" ? {} : { detail: err.message }),
  });
};

module.exports = { notFoundHandler, errorHandler, asyncHandler };

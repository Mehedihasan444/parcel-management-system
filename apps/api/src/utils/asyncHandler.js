/**
 * Wraps an async route handler so a rejected promise is forwarded to the
 * Express error handler instead of hanging the request.
 *
 * Express 4 does not await handlers, so without this an unhandled rejection
 * inside a database call would leave the client waiting forever.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

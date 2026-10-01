const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Zod-backed request validation.
 *
 * Usage: router.post("/", validate(schema), handler)
 * where schema = { body, query, params } each a zod object.
 * On failure responds 400 with a stable { message, errors[] } shape.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      return next();
    } catch (err) {
      const errors = err?.issues?.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })) ?? [{ path: "", message: "Invalid request" }];
      return res.status(400).json({ message: "Validation failed", errors });
    }
  };
}

module.exports = { validate, asyncHandler };

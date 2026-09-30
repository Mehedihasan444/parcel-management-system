const { ObjectId } = require("mongodb");

/**
 * Converts a route parameter into an ObjectId, rejecting malformed values
 * with a 400 instead of letting MongoDB throw a BSONError.
 */
function toObjectId(value) {
  if (!ObjectId.isValid(value)) {
    const error = new Error(`"${value}" is not a valid id`);
    error.status = 400;
    throw error;
  }
  return new ObjectId(value);
}

/**
 * Wraps an ObjectId, falling back to null when the value is absent or
 * malformed. The original server used these values only inside queries, so a
 * bad id simply matched nothing rather than erroring.
 */
function toObjectIdOrNull(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

module.exports = { toObjectId, toObjectIdOrNull };

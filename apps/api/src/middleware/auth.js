const jwt = require("jsonwebtoken");
const { loadConfig } = require("../config/env");
const { collections } = require("../config/db");
const { asyncHandler } = require("../utils/asyncHandler");
const { unauthorized, forbidden } = require("../utils/responses");

/**
 * Authentication and role checks.
 *
 * Behaviour is intentionally identical to the original inline middleware:
 * the decoded JWT payload is attached as `req.decoded`, and both guards
 * answer with the same status codes and message bodies.
 */

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return unauthorized(res);
  }

  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, loadConfig().accessTokenSecret, (err, decoded) => {
    if (err) {
      return unauthorized(res);
    }
    req.decoded = decoded;
    next();
  });
}

/** Requires the authenticated user to have the "admin" role. */
const verifyAdmin = asyncHandler(async (req, res, next) => {
  const { users } = collections();
  const user = await users.findOne({ email: req.decoded.email });
  if (user?.role !== "admin") {
    return forbidden(res);
  }
  next();
});

/** Requires the authenticated user to have the "deliveryMen" role. */
const verifyDeliveryMan = asyncHandler(async (req, res, next) => {
  const { users } = collections();
  const user = await users.findOne({ email: req.decoded.email });
  if (user?.role !== "deliveryMen") {
    return forbidden(res);
  }
  next();
});

/** Rejects the request unless the JWT subject matches the requested email. */
function verifyTokenSelf(req, res, next) {
  if (req.params.email !== req.decoded.email) {
    return forbidden(res);
  }
  next();
}

module.exports = { verifyToken, verifyAdmin, verifyDeliveryMan, verifyTokenSelf };

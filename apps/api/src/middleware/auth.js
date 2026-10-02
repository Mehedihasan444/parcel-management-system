const jwt = require("jsonwebtoken");
const { loadConfig } = require("../config/env");
const { collections } = require("../config/db");
const { asyncHandler } = require("../utils/asyncHandler");
const { toObjectId } = require("../utils/ids");
const { unauthorized, forbidden, notFound } = require("../utils/responses");

/**
 * Authentication and authorization.
 *
 * verifyToken authenticates (401). Everything below it authorizes (403/404)
 * and must run after verifyToken so req.decoded is populated. Guards never
 * trust client-supplied identity: ownership is always re-checked against the
 * database, because the React client's role screens are cosmetic.
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

/** The user document for the JWT subject (null when it names nobody). */
async function callerUser(email) {
  const { users } = collections();
  return users.findOne({ email });
}

const isAdminUser = (user) => user?.role === "admin";

/** Requires the authenticated user to have the "admin" role. */
const verifyAdmin = asyncHandler(async (req, res, next) => {
  const user = await callerUser(req.decoded.email);
  if (!isAdminUser(user)) {
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

/** The JWT subject itself, or an admin acting on someone else. */
const verifySelfOrAdmin = asyncHandler(async (req, res, next) => {
  if (req.params.email === req.decoded.email) {
    return next();
  }
  const user = await callerUser(req.decoded.email);
  if (!isAdminUser(user)) {
    return forbidden(res);
  }
  next();
});

/** Write bodies that name an owner (bookings, payments) must name the caller. */
function verifyBodyEmailSelf(req, res, next) {
  if (req.body?.email !== req.decoded.email) {
    return forbidden(res);
  }
  next();
}

/** A booking :id the caller owns, or any booking for an admin. */
const verifyBookingOwnerOrAdmin = asyncHandler(async (req, res, next) => {
  const { bookings } = collections();
  const booking = await bookings.findOne({ _id: toObjectId(req.params.id) });
  if (!booking) {
    return notFound(res, "booking not found");
  }
  if (booking.email === req.decoded.email) {
    return next();
  }
  const user = await callerUser(req.decoded.email);
  if (!isAdminUser(user)) {
    return forbidden(res);
  }
  next();
});

/**
 * A delivery-man user :id that is the caller, or any id for an admin.
 * Covers delivery lists, delivered counts, reviews and rating/counter writes,
 * which all key off the delivery man's user document id.
 */
const verifyDeliveryUserIdOrAdmin = asyncHandler(async (req, res, next) => {
  const user = await callerUser(req.decoded.email);
  if (isAdminUser(user)) {
    return next();
  }
  if (user && String(user._id) === req.params.id) {
    return next();
  }
  return forbidden(res);
});

/**
 * A booking :id assigned to the calling rider, or any booking for an admin.
 * Unassigned parcels can only transition through an admin.
 */
const verifyAssigneeOrAdmin = asyncHandler(async (req, res, next) => {
  const { bookings } = collections();
  const booking = await bookings.findOne({ _id: toObjectId(req.params.id) });
  if (!booking) {
    return notFound(res, "booking not found");
  }
  const user = await callerUser(req.decoded.email);
  if (isAdminUser(user)) {
    return next();
  }
  if (user?.role === "deliveryMen" && String(user._id) === String(booking.deliveryMenID || "")) {
    return next();
  }
  return forbidden(res);
});

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyDeliveryMan,
  verifyTokenSelf,
  verifySelfOrAdmin,
  verifyBodyEmailSelf,
  verifyBookingOwnerOrAdmin,
  verifyDeliveryUserIdOrAdmin,
  verifyAssigneeOrAdmin,
};

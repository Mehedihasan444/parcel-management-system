const express = require("express");
const {
  createBooking,
  listAllBookings,
  listBookingsByUser,
  getBookingById,
  assignDeliveryMan,
  deleteBooking,
  updateBooking,
} = require("./booking.service");
const {
  verifyToken,
  verifyAdmin,
  verifySelfOrAdmin,
  verifyBodyEmailSelf,
  verifyBookingOwnerOrAdmin,
} = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const {
  bookingBody,
  bookingUpdateBody,
  assignBody,
  emailParam,
  objectIdParam,
} = require("../../middleware/schemas");

const router = express.Router();

/*
 * These paths hang off /api/v1/users, so this router is mounted there.
 * The deeper "assign" path is declared before "/:id" style siblings; Express
 * matches in order, and the literal segments must win over the parameters.
 * Auth runs before validation (401 before 400); ownership runs last, on
 * validated ids, so guards never throw on malformed input.
 */
router.get("/admin/bookings", verifyToken, verifyAdmin, listAllBookings);
router.post(
  "/bookings",
  verifyToken,
  validate({ body: bookingBody }),
  verifyBodyEmailSelf,
  createBooking
);
router.get(
  "/bookings/:email",
  verifyToken,
  validate({ params: emailParam }),
  verifySelfOrAdmin,
  listBookingsByUser
);
router.get(
  "/booking/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyBookingOwnerOrAdmin,
  getBookingById
);
router.patch(
  "/bookings/assign/deliveryMen/:id",
  verifyToken,
  validate({ params: objectIdParam, body: assignBody }),
  verifyAdmin,
  assignDeliveryMan
);
router.delete(
  "/bookings/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyBookingOwnerOrAdmin,
  deleteBooking
);
router.patch(
  "/updateBooking/:id",
  verifyToken,
  validate({ params: objectIdParam, body: bookingUpdateBody }),
  verifyBookingOwnerOrAdmin,
  updateBooking
);

module.exports = router;

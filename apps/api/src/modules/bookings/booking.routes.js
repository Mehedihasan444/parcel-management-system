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
const { verifyToken } = require("../../middleware/auth");
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
 * Auth runs before validation so unauthenticated callers still get 401.
 */
router.get("/admin/bookings", listAllBookings);
router.post("/bookings", verifyToken, validate({ body: bookingBody }), createBooking);
router.get("/bookings/:email", verifyToken, validate({ params: emailParam }), listBookingsByUser);
router.get("/booking/:id", verifyToken, validate({ params: objectIdParam }), getBookingById);
router.patch(
  "/bookings/assign/deliveryMen/:id",
  verifyToken,
  validate({ params: objectIdParam, body: assignBody }),
  assignDeliveryMan
);
router.delete("/bookings/:id", verifyToken, validate({ params: objectIdParam }), deleteBooking);
router.patch(
  "/updateBooking/:id",
  verifyToken,
  validate({ params: objectIdParam, body: bookingUpdateBody }),
  updateBooking
);

module.exports = router;

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

const router = express.Router();

/*
 * These paths hang off /api/v1/users, so this router is mounted there.
 * The deeper "assign" path is declared before "/:id" style siblings; Express
 * matches in order, and the literal segments must win over the parameters.
 */
router.get("/admin/bookings", listAllBookings);
router.post("/bookings", verifyToken, createBooking);
router.get("/bookings/:email", verifyToken, listBookingsByUser);
router.get("/booking/:id", verifyToken, getBookingById);
router.patch(
  "/bookings/assign/deliveryMen/:id",
  verifyToken,
  assignDeliveryMan
);
router.delete("/bookings/:id", verifyToken, deleteBooking);
router.patch("/updateBooking/:id", verifyToken, updateBooking);

module.exports = router;

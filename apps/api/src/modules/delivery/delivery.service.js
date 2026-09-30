const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");

/**
 * Delivery-man facing operations: role checks, the personal delivery list,
 * progress counters, and the per-delivery review statistics.
 */

/** Reports whether the given email belongs to a delivery man. */
const isDeliveryMan = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.findOne({
    email: req.params.email,
    role: "deliveryMen",
  });

  res.send({ deliveryMen: Boolean(result) });
});

/** Every user with the deliveryMen role. */
const listAllDeliveryMen = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.find({ role: "deliveryMen" }).toArray();
  res.send(result);
});

/** The parcels currently assigned to one delivery man. */
const listDeliveryList = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings
    .find({ deliveryMenID: req.params.id, status: "On The Way" })
    .toArray();
  res.send(result);
});

/** How many parcels this delivery man has already delivered. */
const countDelivered = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings
    .find({ deliveryMenID: req.params.id, status: "delivered" })
    .toArray();
  res.send(result);
});

/** Updates a booking's status from the delivery list screen. */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings.updateOne(
    { _id: toObjectId(req.params.id) },
    { $set: { status: req.body.status } }
  );
  res.send(result);
});

/** All reviews left against one delivery man. */
const listReviewsForDeliveryMan = asyncHandler(async (req, res) => {
  const { reviews } = collections();
  const result = await reviews
    .find({ deliveryMenID: req.params.id })
    .toArray();
  res.send(result);
});

/** Stores the recomputed average rating on the delivery man's user document. */
const updateAverageRating = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.updateOne(
    { _id: toObjectId(req.params.id), role: "deliveryMen" },
    { $set: { avgRating: req.body.rating } }
  );
  res.send(result);
});

/** Increments the delivered-parcel counter on the delivery man's document. */
const updateParcelDelivered = asyncHandler(async (req, res) => {
  const { users } = collections();
  const result = await users.updateOne(
    { _id: toObjectId(req.params.id), role: "deliveryMen" },
    { $set: { parcelDelivered: req.body.parcelDelivered } }
  );
  res.send(result);
});

module.exports = {
  isDeliveryMan,
  listAllDeliveryMen,
  listDeliveryList,
  countDelivered,
  updateBookingStatus,
  listReviewsForDeliveryMan,
  updateAverageRating,
  updateParcelDelivered,
};

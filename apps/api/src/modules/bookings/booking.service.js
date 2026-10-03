const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");

/**
 * Parcel bookings: creation, admin listing, per-user lookup, assignment to a
 * delivery man, cancellation and in-place editing.
 */

const UPDATABLE_FIELDS = [
  "phone",
  "parcelType",
  "receiverName",
  "weight",
  "receiverPhone",
  "deliveryAddressLatitude",
  "deliveryAddressLongitude",
  "requestedDeliveryDate",
  "bookingDate",
  "price",
];

/** Creates a booking. */
const createBooking = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings.insertOne(req.body);
  res.send(result);
});

/** Every booking, unpaginated. Feeds the admin dashboard charts. */
const listAllBookings = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings.find().toArray();
  res.send(result);
});

/** A user's own bookings, optionally filtered by status. */
const listBookingsByUser = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const query = { email: req.params.email };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const result = await bookings.find(query).toArray();
  res.send(result);
});

/** A single booking by id. */
const getBookingById = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings.findOne({ _id: toObjectId(req.params.id) });
  res.send(result);
});

/** Assigns a delivery man and moves the parcel to "On The Way". */
const assignDeliveryMan = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const data = req.body;

  // Generate 6-digit OTP for proof of delivery
  const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

  const result = await bookings.updateOne(
    { _id: toObjectId(req.params.id) },
    {
      $set: {
        status: "On The Way",
        deliveryMenID: data.selectedDeliveryMen,
        approximateDeliveryDate: data.approximateDeliveryDate,
        deliveryOtp,
      },
    }
  );
  res.send({ ...result, deliveryOtp });
});

/** Cancels a booking. */
const deleteBooking = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const result = await bookings.deleteOne({ _id: toObjectId(req.params.id) });
  res.send(result);
});

/** Edits the mutable fields of an existing booking. */
const updateBooking = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const data = req.body;

  const $set = {};
  for (const field of UPDATABLE_FIELDS) {
    $set[field] = data?.[field];
  }

  const result = await bookings.updateOne({ _id: toObjectId(req.params.id) }, { $set });
  res.send(result);
});

/** Bulk assign delivery men to multiple parcels. */
const bulkAssignDeliveryMen = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { ids, selectedDeliveryMen, approximateDeliveryDate } = req.body;

  const objectIds = ids.map((id) => toObjectId(id));

  const bulkOps = objectIds.map((id) => ({
    updateOne: {
      filter: { _id: id },
      update: {
        $set: {
          status: "On The Way",
          deliveryMenID: selectedDeliveryMen,
          approximateDeliveryDate,
          deliveryOtp: Math.floor(100000 + Math.random() * 900000).toString(),
        },
      },
    },
  }));

  const result = await bookings.bulkWrite(bulkOps);
  res.send({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
});

/** Bulk update status for multiple parcels. */
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { ids, status } = req.body;

  const objectIds = ids.map((id) => toObjectId(id));
  const result = await bookings.updateMany({ _id: { $in: objectIds } }, { $set: { status } });
  res.send({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount });
});

/** Bulk delete multiple parcels. */
const bulkDeleteBookings = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { ids } = req.body;

  const objectIds = ids.map((id) => toObjectId(id));
  const result = await bookings.deleteMany({ _id: { $in: objectIds } });
  res.send({ deletedCount: result.deletedCount });
});

module.exports = {
  createBooking,
  listAllBookings,
  listBookingsByUser,
  getBookingById,
  assignDeliveryMan,
  deleteBooking,
  updateBooking,
  bulkAssignDeliveryMen,
  bulkUpdateStatus,
  bulkDeleteBookings,
  UPDATABLE_FIELDS,
};

const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");
const { getCloudinary } = require("../../config/cloudinary");

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
  const result = await reviews.find({ deliveryMenID: req.params.id }).toArray();
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

/** Retrieves the proof of delivery for a parcel. */
const getParcelProofOfDelivery = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const booking = await bookings.findOne(
    { _id: toObjectId(req.params.id) },
    { projection: { proofOfDelivery: 1, trackingId: 1 } }
  );
  if (!booking) {
    return res.status(404).json({ message: "Parcel not found" });
  }
  res.send(booking.proofOfDelivery || null);
});

/**
 * Submits proof of delivery: photo + signature + OTP.
 * Uploads files to Cloudinary, stores on booking document.
 */
const submitProofOfDelivery = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { otp, signature } = req.body;
  const bookingId = toObjectId(req.params.id);

  const booking = await bookings.findOne({ _id: bookingId });
  if (!booking) {
    return res.status(404).json({ message: "Parcel not found" });
  }
  if (booking.status === "delivered") {
    return res.status(400).json({ message: "Parcel already delivered" });
  }
  if (!otp || otp !== booking.deliveryOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "Photo required" });
  }

  // Upload photo to Cloudinary
  const cloudinary = getCloudinary();
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rapidparcelhub/pod",
        transformation: [
          { width: 1024, height: 1024, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  const proofOfDelivery = {
    photoUrl: uploadResult.secure_url,
    photoPublicId: uploadResult.public_id,
    signature: signature || null,
    otpVerified: true,
    deliveredAt: new Date(),
    deliveredBy: req.decoded.email,
  };

  const result = await bookings.updateOne(
    { _id: bookingId },
    {
      $set: {
        status: "delivered",
        proofOfDelivery,
        deliveredAt: new Date(),
      },
    }
  );

  // Increment the rider's delivered counter on their profile row; sessions
  // carry Better Auth's user id, so the profile is matched by email.
  const { users } = collections();
  await users.updateOne({ email: req.decoded.email }, { $inc: { parcelDelivered: 1 } });

  res.status(201).send({ proofOfDelivery, modifiedCount: result.modifiedCount });
});

/** Rows per page of the rider earnings list. */
const PAGE_SIZE = 10;

/**
 * The calling rider's *profile* row id — the app-user `_id` that bookings store
 * in `deliveryMenID`. A session carries Better Auth's own user id, which lives
 * in a different collection, so the profile is resolved by email instead.
 * Answers 404 and returns null when the caller has no profile row.
 */
async function callerRiderId(req, res) {
  const { users } = collections();
  const user = await users.findOne({ email: req.decoded.email });
  if (!user) {
    res.status(404).json({ message: "Rider profile not found" });
    return null;
  }
  return String(user._id);
}

/** `YYYY-MM-DD` for a Date or an ISO string; null when the value is absent. */
function dayOf(value) {
  if (!value) return null;
  const iso = value instanceof Date ? value.toISOString() : String(value);
  return iso.split("T")[0];
}

/**
 * Get rider earnings with pagination and date filtering.
 * Returns paginated earnings for the authenticated rider.
 */
const getRiderEarnings = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { startDate, endDate } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const riderId = await callerRiderId(req, res);
  if (!riderId) return;

  const query = {
    deliveryMenID: riderId,
    status: { $in: ["delivered", "cancelled"] },
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [earnings, total] = await Promise.all([
    bookings
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .project({
        _id: 1,
        trackingId: 1,
        status: 1,
        price: 1,
        distance: 1,
        duration: 1,
        createdAt: 1,
        deliveredAt: 1,
        bookingDate: 1,
      })
      .toArray(),
    bookings.countDocuments(query),
  ]);

  const formatted = earnings.map((e) => ({
    id: e._id,
    parcelId: e.trackingId,
    status: e.status,
    price: e.price,
    distance: e.distance,
    duration: e.duration,
    date: dayOf(e.deliveredAt) || dayOf(e.createdAt) || dayOf(e.bookingDate),
  }));

  res.send({
    earnings: formatted,
    totalDeliveries: total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    currentPage: page,
  });
});

/**
 * Get rider earnings statistics for the date range: completed, in-transit and
 * cancelled counts, what the completed runs earned, and the rider's average
 * review rating (reviews are not date-scoped).
 */
const getRiderEarningsStats = asyncHandler(async (req, res) => {
  const { bookings, reviews } = collections();
  const { startDate, endDate } = req.query;

  const riderId = await callerRiderId(req, res);
  if (!riderId) return;

  const range = { deliveryMenID: riderId };
  if (startDate || endDate) {
    range.createdAt = {};
    if (startDate) range.createdAt.$gte = new Date(startDate);
    if (endDate) range.createdAt.$lte = new Date(endDate);
  }

  const [totalDeliveries, pendingDeliveries, cancelledDeliveries, earned, rated] =
    await Promise.all([
      bookings.countDocuments({ ...range, status: "delivered" }),
      bookings.countDocuments({ ...range, status: "On The Way" }),
      bookings.countDocuments({ ...range, status: "cancelled" }),
      // Prices are stored as numbers or numeric strings; anything missing or
      // malformed contributes 0 rather than failing the aggregation.
      bookings
        .aggregate([
          { $match: { ...range, status: "delivered" } },
          {
            $group: {
              _id: null,
              total: {
                $sum: { $convert: { input: "$price", to: "double", onError: 0, onNull: 0 } },
              },
            },
          },
        ])
        .toArray(),
      reviews
        .aggregate([
          { $match: { deliveryMenID: riderId } },
          { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ])
        .toArray(),
    ]);

  res.send({
    totalDeliveries,
    pendingDeliveries,
    cancelledDeliveries,
    totalEarnings: earned[0]?.total ?? 0,
    avgRating: rated[0]?.avgRating ?? null,
  });
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
  getParcelProofOfDelivery,
  submitProofOfDelivery,
  getRiderEarnings,
  getRiderEarningsStats,
};

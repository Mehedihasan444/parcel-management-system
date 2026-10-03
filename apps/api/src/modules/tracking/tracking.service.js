const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");
const { notFound } = require("../../utils/responses");

/**
 * Public parcel tracking.
 *
 * Looks up a parcel by tracking ID (human-readable) or MongoDB _id.
 * Returns current status, timeline, and basic parcel info without
 * exposing sensitive customer data.
 */

const trackParcel = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { identifier } = req.params;

  let query = {};
  if (identifier.length === 24 && /^[a-fA-F0-9]{24}$/.test(identifier)) {
    query._id = toObjectId(identifier);
  } else {
    query.trackingId = identifier.toUpperCase();
  }

  const parcel = await bookings.findOne(query, {
    projection: {
      trackingId: 1,
      status: 1,
      parcelType: 1,
      weight: 1,
      requestedDeliveryDate: 1,
      approximateDeliveryDate: 1,
      senderName: 1,
      senderPhone: 1,
      receiverName: 1,
      receiverPhone: 1,
      pickupAddress: 1,
      deliveryAddress: 1,
      deliveryMenID: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  if (!parcel) {
    return notFound(res, "Parcel not found");
  }

  // Mask phone numbers in public view
  const publicParcel = {
    ...parcel,
    senderPhone: parcel.senderPhone?.replace(/\d(?=\d{4})/g, "*"),
    receiverPhone: parcel.receiverPhone?.replace(/\d(?=\d{4})/g, "*"),
  };

  res.send(publicParcel);
});

/**
 * Returns the event timeline for a parcel.
 * Each event: { type, status, location, description, timestamp, metadata }
 */
const getParcelEvents = asyncHandler(async (req, res) => {
  const { bookings, trackingEvents } = collections();
  const { identifier } = req.params;

  let query = {};
  if (identifier.length === 24 && /^[a-fA-F0-9]{24}$/.test(identifier)) {
    query._id = toObjectId(identifier);
  } else {
    query.trackingId = identifier.toUpperCase();
  }

  const parcel = await bookings.findOne(query, { projection: { _id: 1 } });
  if (!parcel) {
    return notFound(res, "Parcel not found");
  }

  const events = await trackingEvents
    .find({ parcelId: parcel._id })
    .sort({ timestamp: 1 })
    .toArray();

  // If no custom events, build from status history
  if (events.length === 0) {
    const built = buildEventsFromParcel(parcel);
    return res.send(built);
  }

  res.send(events);
});

function buildEventsFromParcel(parcel) {
  const events = [];
  const base = parcel.createdAt || new Date();

  events.push({
    type: "CREATED",
    status: "pending",
    description: "Parcel booked",
    timestamp: base,
    metadata: {},
  });

  if (parcel.deliveryMenID) {
    events.push({
      type: "ASSIGNED",
      status: "assigned",
      description: `Assigned to rider ${parcel.deliveryMenID}`,
      timestamp: parcel.assignedAt || base,
      metadata: { riderId: parcel.deliveryMenID },
    });
  }

  if (parcel.status === "On The Way" || parcel.status === "delivered") {
    events.push({
      type: "PICKED_UP",
      status: "On The Way",
      description: "Parcel picked up by rider",
      timestamp: parcel.pickedUpAt || base,
      metadata: {},
    });
  }

  if (parcel.status === "delivered") {
    events.push({
      type: "DELIVERED",
      status: "delivered",
      description: "Parcel delivered successfully",
      timestamp: parcel.deliveredAt || parcel.updatedAt || base,
      metadata: {
        proofOfDelivery: parcel.proofOfDelivery || null,
      },
    });
  }

  if (["cancelled", "returned"].includes(parcel.status)) {
    events.push({
      type: parcel.status.toUpperCase(),
      status: parcel.status,
      description: `Parcel ${parcel.status}`,
      timestamp: parcel.updatedAt || base,
      metadata: { reason: parcel.cancellationReason || null },
    });
  }

  return events;
}

module.exports = {
  trackParcel,
  getParcelEvents,
};

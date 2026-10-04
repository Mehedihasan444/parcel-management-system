const { z } = require("zod");

/**
 * Request schemas for every write endpoint.
 *
 * All body schemas use `.passthrough()` so unknown client fields survive
 * validation — the handlers persist extras (bookingDate, price, status…)
 * and stripping them would silently change write behaviour. Schemas only
 * guarantee the fields the server actually depends on.
 */

const emailParam = z.object({ email: z.string().email() });
const objectIdParam = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "must be a 24-char hex id"),
});

const bookingBody = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email(),
    phone: z.string().min(4),
    parcelType: z.string().min(1),
    weight: z.union([z.string().min(1), z.number().positive()]),
    receiverName: z.string().min(1).optional(),
    receiverPhone: z.string().min(4).optional(),
    requestedDeliveryDate: z.string().min(1).optional(),
  })
  .passthrough();

const bookingUpdateBody = z
  .object({
    phone: z.string().min(4).optional(),
    parcelType: z.string().min(1).optional(),
    receiverName: z.string().min(1).optional(),
    weight: z.union([z.string().min(1), z.number().positive()]).optional(),
    receiverPhone: z.string().min(4).optional(),
    requestedDeliveryDate: z.string().min(1).optional(),
    price: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const assignBody = z
  .object({
    selectedDeliveryMen: z.string().min(1),
    approximateDeliveryDate: z.string().min(1),
  })
  .passthrough();

const userBody = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    image: z.string().optional(),
    // No role: registration always creates plain users (see createUser).
  })
  .passthrough();

const roleBody = z.object({ role: z.enum(["user", "admin", "deliveryMen"]) }).passthrough();

const profileBody = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(4).optional(),
    image: z.string().optional(),
  })
  .passthrough();

const reviewBody = z
  .object({
    deliveryMenID: z.string().min(1),
    rating: z.coerce.number().min(0).max(5).optional(),
    feedback: z.string().optional(),
    name: z.string().optional(),
  })
  .passthrough();

const paymentIntentBody = z.object({ price: z.coerce.number().positive() }).passthrough();

const paymentBody = z
  .object({
    email: z.string().email(),
    price: z.coerce.number().positive(),
    transactionId: z.string().min(1),
    parcelId: z.string().optional(),
  })
  .passthrough();

const deliveryStatusBody = z.object({ status: z.string().min(1) }).passthrough();

const averageRatingBody = z.object({ rating: z.coerce.number().min(0).max(5) }).passthrough();

const parcelDeliveredBody = z
  .object({ parcelDelivered: z.coerce.number().int().min(0) })
  .passthrough();

/** Bulk operations on parcels (admin only) */
const bulkAssignBody = z
  .object({
    ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
    selectedDeliveryMen: z.string().min(1),
    approximateDeliveryDate: z.string().min(1),
  })
  .passthrough();

const bulkStatusBody = z
  .object({
    ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
    status: z.enum(["pending", "assigned", "On The Way", "delivered", "cancelled", "returned"]),
  })
  .passthrough();

const bulkDeleteBody = z
  .object({
    ids: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  })
  .passthrough();

module.exports = {
  emailParam,
  objectIdParam,
  bookingBody,
  bookingUpdateBody,
  assignBody,
  userBody,
  roleBody,
  profileBody,
  reviewBody,
  paymentIntentBody,
  paymentBody,

  deliveryStatusBody,
  averageRatingBody,
  parcelDeliveredBody,
  bulkAssignBody,
  bulkStatusBody,
  bulkDeleteBody,
};

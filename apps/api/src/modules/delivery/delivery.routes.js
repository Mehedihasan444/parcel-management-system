const express = require("express");
const {
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
} = require("./delivery.service");
const {
  verifyToken,
  verifyAdmin,
  verifyDeliveryMan,
  verifySelfOrAdmin,
  verifyDeliveryUserIdOrAdmin,
  verifyAssigneeOrAdmin,
} = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const {
  emailParam,
  objectIdParam,
  deliveryStatusBody,
  averageRatingBody,
  parcelDeliveredBody,
} = require("../../middleware/schemas");
const { uploadSingleImage } = require("../../middleware/upload");

const router = express.Router();

/*
 * Delivery-man-scoped endpoints.
 *
 * NOTE: several of these paths start with "/users", so this router is mounted
 * at the API root rather than at "/users". Declaration order is significant:
 * the literal "/deliveryMen/delivery/count/:id" is registered before
 * "/deliveryMen/:email" would otherwise be able to swallow the "delivery"
 * segment.
 *
 * The ":id" distinction matters for guards: the deliveryList/count/reviews
 * routes key off the delivery man's *user* document id, so they use
 * verifyDeliveryUserIdOrAdmin, while cancel/deliver and the proof-of-delivery
 * routes key off a *booking* id and use verifyAssigneeOrAdmin.
 *
 * The two rider-earnings paths are literals with no parameters, so they are
 * declared before "/deliveryMen/:email" (which would otherwise swallow
 * "earnings") and are gated by the rider role instead of a param guard.
 */
router.get("/deliveryMen/earnings", verifyToken, verifyDeliveryMan, getRiderEarnings);
router.get(
  "/deliveryMen/earnings/stats",
  verifyToken,
  verifyDeliveryMan,
  getRiderEarningsStats
);
router.get(
  "/deliveryMen/:email",
  verifyToken,
  validate({ params: emailParam }),
  verifySelfOrAdmin,
  isDeliveryMan
);
router.get("/users/admin/deliveryMens", verifyToken, verifyAdmin, listAllDeliveryMen);
router.get(
  "/users/deliveryMen/deliveryList/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyDeliveryUserIdOrAdmin,
  listDeliveryList
);
router.get(
  "/deliveryMen/delivery/count/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyDeliveryUserIdOrAdmin,
  countDelivered
);
/*
 * Only "cancel/deliver" exists in the original API. A sibling
 * "deliveryList/updateStatus/:id" route was removed from the original before
 * this merge and the web client never called it, so it is deliberately not
 * reintroduced here.
 */
router.patch(
  "/deliveryMen/deliveryList/cancel/deliver/:id",
  verifyToken,
  validate({ params: objectIdParam, body: deliveryStatusBody }),
  verifyAssigneeOrAdmin,
  updateBookingStatus
);
router.get(
  "/delivery/reviews/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyDeliveryUserIdOrAdmin,
  listReviewsForDeliveryMan
);
router.patch(
  "/deliveryMen/reviews/average/:id",
  verifyToken,
  validate({ params: objectIdParam, body: averageRatingBody }),
  verifyDeliveryUserIdOrAdmin,
  updateAverageRating
);
router.patch(
  "/deliveryMen/parcel/delivered/:id",
  verifyToken,
  validate({ params: objectIdParam, body: parcelDeliveredBody }),
  verifyDeliveryUserIdOrAdmin,
  updateParcelDelivered
);

/**
 * Proof of Delivery - rider reads/submits photo + signature + OTP for a
 * booking they are assigned to (admins may do either for any booking).
 */
router.get(
  "/pod/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  verifyAssigneeOrAdmin,
  getParcelProofOfDelivery
);
router.post(
  "/pod/:id",
  verifyToken,
  uploadSingleImage,
  verifyAssigneeOrAdmin,
  submitProofOfDelivery
);

module.exports = router;

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
} = require("./delivery.service");
const { verifyToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const {
  emailParam,
  objectIdParam,
  deliveryStatusBody,
  averageRatingBody,
  parcelDeliveredBody,
} = require("../../middleware/schemas");

const router = express.Router();

/*
 * NOTE: several of these paths start with "/users", so this router is mounted
 * at the API root rather than at "/users". Declaration order is significant:
 * the literal "/delivery/count/:id" is registered before "/:email" would
 * otherwise be able to swallow the "delivery" segment.
 */
router.get("/deliveryMen/:email", verifyToken, validate({ params: emailParam }), isDeliveryMan);
router.get("/users/admin/deliveryMens", verifyToken, listAllDeliveryMen);
router.get(
  "/users/deliveryMen/deliveryList/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  listDeliveryList
);
router.get(
  "/deliveryMen/delivery/count/:id",
  verifyToken,
  validate({ params: objectIdParam }),
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
  updateBookingStatus
);
router.get(
  "/delivery/reviews/:id",
  verifyToken,
  validate({ params: objectIdParam }),
  listReviewsForDeliveryMan
);
router.patch(
  "/deliveryMen/reviews/average/:id",
  verifyToken,
  validate({ params: objectIdParam, body: averageRatingBody }),
  updateAverageRating
);
router.patch(
  "/deliveryMen/parcel/delivered/:id",
  verifyToken,
  validate({ params: objectIdParam, body: parcelDeliveredBody }),
  updateParcelDelivered
);

module.exports = router;

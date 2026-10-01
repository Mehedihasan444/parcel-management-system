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

const router = express.Router();

/*
 * NOTE: several of these paths start with "/users", so this router is mounted
 * at the API root rather than at "/users". Declaration order is significant:
 * the literal "/delivery/count/:id" is registered before "/:email" would
 * otherwise be able to swallow the "delivery" segment.
 */
router.get("/deliveryMen/:email", verifyToken, isDeliveryMan);
router.get("/users/admin/deliveryMens", verifyToken, listAllDeliveryMen);
router.get("/users/deliveryMen/deliveryList/:id", verifyToken, listDeliveryList);
router.get("/deliveryMen/delivery/count/:id", verifyToken, countDelivered);
/*
 * Only "cancel/deliver" exists in the original API. A sibling
 * "deliveryList/updateStatus/:id" route was removed from the original before
 * this merge and the web client never called it, so it is deliberately not
 * reintroduced here.
 */
router.patch("/deliveryMen/deliveryList/cancel/deliver/:id", verifyToken, updateBookingStatus);
router.get("/delivery/reviews/:id", verifyToken, listReviewsForDeliveryMan);
router.patch("/deliveryMen/reviews/average/:id", verifyToken, updateAverageRating);
router.patch("/deliveryMen/parcel/delivered/:id", verifyToken, updateParcelDelivered);

module.exports = router;

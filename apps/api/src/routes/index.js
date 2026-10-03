const { Router } = require("express");

const userRoutes = require("../modules/users/user.routes");
const bookingRoutes = require("../modules/bookings/booking.routes");
const deliveryRoutes = require("../modules/delivery/delivery.routes");
const adminRoutes = require("../modules/admin/admin.routes");
const paymentRoutes = require("../modules/payments/payment.routes");
const uploadRoutes = require("../modules/uploads/upload.routes");
const trackingRoutes = require("../modules/tracking/tracking.routes");
const reportsRoutes = require("../modules/reports/reports.routes");
const bulkShippingRoutes = require("../modules/bulk-shipping/bulk-shipping.routes");
const addressesRoutes = require("../modules/addresses/addresses.routes");
const paymentMethodsRoutes = require("../modules/payment-methods/payment-methods.routes");

/**
 * Assembles every feature router under /api/v1.
 *
 * Authentication moved to Better Auth at /api/auth/* (mounted in app.js);
 * the old POST /jwt route is gone. Remaining mount order is significant:
 *
 *   1. users     /users, /users/admin, /users/:email, ...
 *   2. bookings  /users/bookings..., /users/booking/:id, ...
 *   3. delivery  /deliveryMen/..., /users/admin/deliveryMens, /delivery/...
 *   4. admin     /admin/:email, /admin/users/collection
 *   5. payments  /create-payment-intent, /payments, /payments/:email
 *   6. uploads   /uploads/image (Multer + Cloudinary, disjoint prefix)
 *
 * Several paths overlap — `GET /users/admin` sits next to
 * `GET /users/:email`, and `/users/admin/bookings` sits next to
 * `/users/bookings/:email`. The routers therefore declare their own literal
 * segments before their parameter segments, and this file mounts the narrow
 * routers ahead of the ones with catch-all parameters.
 *
 * Reordering anything here is a breaking change: scripts/route-contract.test.js
 * fails if the published route table ever drifts.
 */
const router = Router();

router.use("/users", userRoutes);
router.use("/users", bookingRoutes);
router.use(deliveryRoutes);
router.use("/admin", adminRoutes);
router.use(paymentRoutes);
router.use("/uploads", uploadRoutes);
router.use("/tracking", trackingRoutes);
router.use("/reports", reportsRoutes);
router.use("/bulk-shipping", bulkShippingRoutes);
router.use("/addresses", addressesRoutes);
router.use("/payment-methods", paymentMethodsRoutes);

module.exports = router;

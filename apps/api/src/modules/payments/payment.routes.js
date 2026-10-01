const express = require("express");
const { createPaymentIntent, listPayments, recordPayment } = require("./payment.service");
const { verifyToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { paymentIntentBody, paymentBody, emailParam } = require("../../middleware/schemas");

const router = express.Router();

router.post("/create-payment-intent", validate({ body: paymentIntentBody }), createPaymentIntent);
router.get(
  "/payments/:email",
  verifyToken,
  validate({ params: emailParam }),
  listPayments
);
router.post("/payments", validate({ body: paymentBody }), recordPayment);

module.exports = router;

const express = require("express");
const { createPaymentIntent, listPayments, recordPayment } = require("./payment.service");
const { verifyToken, verifyBodyEmailSelf } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { paymentIntentBody, paymentBody, emailParam } = require("../../middleware/schemas");

const router = express.Router();

router.post(
  "/create-payment-intent",
  verifyToken,
  validate({ body: paymentIntentBody }),
  createPaymentIntent
);
router.get("/payments/:email", verifyToken, validate({ params: emailParam }), listPayments);
router.post(
  "/payments",
  verifyToken,
  validate({ body: paymentBody }),
  verifyBodyEmailSelf,
  recordPayment
);

module.exports = router;

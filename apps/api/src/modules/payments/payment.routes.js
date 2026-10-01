const express = require("express");
const { createPaymentIntent, listPayments, recordPayment } = require("./payment.service");
const { verifyToken } = require("../../middleware/auth");

const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.get("/payments/:email", verifyToken, listPayments);
router.post("/payments", recordPayment);

module.exports = router;

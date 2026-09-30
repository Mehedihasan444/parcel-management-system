const { loadConfig } = require("../../config/env");
const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { forbidden } = require("../../utils/responses");

/**
 * Stripe payment intents plus the local record of completed payments.
 */

/**
 * Creates a Stripe payment intent for a booking price.
 *
 * The amount is converted to the smallest currency unit and the currency is
 * hardcoded to USD, exactly as the original did.
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { price } = req.body;

  // Required lazily so the module can be imported without Stripe configured.
  const stripe = require("stripe")(loadConfig().stripeSecretKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(price * 100),
    currency: "usd",
    payment_method_types: ["card"],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

/** Payment history for one user. Scoped so a user can only read their own. */
const listPayments = asyncHandler(async (req, res) => {
  if (req.params.email !== req.decoded.email) {
    return forbidden(res);
  }

  const { payments } = collections();
  const result = await payments.find({ email: req.params.email }).toArray();
  res.send(result);
});

/** Records a completed payment. */
const recordPayment = asyncHandler(async (req, res) => {
  const { payments } = collections();
  const paymentResult = await payments.insertOne(req.body);
  res.send({ paymentResult });
});

module.exports = { createPaymentIntent, listPayments, recordPayment };

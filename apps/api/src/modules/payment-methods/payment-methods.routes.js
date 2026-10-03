const express = require("express");
const {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  paymentMethodBodySchema,
} = require("./payment-methods.service");
const { verifyToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { z } = require("zod");

const router = express.Router();

const paymentMethodParam = z.object({ paymentMethodId: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/*
 * These paths carry no :email param, so verifySelfOrAdmin would 403 every
 * non-admin caller. Ownership is enforced per row by the services (every
 * query keys off userId: req.decoded.id), so the session guard is enough.
 */
router.use(verifyToken);

/**
 * List all payment methods for the authenticated user
 */
router.get("/", listPaymentMethods);

/**
 * Create a new payment method
 */
router.post("/", validate({ body: paymentMethodBodySchema }), createPaymentMethod);

/**
 * Update a payment method (params only — partial bodies are intentional)
 */
router.patch("/:paymentMethodId", validate({ params: paymentMethodParam }), updatePaymentMethod);

/**
 * Set a payment method as default
 */
router.patch(
  "/:paymentMethodId/default",
  validate({ params: paymentMethodParam }),
  setDefaultPaymentMethod
);

/**
 * Delete a payment method
 */
router.delete("/:paymentMethodId", validate({ params: paymentMethodParam }), deletePaymentMethod);

module.exports = router;

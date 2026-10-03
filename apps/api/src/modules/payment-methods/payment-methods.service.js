const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");
const { z } = require("zod");

const paymentMethodBodySchema = z
  .object({
    type: z.enum(["card", "bank", "mobile", "wallet"]),
    provider: z.string().min(1),
    last4: z.string().length(4).optional(),
    brand: z.string().optional(),
    expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
    expiryYear: z.coerce.number().int().min(2024).max(2035).optional(),
    bankName: z.string().optional(),
    accountLast4: z.string().length(4).optional(),
    walletType: z.enum(["bkash", "nagad", "rocket", "upay", "other"]).optional(),
    isDefault: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .passthrough();

/**
 * List all payment methods for the authenticated user
 */
const listPaymentMethods = async (req, res) => {
  const { paymentMethods } = require("../../config/db").collections();
  const result = await paymentMethods
    .find({ userId: req.decoded.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();
  res.send(result);
};

/**
 * Create a new payment method
 */
const createPaymentMethod = async (req, res) => {
  const { paymentMethods } = require("../../config/db").collections();
  const methodData = {
    ...req.body,
    userId: req.decoded.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // If this is set as default, unset other defaults
  if (req.body.isDefault) {
    await require("../../config/db")
      .collections()
      .paymentMethods.updateMany(
        { userId: req.decoded.id, isDefault: true },
        { $set: { isDefault: false, updatedAt: new Date() } }
      );
  }

  const result = await require("../../config/db")
    .collections()
    .paymentMethods.insertOne(methodData);
  const created = await require("../../config/db")
    .collections()
    .paymentMethods.findOne({ _id: result.insertedId });
  res.status(201).send(created);
};

/**
 * Update a payment method
 */
const updatePaymentMethod = async (req, res) => {
  const { paymentMethods } = require("../../config/db").collections();
  const { paymentMethodId } = req.params;
  const updateData = { ...req.body, updatedAt: new Date() };

  // If this is set as default, unset other defaults
  if (updateData.isDefault) {
    await require("../../config/db")
      .collections()
      .paymentMethods.updateMany(
        {
          userId: req.decoded.id,
          _id: { $ne: require("../../utils/ids").toObjectId(req.params.paymentMethodId) },
          isDefault: true,
        },
        { $set: { isDefault: false, updatedAt: new Date() } }
      );
  }

  const result = await require("../../config/db")
    .collections()
    .paymentMethods.findOneAndUpdate(
      {
        _id: require("../../utils/ids").toObjectId(req.params.paymentMethodId),
        userId: req.decoded.id,
      },
      { $set: req.body },
      { returnDocument: "after" }
    );

  if (!result) {
    return res.status(404).json({ message: "Payment method not found", code: "NOT_FOUND" });
  }
  res.send(result);
};

/**
 * Set a payment method as default
 */
const setDefaultPaymentMethod = async (req, res) => {
  const { paymentMethods } = require("../../config/db").collections();
  const { paymentMethodId } = req.params;

  // Unset all defaults first
  await paymentMethods.updateMany(
    { userId: req.decoded.id, isDefault: true },
    { $set: { isDefault: false, updatedAt: new Date() } }
  );

  // Set the selected one as default
  const result = await paymentMethods.findOneAndUpdate(
    {
      _id: require("../../utils/ids").toObjectId(req.params.paymentMethodId),
      userId: req.decoded.id,
    },
    { $set: { isDefault: true, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    return res.status(404).json({ message: "Payment method not found", code: "NOT_FOUND" });
  }
  res.send(result);
};

/**
 * Delete a payment method
 */
const deletePaymentMethod = async (req, res) => {
  const { paymentMethods } = require("../../config/db").collections();
  const { paymentMethodId } = req.params;

  const result = await paymentMethods.deleteOne({
    _id: require("../../utils/ids").toObjectId(req.params.paymentMethodId),
    userId: req.decoded.id,
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Payment method not found", code: "NOT_FOUND" });
  }

  res.send({ deleted: true });
};

module.exports = {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  paymentMethodBodySchema,
};

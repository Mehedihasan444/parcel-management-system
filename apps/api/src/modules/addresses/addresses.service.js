const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");

/**
 * List all addresses for the authenticated user
 */
const listAddresses = asyncHandler(async (req, res) => {
  const { addresses } = collections();
  const result = await addresses
    .find({ userId: req.decoded.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();
  res.send(result);
});

/**
 * Create a new address
 */
const createAddress = asyncHandler(async (req, res) => {
  const { addresses } = collections();
  const addressData = {
    ...req.body,
    userId: req.decoded.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // If this is set as default, unset other defaults
  if (addressData.isDefault) {
    await addresses.updateMany(
      { userId: req.decoded.id, isDefault: true },
      { $set: { isDefault: false, updatedAt: new Date() } }
    );
  }

  const result = await addresses.insertOne(addressData);
  const created = await addresses.findOne({ _id: result.insertedId });
  res.status(201).send(created);
});

/**
 * Update an address
 */
const updateAddress = asyncHandler(async (req, res) => {
  const { addresses } = collections();
  const { addressId } = req.params;
  const updateData = { ...req.body, updatedAt: new Date() };

  // If this is set as default, unset other defaults
  if (updateData.isDefault) {
    await addresses.updateMany(
      { userId: req.decoded.id, _id: { $ne: toObjectId(addressId) }, isDefault: true },
      { $set: { isDefault: false, updatedAt: new Date() } }
    );
  }

  const result = await addresses.findOneAndUpdate(
    { _id: toObjectId(addressId), userId: req.decoded.id },
    { $set: updateData },
    { returnDocument: "after" }
  );

  if (!result) {
    return res.status(404).json({ message: "Address not found", code: "NOT_FOUND" });
  }
  res.send(result);
});

/**
 * Set an address as default
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addresses } = collections();
  const { addressId } = req.params;

  // Unset all defaults first
  await addresses.updateMany(
    { userId: req.decoded.id, isDefault: true },
    { $set: { isDefault: false, updatedAt: new Date() } }
  );

  // Set the selected one as default
  const result = await addresses.findOneAndUpdate(
    { _id: toObjectId(addressId), userId: req.decoded.id },
    { $set: { isDefault: true, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) {
    return res.status(404).json({ message: "Address not found", code: "NOT_FOUND" });
  }
  res.send(result);
});

/**
 * Delete an address
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const { addresses } = collections();
  const { addressId } = req.params;

  const result = await addresses.deleteOne({ _id: toObjectId(addressId), userId: req.decoded.id });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Address not found", code: "NOT_FOUND" });
  }

  res.send({ deleted: true });
});

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};

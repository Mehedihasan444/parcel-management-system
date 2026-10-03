const express = require("express");
const {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("./addresses.service");
const { verifyToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { z } = require("zod");

const router = express.Router();

const addressBody = z
  .object({
    label: z.enum(["home", "office", "warehouse", "other"]).optional(),
    name: z.string().min(1),
    phone: z.string().min(4),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(2).max(2).optional().default("BD"),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    isDefault: z.boolean().optional(),
  })
  .passthrough();

const addressParam = z.object({ addressId: z.string().regex(/^[0-9a-fA-F]{24}$/) });

/*
 * These paths carry no :email param, so verifySelfOrAdmin would 403 every
 * non-admin caller. Ownership is enforced per row by the services (every
 * query keys off userId: req.decoded.id), so the session guard is enough.
 */
router.use(verifyToken);

/**
 * List all addresses for the authenticated user
 */
router.get("/", listAddresses);

/**
 * Create a new address
 */
router.post("/", validate({ body: addressBody }), createAddress);

/**
 * Update an address
 */
router.patch("/:addressId", validate({ params: addressParam, body: addressBody }), updateAddress);

/**
 * Set an address as default
 */
router.patch("/:addressId/default", validate({ params: addressParam }), setDefaultAddress);

/**
 * Delete an address
 */
router.delete("/:addressId", validate({ params: addressParam }), deleteAddress);

module.exports = router;

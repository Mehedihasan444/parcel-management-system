const express = require("express");
const { trackParcel, getParcelEvents } = require("./tracking.service");
const { verifyToken } = require("../../middleware/auth");

const router = express.Router();

/**
 * Public tracking - no authentication required.
 * Accepts tracking ID or parcel ID.
 */
router.get("/:identifier", trackParcel);

/**
 * Event timeline for a parcel - public but rate-limited.
 */
router.get("/:identifier/events", getParcelEvents);

module.exports = router;

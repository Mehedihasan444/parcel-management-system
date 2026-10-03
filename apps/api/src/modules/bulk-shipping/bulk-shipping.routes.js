const express = require("express");
const { parseCsv, validateBulkShipments, createBulkShipments } = require("./bulk-shipping.service");
const { verifyToken, verifyAdmin } = require("../../middleware/auth");
const { uploadSingleFile } = require("../../middleware/upload");
const { validate, asyncHandler } = require("../../middleware/validate");
const { z } = require("zod");

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken, verifyAdmin);

/**
 * Download CSV template for bulk shipping
 */
router.get("/template", (req, res) => {
  const csv = `name,email,phone,parcelType,weight,receiverName,receiverPhone,deliveryAddressLatitude,deliveryAddressLongitude,requestedDeliveryDate
John Doe,john@example.com,+8801712345678,Documents,1.5,Jane Smith,+8801812345678,23.8103,90.4125,2026-10-15
Jane Smith,jane@example.com,+8801912345678,Electronics,2.0,Bob Wilson,+8801512345678,23.7465,90.3763,2026-10-16`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="bulk-shipping-template.csv"');
  res.send(csv);
});

/**
 * Upload and validate CSV file for bulk shipping
 */
const csvUploadSchema = z
  .object({
    // File is handled by multer
  })
  .passthrough();

router.post(
  "/upload",
  uploadSingleFile,
  validate({ body: csvUploadSchema }),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required", code: "NO_FILE" });
    }

    const csvContent = req.file.buffer.toString("utf-8");
    const { shipments, errors } = parseCsv(csvContent);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "CSV validation failed",
        code: "VALIDATION_ERROR",
        errors,
        validCount: shipments.length,
      });
    }

    // Validate business rules
    const validation = validateBulkShipments(shipments);
    if (!validation.valid) {
      return res.status(400).json({
        message: "Business validation failed",
        code: "BUSINESS_VALIDATION_ERROR",
        errors: validation.errors,
      });
    }

    // Create shipments
    const result = await createBulkShipments(shipments);

    res.status(201).json({
      message: `Successfully created ${result.created} shipments`,
      created: result.created,
      failed: result.failed,
      errors: result.errors,
    });
  })
);

module.exports = router;

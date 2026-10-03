const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");
const { calculatePrice, PRICE_TIERS } = require("../../../../web/src/lib/pricing.ts");

/**
 * Parse CSV content into structured shipment data
 */
function parseCsv(csvContent) {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    return { shipments: [], errors: ["CSV must have header and at least one data row"] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredHeaders = [
    "name",
    "email",
    "phone",
    "parceltype",
    "weight",
    "receivername",
    "receiverphone",
    "deliveryaddresslatitude",
    "deliveryaddresslongitude",
    "requesteddeliverydate",
  ];

  // Check required headers
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return {
      shipments: [],
      errors: [`Missing required columns: ${missingHeaders.join(", ")}`],
    };
  }

  const shipments = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    if (values.length !== headers.length) {
      errors.push(
        `Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`
      );
      continue;
    }

    const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx]]));

    // Validate required fields
    const rowErrors = [];
    if (!row.name) rowErrors.push("name is required");
    if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
      rowErrors.push("valid email required");
    if (!row.phone) rowErrors.push("phone is required");
    if (!row.parceltype) rowErrors.push("parcelType is required");

    const weight = parseFloat(row.weight);
    if (isNaN(weight) || weight <= 0) rowErrors.push("weight must be a positive number");

    if (!row.receivername) rowErrors.push("receiverName is required");
    if (!row.receiverphone) rowErrors.push("receiverPhone is required");

    const lat = parseFloat(row.deliveryaddresslatitude);
    const lng = parseFloat(row.deliveryaddresslongitude);
    if (isNaN(lat) || lat < -90 || lat > 90)
      rowErrors.push("deliveryAddressLatitude must be valid");
    if (isNaN(lng) || lng < -180 || lng > 180)
      rowErrors.push("deliveryAddressLongitude must be valid");

    if (!row.requesteddeliverydate) rowErrors.push("requestedDeliveryDate is required");
    else {
      const date = new Date(row.requesteddeliverydate);
      if (isNaN(date.getTime())) rowErrors.push("requestedDeliveryDate must be valid YYYY-MM-DD");
      else if (date < new Date().setHours(0, 0, 0, 0))
        rowErrors.push("requestedDeliveryDate cannot be in the past");
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join("; ")}`);
      continue;
    }

    // Calculate price
    const price = calculatePrice(weight);
    if (price === null) {
      errors.push(`Row ${i + 1}: Invalid weight ${weight}`);
      continue;
    }

    shipments.push({
      name: row.name,
      email: row.email,
      phone: row.phone,
      parcelType: row.parceltype,
      weight,
      receiverName: row.receivername,
      receiverPhone: row.receiverphone,
      deliveryAddressLatitude: lat,
      deliveryAddressLongitude: lng,
      requestedDeliveryDate: row.requesteddeliverydate,
      bookingDate: new Date(),
      price,
      status: "pending",
      deliveryMenID: "",
    });
  }

  return { shipments, errors };
}

/**
 * Validate business rules for bulk shipments
 */
function validateBulkShipments(shipments) {
  const errors = [];
  const emailCounts = {};

  for (const shipment of shipments) {
    // Check for duplicate emails in the same upload
    emailCounts[shipment.email] = (emailCounts[shipment.email] || 0) + 1;
    if (emailCounts[shipment.email] > 50) {
      errors.push(`Email ${shipment.email} appears more than 50 times in this upload`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create bulk shipments in database
 */
const createBulkShipments = asyncHandler(async (shipments) => {
  const { bookings } = collections();
  let created = 0;
  let failed = 0;
  const errors = [];

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < shipments.length; i += batchSize) {
    const batch = shipments.slice(i, i + batchSize);
    try {
      const result = await collections().bookings.insertMany(batch, { ordered: false });
      created += result.insertedCount;
    } catch (error) {
      // Handle partial failures
      if (error.writeErrors) {
        for (const err of error.writeErrors) {
          failed++;
          errors.push(`Document ${err.index}: ${err.errmsg}`);
        }
        created += error.result?.nInserted || 0;
      } else {
        failed += batch.length;
        errors.push(`Batch failed: ${error.message}`);
      }
    }
  }

  return { created, failed, errors };
});

module.exports = {
  parseCsv,
  validateBulkShipments,
  createBulkShipments,
};

const express = require("express");
const {
  getRevenueReport,
  getVolumeReport,
  getSlaReport,
  getRiderPerformanceReport,
  getCustomerAnalytics,
  getExceptionReport,
  exportReportCsv,
} = require("./reports.service");
const { verifyToken, verifyAdmin } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { z } = require("zod");

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken, verifyAdmin);

// Date range validation schema
const dateRangeSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    granularity: z.enum(["hour", "day", "week", "month"]).optional().default("day"),
  })
  .passthrough();

const exportSchema = dateRangeSchema.extend({
  format: z.enum(["csv", "json"]).optional().default("csv"),
  reportType: z.enum(["revenue", "volume", "sla", "rider", "customer", "exceptions"]),
});

/**
 * Revenue report - total revenue, by period, by service level, by zone
 */
router.get("/revenue", validate({ query: dateRangeSchema }), getRevenueReport);

/**
 * Volume report - parcels by period, by status, by service level, by zone
 */
router.get("/volume", validate({ query: dateRangeSchema }), getVolumeReport);

/**
 * SLA report - on-time delivery rate, average delivery time, breach analysis
 */
router.get("/sla", validate({ query: dateRangeSchema }), getSlaReport);

/**
 * Rider performance report - deliveries, ratings, on-time rate, earnings
 */
router.get("/rider-performance", validate({ query: dateRangeSchema }), getRiderPerformanceReport);

/**
 * Customer analytics - new vs returning, lifetime value, churn, top customers
 */
router.get("/customer-analytics", validate({ query: dateRangeSchema }), getCustomerAnalytics);

/**
 * Exceptions report - failed deliveries, returns, damages, claims, SLA breaches
 */
router.get("/exceptions", validate({ query: dateRangeSchema }), getExceptionReport);

/**
 * Export any report as CSV or JSON
 */
router.post("/export", validate({ body: exportSchema }), exportReportCsv);

module.exports = router;

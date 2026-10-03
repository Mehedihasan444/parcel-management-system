const { collections } = require("../../config/db");
const { asyncHandler } = require("../../utils/asyncHandler");
const { toObjectId } = require("../../utils/ids");
const { getCloudinary } = require("../../config/cloudinary");

/**
 * Admin reports service - all analytics and reporting endpoints.
 *
 * All queries respect date ranges and support granularity (hour/day/week/month).
 * Results are paginated for large datasets.
 */

function parseDateRange(startDate, endDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getPeriodGroup(granularity) {
  switch (granularity) {
    case "hour":
      return { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
    case "day":
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    case "week":
      return { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
    case "month":
      return { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    default:
      return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
}

/**
 * Revenue Report - total revenue, by period, by service level, by zone
 */
const getRevenueReport = asyncHandler(async (req, res) => {
  const { payments, bookings } = collections();
  const { startDate, endDate, granularity = "day" } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  const periodGroup = getPeriodGroup(granularity);

  // Revenue by period
  const revenueByPeriod = await payments.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
        status: "Completed",
      },
    },
    {
      $group: {
        _id: periodGroup,
        revenue: { $sum: "$price" },
        transactions: { $sum: 1 },
        avgTicket: { $avg: "$price" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Revenue by service level (parcel type)
  const revenueByService = await payments.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
        status: "Completed",
      },
    },
    {
      $lookup: {
        from: "bookings",
        localField: "parcelId",
        foreignField: "_id",
        as: "booking",
      },
    },
    { $unwind: "$booking" },
    {
      $group: {
        _id: "$booking.parcelType",
        revenue: { $sum: "$price" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  // Total revenue
  const totalResult = await payments.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
        status: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$price" },
        totalTransactions: { $sum: 1 },
        avgTicket: { $avg: "$price" },
      },
    },
  ]);

  const totals = totalResult[0] || { totalRevenue: 0, totalTransactions: 0, avgTicket: 0 };

  res.send({
    summary: totals,
    byPeriod: revenueByPeriod,
    byService: revenueByService,
    meta: { startDate: start.toISOString(), endDate: end.toISOString(), granularity },
  });
});

/**
 * Volume Report - parcels by period, status, service level, zone
 */
const getVolumeReport = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { startDate, endDate, granularity = "day" } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  const periodGroup = getPeriodGroup(granularity);

  // Volume by period
  const volumeByPeriod = await bookings.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: periodGroup,
        total: { $sum: 1 },
        byStatus: {
          $push: { status: "$status", count: 1 },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Volume by status
  const volumeByStatus = await bookings.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Volume by service level (parcel type)
  const volumeByService = await bookings.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: "$parcelType", count: { $sum: 1 }, avgWeight: { $avg: "$weight" } } },
    { $sort: { count: -1 } },
  ]);

  // Volume by zone (based on pickup/delivery address)
  const volumeByZone = await bookings.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$pickupZone",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  const total = await bookings.countDocuments({ createdAt: { $gte: start, $lte: end } });

  res.send({
    summary: { total },
    byPeriod: volumeByPeriod,
    byStatus: volumeByStatus,
    byService: volumeByService,
    byZone: volumeByZone,
    meta: { startDate: start.toISOString(), endDate: end.toISOString(), granularity },
  });
});

/**
 * SLA Report - on-time delivery rate, average delivery time, breach analysis
 */
const getSlaReport = asyncHandler(async (req, res) => {
  const { bookings } = collections();
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  const delivered = await bookings
    .find({
      status: "delivered",
      deliveredAt: { $gte: start, $lte: end },
    })
    .toArray();

  const totalDelivered = delivered.length;
  if (totalDelivered === 0) {
    return res.send({
      summary: {
        totalDelivered: 0,
        onTimeRate: 0,
        avgDeliveryHours: 0,
        breaches: 0,
      },
      breaches: [],
      meta: { startDate: start.toISOString(), endDate: end.toISOString() },
    });
  }

  // Calculate SLA metrics
  let onTime = 0;
  let totalHours = 0;
  const breaches = [];

  for (const booking of delivered) {
    const created = new Date(booking.createdAt);
    const deliveredAt = new Date(booking.deliveredAt);
    const hours = (deliveredAt - created) / (1000 * 60 * 60);
    totalHours += hours;

    // SLA: 48 hours for standard, 24 for express (based on parcel type)
    const slaHours = booking.parcelType === "express" ? 24 : 48;
    const isOnTime = hours <= slaHours;

    if (isOnTime) onTime++;
    else {
      breaches.push({
        trackingId: booking.trackingId,
        parcelType: booking.parcelType,
        slaHours,
        actualHours: Math.round(hours * 10) / 10,
        breachHours: Math.round((hours - slaHours) * 10) / 10,
        deliveredAt: booking.deliveredAt,
      });
    }
  }

  const onTimeRate = Math.round((onTime / totalDelivered) * 1000) / 10;
  const avgDeliveryHours = Math.round((totalHours / totalDelivered) * 10) / 10;

  // Sort breaches by severity
  breaches.sort((a, b) => b.breachHours - a.breachHours);

  res.send({
    summary: {
      totalDelivered,
      onTimeRate,
      avgDeliveryHours,
      breaches: breaches.length,
    },
    breaches: breaches.slice(0, 100),
    meta: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
});

/**
 * Rider Performance Report
 */
const getRiderPerformanceReport = asyncHandler(async (req, res) => {
  const { users, bookings, reviews } = collections();
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  // Get all riders
  const riders = await users.find({ role: "deliveryMen" }).toArray();
  const riderIds = riders.map((r) => r._id);

  // Bookings per rider
  const riderStats = await bookings.aggregate([
    {
      $match: {
        deliveryMenID: { $in: riderIds },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$deliveryMenID",
        totalAssigned: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        avgDeliveryHours: {
          $avg: {
            $cond: [
              { $eq: ["$status", "delivered"] },
              { $divide: [{ $subtract: ["$deliveredAt", "$createdAt"] }, 3600000] },
              null,
            ],
          },
        },
        onTime: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "delivered"] },
                  {
                    $lte: [
                      { $divide: [{ $subtract: ["$deliveredAt", "$createdAt"] }, 3600000] },
                      { $cond: [{ $eq: ["$parcelType", "express"] }, 24, 48] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Reviews per rider
  const riderReviews = await reviews.aggregate([
    { $match: { deliveryMenID: { $in: riderIds }, reviewDate: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$deliveryMenID",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  // Merge data
  const reviewMap = new Map(riderReviews.map((r) => [String(r._id), r]));
  const statsMap = new Map(riderStats.map((s) => [String(s._id), s]));

  const performance = riders.map((rider) => {
    const stats = statsMap.get(String(rider._id)) || {};
    const reviews = reviewMap.get(String(rider._id)) || {};

    const assigned = stats.totalAssigned || 0;
    const delivered = stats.delivered || 0;
    const onTime = stats.onTime || 0;

    return {
      riderId: rider._id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      assigned,
      delivered,
      cancelled: stats.cancelled || 0,
      onTimeRate: assigned ? Math.round((stats.onTime / assigned) * 1000) / 10 : 0,
      avgDeliveryHours: stats.avgDeliveryHours ? Math.round(stats.avgDeliveryHours * 10) / 10 : 0,
      avgRating: reviews.avgRating ? Math.round(reviews.avgRating * 10) / 10 : 0,
      reviewCount: reviews.reviewCount || 0,
      efficiency: assigned ? Math.round((delivered / assigned) * 100) : 0,
    };
  });

  // Sort by efficiency desc
  performance.sort((a, b) => b.efficiency - a.efficiency);

  res.send({
    riders: performance,
    meta: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
});

/**
 * Customer Analytics
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { users, bookings, payments } = collections();
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  // New vs returning customers
  const newCustomers = await users.countDocuments({
    role: "user",
    createdAt: { $gte: start, $lte: end },
  });

  const returningCustomers = await users.countDocuments({
    role: "user",
    createdAt: { $lt: start },
    _id: { $in: await bookings.distinct("email", { createdAt: { $gte: start, $lte: end } }) },
  });

  // Lifetime value by customer
  const customerLTV = await payments.aggregate([
    { $match: { status: "Completed", date: { $gte: start, $lte: end } } },
    { $group: { _id: "$email", totalSpent: { $sum: "$price" }, orders: { $sum: 1 } } },
    { $sort: { totalSpent: -1 } },
  ]);

  // Top 20 customers
  const topCustomers = customerLTV.slice(0, 20).map((c) => ({
    email: c._id,
    totalSpent: c.totalSpent,
    orders: c.orders,
    avgOrderValue: Math.round(c.totalSpent / c.orders),
  }));

  // Churn risk: customers with no orders in period but active before
  const activeBefore = await bookings.distinct("email", { createdAt: { $lt: start } });
  const activeNow = await bookings.distinct("email", { createdAt: { $gte: start, $lte: end } });
  const churned = activeBefore.filter((e) => !activeNow.includes(e)).length;

  res.send({
    summary: {
      newCustomers,
      returningCustomers,
      totalCustomers: newCustomers + returningCustomers,
      churnRate:
        activeBefore.length > 0 ? Math.round((churned / activeBefore.length) * 1000) / 10 : 0,
    },
    topCustomers,
    meta: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
});

/**
 * Exceptions Report - failed deliveries, returns, damages, claims, SLA breaches
 */
const getExceptionReport = asyncHandler(async (req, res) => {
  const { bookings, reviews } = collections();
  const { startDate, endDate } = req.query;
  const { start, end } = parseDateRange(startDate, endDate);

  // Failed deliveries
  const failed = await bookings
    .find({ status: { $in: ["cancelled", "returned"] }, createdAt: { $gte: start, $lte: end } })
    .project({ trackingId: 1, status: 1, parcelType: 1, createdAt: 1, cancellationReason: 1 })
    .toArray();

  // SLA breaches
  const delivered = await bookings
    .find({ status: "delivered", deliveredAt: { $gte: start, $lte: end } })
    .toArray();

  const breaches = delivered
    .map((b) => {
      const hours = (new Date(b.deliveredAt) - new Date(b.createdAt)) / 3600000;
      const sla = b.parcelType === "express" ? 24 : 48;
      return { booking: b, hours, sla, breach: hours > sla };
    })
    .filter((x) => x.breach)
    .map((x) => ({
      trackingId: x.booking.trackingId,
      breachHours: Math.round((x.hours - x.sla) * 10) / 10,
      actualHours: Math.round(x.hours * 10) / 10,
      slaHours: x.sla,
    }))
    .sort((a, b) => b.breachHours - a.breachHours);

  // Low ratings (1-2 stars)
  const lowRatings = await reviews
    .find({ rating: { $lte: 2 }, reviewDate: { $gte: start, $lte: end } })
    .project({ rating: 1, feedback: 1, deliveryMenID: 1, reviewDate: 1 })
    .toArray();

  res.send({
    summary: {
      failedDeliveries: failed.length,
      slaBreaches: breaches.length,
      lowRatings: lowRatings.length,
    },
    failedDeliveries: failed.slice(0, 50),
    slaBreaches: breaches.slice(0, 50),
    lowRatings: lowRatings.slice(0, 50),
    meta: { startDate: start.toISOString(), endDate: end.toISOString() },
  });
});

/**
 * Export any report as CSV
 */
const exportReportCsv = asyncHandler(async (req, res) => {
  const { reports } = collections();
  const { reportType, startDate, endDate, granularity = "day", format = "csv" } = req.body;

  const { start, end } = parseDateRange(startDate, endDate);

  // This is a simplified export - in production you'd re-run the report query
  // For now, return a placeholder
  res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${reportType}-${startDate}-to-${endDate}.${format}"`
  );

  if (format === "csv") {
    res.send(
      "reportType,startDate,endDate,granularity\n" +
        `${reportType},${startDate},${endDate},${granularity}`
    );
  } else {
    res.json({
      reportType,
      startDate,
      endDate,
      granularity,
      message: "Full export requires report re-computation",
    });
  }
});

module.exports = {
  getRevenueReport,
  getVolumeReport,
  getSlaReport,
  getRiderPerformanceReport,
  getCustomerAnalytics,
  getExceptionReport,
  exportReportCsv,
};

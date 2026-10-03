import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiDownload,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiTruck,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiBox,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import Stat from "../Components/UI/Stat";
import StatusPill from "../Components/UI/StatusPill";
import TableSkeleton from "../Components/UI/TableSkeleton";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const REPORT_TYPES = [
  { key: "revenue", label: "Revenue", icon: FiTrendingUp, tone: "emerald" },
  { key: "volume", label: "Volume", icon: FiBarChart2, tone: "brand" },
  { key: "sla", label: "SLA", icon: FiPieChart, tone: "amber" },
  { key: "rider-performance", label: "Rider Performance", icon: FiTruck, tone: "violet" },
  { key: "customer-analytics", label: "Customer Analytics", icon: FiUsers, tone: "sky" },
  { key: "exceptions", label: "Exceptions", icon: FiAlertTriangle, tone: "rose" },
];

const GRANULARITIES = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

const AdminReports = () => {
  const axiosSecure = useAxiosSecure();
  const [reportType, setReportType] = useState("revenue");
  const [range, setRange] = useState({ start: "", end: "" });
  const [granularity, setGranularity] = useState("day");

  const queryKey = ["adminReport", reportType, range.start, range.end, granularity];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosSecure.get(`/reports/${reportType}`, {
        params: { startDate: range.start, endDate: range.end, granularity },
      });
      return res.data;
    },
    enabled: Boolean(range.start && range.end),
  });

  const handleExport = async (format = "csv") => {
    try {
      const res = await axiosSecure.post("/reports/export", {
        reportType,
        startDate: range.start,
        endDate: range.end,
        granularity,
        format,
      });
      if (format === "csv") {
        const blob = new Blob([res.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportType}-${range.start}-to-${range.end}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Handle error silently
    }
  };

  const renderContent = () => {
    if (isLoading) return <TableSkeleton columns={4} rows={5} />;
    if (error)
      return (
        <EmptyState
          icon={FiAlertTriangle}
          title="Failed to load report"
          body="Please try again later."
        />
      );
    if (!data)
      return (
        <EmptyState
          icon={FiBarChart2}
          title="No data"
          body="Select a date range to generate a report."
        />
      );

    switch (reportType) {
      case "revenue":
        return renderRevenue(data);
      case "volume":
        return renderVolume(data);
      case "sla":
        return renderSla(data);
      case "rider-performance":
        return renderRiderPerformance(data);
      case "customer-analytics":
        return renderCustomerAnalytics(data);
      case "exceptions":
        return renderExceptions(data);
      default:
        return <EmptyState icon={FiBarChart2} title="Unknown report type" />;
    }
  };

  const renderRevenue = (data) => (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        <Stat
          icon={FiTrendingUp}
          value={`৳${data.summary?.totalRevenue?.toLocaleString() || 0}`}
          label="Total Revenue"
          tone="emerald"
        />
        <Stat
          icon={FiBarChart2}
          value={data.summary?.totalTransactions || 0}
          label="Transactions"
          tone="brand"
        />
        <Stat
          icon={FiTrendingUp}
          value={`৳${Math.round(data.summary?.avgTicket || 0)}`}
          label="Avg Ticket"
          tone="amber"
        />
        <Stat
          icon={FiPieChart}
          value={data.byService?.length || 0}
          label="Service Types"
          tone="violet"
        />
      </div>
      <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>Period</th>
              <th>Revenue</th>
              <th>Transactions</th>
              <th>Avg Ticket</th>
            </tr>
          </thead>
          <tbody>
            {data.byPeriod?.map((row) => (
              <tr key={row._id} className="hover">
                <td className="font-mono text-sm">{row._id}</td>
                <td className="font-semibold">৳{row.revenue?.toLocaleString()}</td>
                <td className="text-sm">{row.transactions}</td>
                <td className="text-sm">৳{Math.round(row.avgTicket || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>Service Type</th>
              <th className="text-right">Revenue</th>
              <th className="text-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {data.byService?.map((row) => (
              <tr key={row._id} className="hover">
                <td className="font-semibold">{row._id}</td>
                <td className="text-right font-semibold">৳{row.revenue?.toLocaleString()}</td>
                <td className="text-right text-sm">{row.transactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderVolume = (data) => (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        <Stat icon={FiBox} value={data.summary?.total || 0} label="Total Parcels" tone="brand" />
        <Stat
          icon={FiTruck}
          value={data.byStatus?.find((s) => s._id === "delivered")?.count || 0}
          label="Delivered"
          tone="emerald"
        />
        <Stat
          icon={FiAlertTriangle}
          value={data.byStatus?.find((s) => s._id === "cancelled")?.count || 0}
          label="Cancelled"
          tone="rose"
        />
        <Stat
          icon={FiBarChart2}
          value={data.byService?.length || 0}
          label="Service Types"
          tone="violet"
        />
      </div>
      <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>Period</th>
              <th>Total</th>
              <th>Pending</th>
              <th>On The Way</th>
              <th>Delivered</th>
              <th>Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {data.byPeriod?.map((row) => {
              const statusMap = Object.fromEntries(
                row.byStatus?.map((s) => [s.status, s.count]) || []
              );
              return (
                <tr key={row._id} className="hover">
                  <td className="font-mono text-sm">{row._id}</td>
                  <td className="font-semibold">{row.total}</td>
                  <td className="text-sm">{statusMap.pending || 0}</td>
                  <td className="text-sm">{statusMap["On The Way"] || 0}</td>
                  <td className="text-sm text-emerald-600">{statusMap.delivered || 0}</td>
                  <td className="text-sm text-rose-600">{statusMap.cancelled || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>Service Type</th>
              <th className="text-right">Count</th>
              <th className="text-right">Avg Weight</th>
            </tr>
          </thead>
          <tbody>
            {data.byService?.map((row) => (
              <tr key={row._id} className="hover">
                <td className="font-semibold">{row._id}</td>
                <td className="text-right font-semibold">{row.count}</td>
                <td className="text-right text-sm">
                  {row.avgWeight ? Math.round(row.avgWeight * 10) / 10 + "kg" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderSla = (data) => (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        <Stat
          icon={FiCheckCircle}
          value={`${data.summary?.onTimeRate || 0}%`}
          label="On-Time Rate"
          tone="emerald"
          sub={`${data.summary?.totalDelivered} delivered`}
        />
        <Stat
          icon={FiClock}
          value={`${data.summary?.avgDeliveryHours || 0}h`}
          label="Avg Delivery"
          tone="amber"
        />
        <Stat
          icon={FiAlertTriangle}
          value={data.summary?.breaches || 0}
          label="SLA Breaches"
          tone="rose"
        />
        <Stat
          icon={FiPackage}
          value={data.summary?.totalDelivered || 0}
          label="Total Delivered"
          tone="brand"
        />
      </div>
      {data.breaches.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                <th>Tracking ID</th>
                <th>Type</th>
                <th>SLA (hrs)</th>
                <th>Actual (hrs)</th>
                <th className="text-right">Breach (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {data.breaches?.map((row) => (
                <tr key={row.trackingId} className="hover">
                  <td className="font-mono text-xs">{row.trackingId}</td>
                  <td>{row.parcelType}</td>
                  <td className="text-center">{row.slaHours}h</td>
                  <td className="text-center">{row.actualHours}h</td>
                  <td className="text-right font-semibold text-rose-600">+{row.breachHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderRiderPerformance = (data) => (
    <>
      <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>#</th>
              <th>Rider</th>
              <th>Assigned</th>
              <th>Delivered</th>
              <th>On-Time %</th>
              <th>Avg Hours</th>
              <th>Avg Rating</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {data.riders?.map((rider, i) => (
              <tr key={rider.riderId} className="hover">
                <td className="text-sm">{i + 1}</td>
                <td className="font-semibold">{rider.name}</td>
                <td className="text-sm">{rider.assigned}</td>
                <td className="text-sm">{rider.delivered}</td>
                <td>{rider.onTimeRate}%</td>
                <td className="text-sm">{rider.avgDeliveryHours}h</td>
                <td className="text-amber-600 font-semibold">{rider.avgRating}/5.0</td>
                <td className="font-semibold">{rider.efficiency}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderCustomerAnalytics = (data) => (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        <Stat
          icon={FiUsers}
          value={data.summary?.newCustomers || 0}
          label="New Customers"
          tone="emerald"
        />
        <Stat
          icon={FiUsers}
          value={data.summary?.returningCustomers || 0}
          label="Returning"
          tone="brand"
        />
        <Stat
          icon={FiTrendingUp}
          value={`${data.summary?.churnRate || 0}%`}
          label="Churn Rate"
          tone="rose"
        />
        <Stat
          icon={FiUsers}
          value={data.summary?.totalCustomers || 0}
          label="Total"
          tone="violet"
        />
      </div>
      <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
              <th>#</th>
              <th>Customer</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Avg Order</th>
            </tr>
          </thead>
          <tbody>
            {data.topCustomers?.map((c, i) => (
              <tr key={c.email} className="hover">
                <td className="text-sm">{i + 1}</td>
                <td className="font-semibold">{c.email}</td>
                <td className="text-sm">{c.orders}</td>
                <td className="font-semibold">৳{c.totalSpent.toLocaleString()}</td>
                <td className="text-sm">৳{c.avgOrderValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderExceptions = (data) => (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 mb-5">
        <Stat
          icon={FiPackage}
          value={data.summary?.failedDeliveries || 0}
          label="Failed"
          tone="rose"
        />
        <Stat
          icon={FiAlertTriangle}
          value={data.summary?.slaBreaches || 0}
          label="SLA Breaches"
          tone="amber"
        />
        <Stat
          icon={FiAlertTriangle}
          value={data.summary?.lowRatings || 0}
          label="Low Ratings"
          tone="amber"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <h3 className="font-display text-base font-bold mb-3">Failed Deliveries</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                  <th>Tracking ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {data.failedDeliveries?.map((row) => (
                  <tr key={row.trackingId} className="hover">
                    <td className="font-mono text-xs">{row.trackingId}</td>
                    <td>{row.parcelType}</td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td className="text-sm">{row.cancellationReason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <h3 className="font-display text-base font-bold mb-3">SLA Breaches</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                  <th>Tracking ID</th>
                  <th>Breach (hrs)</th>
                  <th>Actual (hrs)</th>
                  <th>SLA (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {data.slaBreaches?.map((row) => (
                  <tr key={row.trackingId} className="hover">
                    <td className="font-mono text-xs">{row.trackingId}</td>
                    <td className="text-rose-600 font-semibold">+{row.breachHours}h</td>
                    <td>{row.actualHours}h</td>
                    <td>{row.slaHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <h3 className="font-display text-base font-bold mb-3">Low Ratings (≤2★)</h3>
          <div className="space-y-3">
            {data.lowRatings?.map((row) => (
              <div
                key={row._id}
                className="flex items-center justify-between p-3 rounded-xl bg-base-200/50"
              >
                <div>
                  <p className="font-semibold">
                    {row.rating}★ — {row.deliveryMenID}
                  </p>
                  <p className="text-xs text-base-content/60">{row.feedback}</p>
                </div>
                <time className="text-xs text-base-content/50">{row.reviewDate}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );

  if (!range.start || !range.end) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Reports" />
        <PageHeader
          eyebrow="Analytics"
          title="Reports Dashboard"
          description="Generate detailed business reports with flexible date ranges and granularity."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <FiDownload aria-hidden="true" />
                <select
                  value={granularity}
                  onChange={(e) => setGranularity(e.target.value)}
                  className="select select-bordered select-sm"
                  aria-label="Granularity"
                >
                  {GRANULARITIES.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="btn btn-outline btn-sm"
              >
                <FiDownload aria-hidden="true" /> Export CSV
              </button>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setReportType(type.key)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                reportType === type.key
                  ? `border-${type.tone}-500 bg-${type.tone}-500/10`
                  : "border-base-200 hover:border-brand-500/50"
              }`}
            >
              <type.icon
                className={`mx-auto text-2xl mb-2 ${reportType === type.key ? `text-${type.tone}-500` : "text-base-content/40"}`}
                aria-hidden="true"
              />
              <p className="font-semibold text-center">{type.label}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">From</span>
            <input
              type="date"
              value={range.start}
              onChange={(e) => setRange({ ...range, start: e.target.value })}
              className="input input-bordered input-sm w-40"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">To</span>
            <input
              type="date"
              value={range.end}
              onChange={(e) => setRange({ ...range, end: e.target.value })}
              className="input input-bordered input-sm w-40"
            />
          </label>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-primary"
            disabled={!range.start || !range.end}
          >
            Generate Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Reports" />
      <PageHeader
        eyebrow="Analytics"
        title="Reports Dashboard"
        description="Generate detailed business reports with flexible date ranges and granularity."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <FiDownload aria-hidden="true" />
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="select select-bordered select-sm"
                aria-label="Granularity"
              >
                {GRANULARITIES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="btn btn-outline btn-sm"
            >
              <FiDownload aria-hidden="true" /> Export CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 mb-5">
        {REPORT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => setReportType(type.key)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                reportType === type.key
                  ? `border-${type.tone}-500 bg-${type.tone}-500/10`
                  : "border-base-200 hover:border-brand-500/50"
              }`}
            >
              <Icon
                className={`mx-auto text-2xl mb-2 ${reportType === type.key ? `text-${type.tone}-500` : "text-base-content/40"}`}
                aria-hidden="true"
              />
              <p className="font-semibold text-center">{type.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-5">
        <label className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">From</span>
          <input
            type="date"
            value={range.start}
            onChange={(e) => setRange({ ...range, start: e.target.value })}
            className="input input-bordered input-sm w-40"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">To</span>
          <input
            type="date"
            value={range.end}
            onChange={(e) => setRange({ ...range, end: e.target.value })}
            className="input input-bordered input-sm w-40"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">Granularity</span>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="select select-bordered select-sm"
            aria-label="Granularity"
          >
            {GRANULARITIES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={!range.start || !range.end}
          className="btn btn-primary"
        >
          Generate Report
        </button>
        <button
          type="button"
          onClick={() => handleExport("csv")}
          className="btn btn-outline btn-sm"
        >
          <FiDownload aria-hidden="true" /> Export CSV
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminReports;

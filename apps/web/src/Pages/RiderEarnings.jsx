import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiTrendingUp,
  FiTruck,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import Stat from "../Components/UI/Stat";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import { downloadCsv, toCsv } from "../lib/csv";

const RiderEarnings = () => {
  const axiosSecure = useAxiosSecure();
  const [range, setRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [view, setView] = useState("summary");

  const { data: earningsPage = {}, isLoading } = useQuery({
    queryKey: ["riderEarnings", range.start, range.end, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (range.start) params.append("startDate", range.start);
      if (range.end) params.append("endDate", range.end);
      params.append("page", page);
      const res = await axiosSecure.get(`/deliveryMen/earnings?${params}`);
      return res.data;
    },
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["riderEarningsStats", range.start, range.end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (range.start) params.append("startDate", range.start);
      if (range.end) params.append("endDate", range.end);
      const res = await axiosSecure.get(`/deliveryMen/earnings/stats?${params}`);
      return res.data;
    },
  });

  const earnings = earningsPage.earnings ?? [];
  const totalPages = Math.max(1, earningsPage.totalPages ?? 1);

  const handleExport = () => {
    if (earnings.length === 0) return;
    const csv = toCsv(
      [
        { header: "Date", value: (r) => r.date },
        { header: "Parcel ID", value: (r) => r.parcelId },
        { header: "Status", value: (r) => r.status },
        { header: "Amount (BDT)", value: (r) => r.price },
        { header: "Distance (km)", value: (r) => r.distance },
        { header: "Duration (min)", value: (r) => r.duration },
      ],
      earnings
    );
    downloadCsv("rider-earnings", csv);
  };

  const totalEarnings = Number(stats.totalEarnings) || 0;

  const statsData = [
    { icon: FiDollarSign, value: `৳${totalEarnings.toLocaleString()}`, label: "Total Earnings", tone: "emerald" },
    { icon: FiTruck, value: stats.totalDeliveries ?? 0, label: "Completed Deliveries", tone: "brand" },
    { icon: FiClock, value: stats.pendingDeliveries ?? 0, label: "Pending", tone: "amber" },
    { icon: FiTrendingUp, value: stats.avgRating ? `${Number(stats.avgRating).toFixed(1)}/5.0` : "—", label: "Avg Rating", tone: "violet" },
  ];

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | My Earnings" />
      <PageHeader
        eyebrow="Rider"
        title="My Earnings"
        description="Track your delivery earnings, performance metrics, and schedule."
        actions={
          <button type="button" onClick={handleExport} className="btn btn-outline btn-sm">
            <FiDownload aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        {statsData.map((s) => (
          <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">From</span>
            <input type="date" value={range.start} onChange={(e) => { setRange({ ...range, start: e.target.value }); setPage(1); }} className="input input-bordered input-sm w-36" />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm text-base-content/50">To</span>
            <input type="date" value={range.end} onChange={(e) => { setRange({ ...range, end: e.target.value }); setPage(1); }} className="input input-bordered input-sm w-36" />
          </label>
          <button type="button" onClick={() => { setRange({ start: "", end: "" }); setPage(1); }} className="btn btn-ghost btn-sm">Clear</button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setView("summary")} className={`btn btn-sm ${view === "summary" ? "btn-primary" : "btn-ghost"}`}>Summary</button>
          <button type="button" onClick={() => setView("schedule")} className={`btn btn-sm ${view === "schedule" ? "btn-primary" : "btn-ghost"}`}>Schedule</button>
          <button type="button" onClick={() => setView("history")} className={`btn btn-sm ${view === "history" ? "btn-primary" : "btn-ghost"}`}>History</button>
        </div>
      </div>

      <div className="mt-3">
        {view === "summary" && (
          <>
            {isLoading ? (
              <div className="animate-pulse space-y-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                        <th>Date</th>
                        <th>Parcel ID</th>
                        <th>Status</th>
                        <th className="text-right">Amount</th>
                        <th>Distance</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-base-content/50">No earnings in this period</td>
                        </tr>
                      ) : (
                        earnings.map((e) => (
                          <tr key={e.id} className="hover">
                            <td>{e.date}</td>
                            <td className="font-mono text-sm">{e.parcelId?.slice(-8)}</td>
                            <td>
                              <span className={`badge badge-xs ${e.status === "delivered" ? "badge-success" : e.status === "cancelled" ? "badge-error" : "badge-warning"}`}>{e.status}</span>
                            </td>
                            <td className="text-right font-semibold">৳{Number(e.price || 0).toLocaleString()}</td>
                            <td>{e.distance ? `${e.distance} km` : "—"}</td>
                            <td>{e.duration ? `${e.duration} min` : "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <nav className="flex justify-center items-center gap-1" aria-label="Pagination">
                    <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page"><FiChevronLeft /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${page === p ? "btn-primary" : "btn-ghost"}`}>{p}</button>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page"><FiChevronRight /></button>
                  </nav>
                </div>
              </>
            )}
          </>
        )}

        {view === "schedule" && (
          <div>
            <PageHeader
              eyebrow="Rider"
              title="My Schedule"
              description="Upcoming and recent deliveries assigned to you."
            />
            <div className="space-y-3">
              <EmptyState
                icon={FiCalendar}
                title="No scheduled deliveries"
                body="New assignments will appear here automatically."
              />
            </div>
          </div>
        )}

        {view === "history" && (
          <div>
            <PageHeader
              eyebrow="Rider"
              title="Delivery History"
              description="Complete history of all your deliveries."
            />
            {isLoading ? (
              <div className="animate-pulse space-y-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                      <th>Date</th>
                      <th>Parcel ID</th>
                      <th>Status</th>
                      <th className="text-right">Amount</th>
                      <th>Distance</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-base-content/50">No delivery history</td>
                      </tr>
                    ) : (
                      earnings.map((e) => (
                        <tr key={e.id} className="hover">
                          <td>{e.date}</td>
                          <td className="font-mono text-sm">{e.parcelId?.slice(-8)}</td>
                          <td><span className={`badge badge-xs ${e.status === "delivered" ? "badge-success" : e.status === "cancelled" ? "badge-error" : "badge-warning"}`}>{e.status}</span></td>
                          <td className="text-right font-semibold">৳{Number(e.price || 0).toLocaleString()}</td>
                          <td>{e.distance ? `${e.distance} km` : "—"}</td>
                          <td>{e.duration ? `${e.duration} min` : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderEarnings;

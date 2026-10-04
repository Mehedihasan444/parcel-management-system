import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import { notify } from "../lib/notify";
import { confirmAction } from "../lib/confirm";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import ReviewPage from "./ReviewPage";
import { FiBox, FiCheckCircle, FiClock, FiCreditCard } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import StatusPill from "../Components/UI/StatusPill";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import Stat from "../Components/UI/Stat";

const FILTERS = ["delivered", "pending", "On The Way", "returned", "cancelled"];
const PAGE_SIZE = 8;

const shortId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "—");

const My_Parcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [stat, setStat] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const trackingQuery = (searchParams.get("q") || "").trim().toLowerCase();

  const {
    data: parcels = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["parcels", user?.email, stat],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/bookings/${user?.email}?status=${stat}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });

  const visibleParcels = useMemo(() => {
    const filtered = trackingQuery
      ? parcels.filter((item) =>
          [
            item?._id,
            item?.parcelType,
            item?.receiverName,
            item?.status,
            item?.requestedDeliveryDate,
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(trackingQuery))
        )
      : [...parcels];
    return filtered.sort((a, b) =>
      String(b?.bookingDate || "")?.localeCompare(String(a?.bookingDate || ""))
    );
  }, [parcels, trackingQuery]);

  const totalPages = Math.max(1, Math.ceil(visibleParcels.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visibleParcels.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = useMemo(() => {
    const inTransit = parcels.filter((p) => ["pending", "On The Way"].includes(p?.status)).length;
    const delivered = parcels.filter((p) => p?.status === "delivered").length;
    const value = parcels.reduce((s, p) => s + (Number(p?.price) || 0), 0);
    return [
      { icon: FiBox, value: parcels.length, label: "Shipments", tone: "brand" },
      { icon: FiClock, value: inTransit, label: "In transit", tone: "amber" },
      { icon: FiCheckCircle, value: delivered, label: "Delivered", tone: "emerald" },
      { icon: FiCreditCard, value: `৳${value}`, label: "Total value", tone: "sky" },
    ];
  }, [parcels]);

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Cancel this parcel?",
      message: "You won't be able to revert this!",
      confirmLabel: "Yes, delete it!",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await axiosSecure.delete(`/users/bookings/${id}`);
      if (res.data.deletedCount > 0) {
        refetch();
        notify.success("Parcel deleted");
      } else {
        notify.error("Something went wrong");
      }
    } catch {
      notify.error("Something went wrong");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${parcels.length} shipment${parcels.length === 1 ? "" : "s"}`}
        title="My parcels"
        description="Track every booking, pay outstanding balances and review delivered parcels."
        actions={
          <Link
            to="/dashboard/bookAParcel"
            className="btn border-0 bg-brand-500 text-white hover:bg-brand-600"
          >
            Book a parcel
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <SearchInput
          value={searchParams.get("q") || ""}
          onChange={(v) => {
            setSearchParams(v ? { q: v } : {});
            setPage(1);
          }}
          placeholder="Search ID, type, receiver, status…"
          label="Search parcels"
        />
        <select
          className="select select-bordered select-sm"
          value={stat}
          onChange={(e) => {
            setStat(e.target.value);
            setPage(1);
            refetch();
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-base-content/55">
          {visibleParcels.length} of {parcels.length} shown
        </span>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={4} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={trackingQuery || stat ? "No parcels match" : "No parcels here yet"}
            body={
              trackingQuery || stat
                ? "Try a different search or status filter."
                : "Book your first shipment and it will show up here with live tracking."
            }
            action={
              trackingQuery || stat ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setSearchParams({});
                    setStat("");
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/dashboard/bookAParcel"
                  className="btn border-0 bg-brand-500 text-white hover:bg-brand-600"
                >
                  Book a parcel
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
              <table className="table">
                <thead>
                  <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                    <th>Tracking</th>
                    <th>Parcel</th>
                    <th>Requested date</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems?.map((item) => (
                    <tr key={item._id} className="hover">
                      <td className="font-mono text-xs" title={item?._id}>
                        {shortId(item?._id)}
                      </td>
                      <td>
                        <p className="font-semibold">{item?.parcelType}</p>
                        <p className="text-xs text-base-content/55">
                          {item?.bookingDate?.split?.("T")?.[0]}
                        </p>
                      </td>
                      <td className="text-sm">
                        <p>{item?.requestedDeliveryDate}</p>
                        {item?.approximateDeliveryDate && (
                          <p className="text-xs text-base-content/55">
                            ETA {item.approximateDeliveryDate}
                          </p>
                        )}
                      </td>
                      <td>
                        <StatusPill status={item?.status} />
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          {item?.status === "delivered" && <ReviewPage id={item?._id} />}
                          {item?.status === "pending" && (
                            <>
                              <Link to={`/dashboard/updateBooking/${item?._id}`}>
                                <button className="btn btn-sm btn-ghost">Update</button>
                              </Link>
                              <button
                                onClick={() => handleDelete(item?._id)}
                                className="btn btn-sm text-error hover:bg-error/10"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <Link to={`/dashboard/payments/${item?._id}`}>
                            <button className="btn btn-sm btn-outline">
                              {item?.price ? `Pay ৳${item.price}` : "Pay"}
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default My_Parcels;

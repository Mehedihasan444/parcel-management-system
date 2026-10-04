import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import { notify } from "../lib/notify";
import { confirmAction } from "../lib/confirm";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { FiCheckCircle, FiClock, FiPackage, FiTruck } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import StatusPill from "../Components/UI/StatusPill";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import Stat from "../Components/UI/Stat";
import { useMemo, useState } from "react";

const PAGE_SIZE = 8;

const My_Delivery_List = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [stat, setStat] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: userData = {} } = useQuery({
    queryKey: ["userData", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });

  const {
    data: deliveryList = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["deliveryList", userData?._id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/deliveryMen/deliveryList/${userData._id}`);
      return res.data;
    },
    enabled: Boolean(userData?._id),
  });

  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = deliveryList.filter((item) => {
      const statusOk = !stat || String(item?.status || "").toLowerCase() === stat.toLowerCase();
      const queryOk =
        !q ||
        [item?.name, item?.receiverName, item?.requestedDeliveryDate]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return statusOk && queryOk;
    });
    return filtered.sort((a, b) =>
      String(b?.requestedDeliveryDate || "").localeCompare(String(a?.requestedDeliveryDate || ""))
    );
  }, [deliveryList, stat, query]);

  const totalPages = Math.max(1, Math.ceil(visibleList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visibleList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const queueStats = useMemo(() => {
    const lower = (s) => String(s || "").toLowerCase();
    return [
      { icon: FiTruck, value: deliveryList.length, label: "Assigned", tone: "brand" },
      {
        icon: FiClock,
        value: deliveryList.filter((d) => ["pending", "on the way"].includes(lower(d?.status)))
          .length,
        label: "Active",
        tone: "amber",
      },
      {
        icon: FiCheckCircle,
        value: deliveryList.filter((d) => lower(d?.status) === "delivered").length,
        label: "Delivered",
        tone: "emerald",
      },
    ];
  }, [deliveryList]);

  const handleDelete = async (id) => {
    const confirmed = await confirmAction({
      title: "Cancel this delivery?",
      message: "You won't be able to revert this!",
      confirmLabel: "Yes, cancel it!",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      const res = await axiosSecure.patch(`/deliveryMen/deliveryList/cancel/deliver/${id}`, {
        status: "Cancelled",
      });
      if (res.data.modifiedCount > 0) {
        refetch();
        notify.success("Parcel cancelled");
      } else {
        notify.error("Something went wrong");
      }
    } catch {
      notify.error("Something went wrong");
    }
  };

  const handleDeliver = async (id) => {
    const confirmed = await confirmAction({
      title: "Mark as delivered?",
      message: "Confirm the parcel reached the receiver.",
      confirmLabel: "Yes, delivered!",
      tone: "warning",
    });
    if (!confirmed) return;
    try {
      const res = await axiosSecure.patch(`/deliveryMen/deliveryList/cancel/deliver/${id}`, {
        status: "Delivered",
      });
      if (res.data.modifiedCount > 0) {
        refetch();
        notify.success("Parcel marked as delivered");
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
        eyebrow={`${deliveryList.length} assigned`}
        title="My delivery list"
        description="Track, update and complete your assigned deliveries."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {queueStats.map((s) => (
          <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} tone={s.tone} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Search name, receiver, date…"
          label="Search deliveries"
        />
        <select
          className="select select-bordered select-sm"
          value={stat}
          onChange={(e) => {
            setStat(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="On The Way">On The Way</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="ml-auto text-xs text-base-content/55">
          {visibleList.length} of {deliveryList.length} shown
        </span>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={FiPackage}
            title={stat || query ? "No deliveries match" : "No deliveries assigned"}
            body={
              stat || query
                ? "Try a different search or status filter."
                : "When an admin assigns you a parcel, it will appear here with live tracking."
            }
            action={
              stat || query ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setStat("");
                    setQuery("");
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
              <table className="table">
                <thead>
                  <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                    <th>#</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Requested date</th>
                    <th>ETA</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems?.map((item, idx) => (
                    <tr key={item._id} className="hover">
                      <th>{(safePage - 1) * PAGE_SIZE + idx + 1}</th>
                      <td className="font-semibold">{item?.name}</td>
                      <td>{item?.receiverName}</td>
                      <td className="text-sm">{item?.requestedDeliveryDate}</td>
                      <td className="text-sm">{item?.approximateDeliveryDate || "—"}</td>
                      <td>
                        <StatusPill status={item?.status} />
                      </td>
                      <td>
                        <div className="flex justify-end gap-1.5">
                          <Link
                            to={`/dashboard/viewLocation/${item?.deliveryAddressLatitude},${item?.deliveryAddressLongitude}`}
                          >
                            <button className="btn btn-sm btn-primary">View location</button>
                          </Link>
                          {item?.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="btn btn-sm text-error hover:bg-error/10"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeliver(item._id)}
                                className="btn btn-sm btn-success text-white"
                              >
                                Deliver
                              </button>
                            </>
                          )}
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

export default My_Delivery_List;

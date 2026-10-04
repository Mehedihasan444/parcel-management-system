import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiBox, FiDownload, FiTruck, FiTrash2, FiCheckSquare, FiSquare } from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import AllParcelsTable from "../Components/AllParcelsTable/AllParcelsTable";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import { downloadCsv, toCsv } from "../lib/csv";
import { notify } from "../lib/notify";
import { confirmAction } from "../lib/confirm";

const PAGE_SIZE = 10;

const All_Parcels = () => {
  const axiosSecure = useAxiosSecure();
  const [range, setRange] = useState({ start: "", end: "" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/users/collection");
      return res.data;
    },
  });

  const { data: allParcels = [], isLoading } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  const { data: deliveryMen = [] } = useQuery({
    queryKey: ["deliveryMen"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin");
      return res.data.filter((u) => u.role === "deliveryMen");
    },
  });

  const bookings = useMemo(() => {
    const emails = new Set(users.map((u) => u?.email?.toLowerCase()));
    const q = query.trim().toLowerCase();
    return allParcels
      .filter((item) => emails.has(item?.email?.toLowerCase()) && item?.status === "pending")
      .filter((item) => {
        if (range.start && range.end) {
          const date = item?.requestedDeliveryDate;
          if (!(date >= range.start && date <= range.end)) return false;
        }
        return (
          !q ||
          [item?.name, item?.email, item?.phone, item?.parcelType, item?.receiverName]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
      })
      .sort((a, b) => String(b?.bookingDate || "").localeCompare(String(a?.bookingDate || "")));
  }, [allParcels, users, range, query]);

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = bookings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const csv = toCsv(
      [
        { header: "Name", value: (r) => r.name },
        { header: "Email", value: (r) => r.email },
        { header: "Phone", value: (r) => r.phone },
        { header: "Parcel type", value: (r) => r.parcelType },
        { header: "Weight", value: (r) => r.weight },
        { header: "Receiver", value: (r) => r.receiverName },
        { header: "Requested date", value: (r) => r.requestedDeliveryDate },
        { header: "Booking date", value: (r) => String(r.bookingDate || "").split("T")[0] },
        { header: "Price (BDT)", value: (r) => r.price },
      ],
      bookings
    );
    downloadCsv("pending-parcels", csv);
  };

  const filtering = range.start || range.end || query;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(pageItems.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((id) => id !== id)));
  };

  const handleBulkAssign = async () => {
    if (!selectedIds.length) return;
    const confirmed = await confirmAction({
      title: "Assign delivery partner?",
      message: `${selectedIds.length} parcels will be assigned to the selected rider.`,
      confirmLabel: "Yes, assign",
      tone: "warning",
    });
    if (!confirmed) return;

    try {
      const res = await axiosSecure.post("/users/bookings/bulk/assign", {
        ids: selectedIds,
        selectedDeliveryMen: bulkAction.selectedDeliveryMen,
        approximateDeliveryDate: bulkAction.approximateDeliveryDate,
      });
      if (res.data.modifiedCount > 0) {
        notify.success(`${res.data.modifiedCount} parcels assigned`);
        setSelectedIds([]);
        setBulkAction(null);
      } else {
        notify.warning("No parcels were assigned");
      }
    } catch {
      notify.error("Assignment failed");
    }
  };

  const handleBulkStatus = async () => {
    if (!selectedIds.length) return;
    const confirmed = await confirmAction({
      title: `Mark as ${bulkAction.status}?`,
      message: `${selectedIds.length} parcels will be updated.`,
      confirmLabel: "Yes, update",
      tone: "warning",
    });
    if (!confirmed) return;

    try {
      const res = await axiosSecure.patch("/users/bookings/bulk/status", {
        ids: selectedIds,
        status: bulkAction.status,
      });
      if (res.data.modifiedCount > 0) {
        notify.success(`${res.data.modifiedCount} parcels updated`);
        setSelectedIds([]);
        setBulkAction(null);
      } else {
        notify.warning("No parcels were updated");
      }
    } catch {
      notify.error("Status update failed");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = await confirmAction({
      title: "Delete parcels?",
      message: `${selectedIds.length} parcels will be permanently deleted.`,
      confirmLabel: "Yes, delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await axiosSecure.delete("/users/bookings/bulk", {
        data: { ids: selectedIds },
      });
      if (res.data.deletedCount > 0) {
        notify.success(`${res.data.deletedCount} parcels deleted`);
        setSelectedIds([]);
      } else {
        notify.warning("No parcels were deleted");
      }
    } catch {
      notify.error("Delete failed");
    }
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="All parcels"
        description="Filter and manage all pending shipments across the network."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={bookings.length === 0}
            className="btn btn-outline btn-sm"
          >
            <FiDownload aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Search name, email, parcel…"
          label="Search parcels"
        />
        <input
          type="date"
          aria-label="Start date"
          value={range.start}
          className="input input-bordered input-sm w-36"
          onChange={(e) => {
            setRange((r) => ({ ...r, start: e.target.value }));
            setPage(1);
          }}
        />
        <input
          type="date"
          aria-label="End date"
          value={range.end}
          className="input input-bordered input-sm w-36"
          onChange={(e) => {
            setRange((r) => ({ ...r, end: e.target.value }));
            setPage(1);
          }}
        />
        {filtering && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setRange({ start: "", end: "" });
              setQuery("");
              setPage(1);
            }}
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-base-content/55">{bookings.length} pending</span>
      </div>

      {/* Bulk action bar */}
      {hasSelection && (
        <div className="mt-3 p-4 rounded-3xl border border-brand-500/25 bg-brand-500/5 flex flex-wrap items-center gap-3">
          <FiCheckSquare className="text-brand-500" aria-hidden="true" />
          <span className="font-semibold">{selectedIds.length} selected</span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <select
              value={bulkAction?.selectedDeliveryMen || ""}
              onChange={(e) =>
                setBulkAction((prev) => ({ ...prev, selectedDeliveryMen: e.target.value }))
              }
              className="select select-bordered select-sm w-48"
              aria-label="Select rider"
            >
              <option value="">Select rider</option>
              {deliveryMen
                .filter((r) => r.role === "deliveryMen")
                .map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={bulkAction?.approximateDeliveryDate || ""}
              onChange={(e) =>
                setBulkAction((prev) => ({ ...prev, approximateDeliveryDate: e.target.value }))
              }
              className="input input-bordered input-sm w-36"
              placeholder="Delivery date"
            />
            <button
              type="button"
              onClick={handleBulkAssign}
              disabled={!bulkAction?.selectedDeliveryMen || !bulkAction?.approximateDeliveryDate}
              className="btn btn-primary btn-sm"
            >
              <FiTruck aria-hidden="true" /> Assign
            </button>

            <select
              value={bulkAction?.status || ""}
              onChange={(e) => setBulkAction((prev) => ({ ...prev, status: e.target.value }))}
              className="select select-bordered select-sm w-36"
              aria-label="Select status"
            >
              <option value="">Set status</option>
              <option value="assigned">Assigned</option>
              <option value="On The Way">On The Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
            <button
              type="button"
              onClick={handleBulkStatus}
              disabled={!bulkAction?.status}
              className="btn btn-primary btn-sm"
            >
              Update Status
            </button>

            <button type="button" onClick={handleBulkDelete} className="btn btn-error btn-sm">
              <FiTrash2 aria-hidden="true" /> Delete
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="btn btn-ghost btn-sm"
            >
              <FiSquare aria-hidden="true" /> Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={FiBox}
            title={filtering ? "No parcels match" : "No pending parcels"}
            body={
              filtering
                ? "Try a different search or date range."
                : "Every shipment is assigned — nothing waiting in the queue."
            }
            action={
              filtering ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setRange({ start: "", end: "" });
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
                <thead className="border">
                  <tr className="text-base">
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          pageItems.length &&
                          pageItems.every((item) => selectedIds.includes(item._id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all"
                      />
                    </th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Requested delivery date</th>
                    <th>Booking date</th>
                    <th>Cost</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AllParcelsTable
                    bookings={pageItems}
                    selectedIds={selectedIds}
                    onSelect={handleSelectOne}
                  />
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

export default All_Parcels;

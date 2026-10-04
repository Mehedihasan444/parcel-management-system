import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { FiCreditCard, FiCheckCircle, FiClock, FiDownload } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import StatusPill from "../Components/UI/StatusPill";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import Stat from "../Components/UI/Stat";
import { downloadCsv, toCsv } from "../lib/csv";

const PAGE_SIZE = 8;

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments/${user?.email}`);
      return res.data;
    },
    enabled: Boolean(user?.email),
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? payments.filter((p) =>
          [p?.transactionId, p?.status]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : [...payments];
    return filtered.sort((a, b) => String(b?.date || "").localeCompare(String(a?.date || "")));
  }, [payments, query]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const paid = useMemo(
    () => payments.filter((p) => String(p?.status).toLowerCase() === "completed"),
    [payments]
  );
  const totalPaid = paid.reduce((s, p) => s + (Number(p?.price) || 0), 0);

  const stats = [
    { icon: FiCreditCard, value: payments.length, label: "Transactions", tone: "brand" },
    { icon: FiCheckCircle, value: paid.length, label: "Completed", tone: "emerald" },
    { icon: FiClock, value: payments.length - paid.length, label: "Other", tone: "amber" },
    { icon: FiCreditCard, value: `৳${totalPaid}`, label: "Total paid", tone: "sky" },
  ];

  const exportCsv = () => {
    const csv = toCsv(
      [
        { header: "Transaction ID", value: (r) => r.transactionId },
        { header: "Date", value: (r) => String(r.date || "").split("T")[0] },
        { header: "Amount (BDT)", value: (r) => r.price },
        { header: "Status", value: (r) => r.status },
        { header: "Parcel ID", value: (r) => r.parcelId },
      ],
      visible
    );
    downloadCsv("payment-history", csv);
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${payments.length} transaction${payments.length === 1 ? "" : "s"}`}
        title="Payment history"
        description="Every charge with receipts you can reconcile in seconds."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={visible.length === 0}
            className="btn btn-outline btn-sm"
          >
            <FiDownload aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
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
          placeholder="Search transaction ID or status…"
          label="Search payments"
        />
        <span className="ml-auto text-xs text-base-content/55">
          {visible.length} of {payments.length} shown
        </span>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={FiCreditCard}
            title={query ? "No payments match" : "No payments yet"}
            body={
              query
                ? "Try a different transaction ID or status."
                : "Your payment history will appear here after you complete your first booking."
            }
            action={
              query ? (
                <button type="button" className="btn btn-ghost" onClick={() => setQuery("")}>
                  Clear search
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
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems?.map((item, i) => (
                    <tr key={item._id} className="hover">
                      <td className="text-sm">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-mono text-xs" title={item?.transactionId}>
                        {item?.transactionId?.length > 24
                          ? `${item.transactionId.slice(0, 12)}…${item.transactionId.slice(-8)}`
                          : item?.transactionId}
                      </td>
                      <td className="text-sm">{item?.date?.split?.("T")?.[0]}</td>
                      <td className="font-semibold">৳{item?.price}</td>
                      <td>
                        <StatusPill status={item?.status} />
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

export default PaymentHistory;

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiDownload, FiTruck } from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import DeliveryCounter from "../Components/DeliveryCounter/DeliveryCounter";
import AverageReviewCal from "../Components/AverageReviewCal/AverageReviewCal";
import PageHeader from "../Components/UI/PageHeader";
import StatusPill from "../Components/UI/StatusPill";
import Avatar from "../Components/UI/Avatar";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import EmptyState from "../Components/UI/EmptyState";
import { downloadCsv, toCsv } from "../lib/csv";

const PAGE_SIZE = 8;

const All_Delivery_Men = () => {
  const axiosSecure = useAxiosSecure();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: allDeliveryMen = [], isLoading } = useQuery({
    queryKey: ["allDeliveryMen"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/deliveryMens");
      return res.data;
    },
  });

  const riders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDeliveryMen
      .filter(
        (r) =>
          !q ||
          [r?.name, r?.email, r?.phone]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
      )
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [allDeliveryMen, query]);

  const totalPages = Math.max(1, Math.ceil(riders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = riders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const csv = toCsv(
      [
        { header: "Name", value: (r) => r.name },
        { header: "Email", value: (r) => r.email },
        { header: "Phone", value: (r) => r.phone },
        { header: "Status", value: (r) => r.status },
      ],
      riders
    );
    downloadCsv("delivery-partners", csv);
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${riders.length} of ${allDeliveryMen.length} partners`}
        title="Delivery partners"
        description="Monitor performance and workload across the rider fleet."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={riders.length === 0}
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
          placeholder="Search name, email, phone…"
          label="Search riders"
        />
        <span className="ml-auto text-xs text-base-content/55">{riders.length} shown</span>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon={FiTruck}
            title={query ? "No riders match" : "No delivery partners yet"}
            body={
              query
                ? "Try a different search."
                : "Promote a user to rider from All Users to build the fleet."
            }
            action={
              query ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                >
                  Clear search
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-3xl border border-base-200 bg-base-100 shadow-sm">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                    <th>Rider</th>
                    <th>Contact</th>
                    <th>Delivered</th>
                    <th>Avg rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems?.map((item) => (
                    <tr key={item._id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={item?.image}
                            name={item?.name}
                            email={item?.email}
                            className="h-10 w-10 rounded-full text-xs"
                          />
                          <span className="font-semibold">{item?.name}</span>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-base-content/70">{item?.email}</p>
                        <p className="text-xs text-base-content/55">{item?.phone || "—"}</p>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                          <FiTruck className="text-base-content/40" aria-hidden="true" />
                          <DeliveryCounter id={item._id} />
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-300">
                          ★ <AverageReviewCal id={item._id} />
                        </span>
                      </td>
                      <td>
                        <StatusPill status={item?.status || "active"} />
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

export default All_Delivery_Men;

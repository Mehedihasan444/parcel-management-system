import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiDownload, FiTruck, FiUserPlus, FiUsers } from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { notify } from "../lib/notify";
import { confirmAction } from "../lib/confirm";
import PageHeader from "../Components/UI/PageHeader";
import NumberOfParcelBooked from "../Components/NumberOfParcelBooked/NumberOfParcelBooked";
import TotalSpendAmountCal from "../Components/TotalSpendAmountCal/TotalSpendAmountCal";
import StatusPill from "../Components/UI/StatusPill";
import SearchInput from "../Components/UI/SearchInput";
import Pagination from "../Components/UI/Pagination";
import TableSkeleton from "../Components/UI/TableSkeleton";
import EmptyState from "../Components/UI/EmptyState";
import { downloadCsv, toCsv } from "../lib/csv";

const PAGE_SIZE = 8;
const ROLE_FILTERS = ["user", "deliveryMen", "admin"];

const All_Users = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");

  // Full roster (one request, shared with the per-row parcel/spend cells):
  // server-side paging cannot search across pages, so paging happens here.
  const {
    data: allUsers = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["allUsersDirectory"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin");
      return res.data;
    },
  });

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allUsers
      .filter((u) => !role || u?.role === role)
      .filter(
        (u) =>
          !q ||
          [u?.name, u?.email, u?.phone]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
      )
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [allUsers, query, role]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageUsers = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeRole = async (email, nextRole, label) => {
    const confirmed = await confirmAction({
      title: `Make ${label}?`,
      message: `${email} will get the ${nextRole} role.`,
      confirmLabel: `Yes, make ${label}`,
      tone: "warning",
    });
    if (!confirmed) return;
    try {
      await axiosSecure.patch(`/users/${email}`, { role: nextRole });
      notify.success(`${email} is now ${label}`);
      refetch();
    } catch {
      notify.error("Role change failed");
    }
  };

  const handleMakeAdmin = (email) => changeRole(email, "admin", "admin");
  const handleMakeDeliveryMen = (email) => changeRole(email, "deliveryMen", "rider");

  const exportCsv = () => {
    const csv = toCsv(
      [
        { header: "Name", value: (r) => r.name },
        { header: "Email", value: (r) => r.email },
        { header: "Phone", value: (r) => r.phone },
        { header: "Role", value: (r) => r.role },
      ],
      users
    );
    downloadCsv("users", csv);
  };

  const filtering = query || role;

  return (
    <>
      <PageHeader
        eyebrow={`${users.length} of ${allUsers.length} users`}
        title="Manage all users"
        description="Search, filter, promote and change roles across the platform."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={users.length === 0}
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
            setCurrentPage(1);
          }}
          placeholder="Search name, email, phone…"
          label="Search users"
        />
        <select
          className="select select-bordered select-sm"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {filtering && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setQuery("");
              setRole("");
              setCurrentPage(1);
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <TableSkeleton columns={7} />
        ) : pageUsers.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title={filtering ? "No users match" : "No users found"}
            body={
              filtering
                ? "Try a different search or role filter."
                : "New sign-ups will appear here."
            }
            action={
              filtering ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setQuery("");
                    setRole("");
                    setCurrentPage(1);
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
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/50 text-xs uppercase tracking-wider text-base-content/60">
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Parcels</th>
                    <th>Spent</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageUsers?.map((item, i) => (
                    <tr key={item._id} className="hover">
                      <td className="text-sm">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="font-semibold">{item?.name}</td>
                      <td className="text-sm text-base-content/70">{item?.email}</td>
                      <td className="text-sm">{item?.phone || "—"}</td>
                      <td>
                        <StatusPill status={item?.role} />
                      </td>
                      <td className="text-sm">
                        <NumberOfParcelBooked email={item?.email} />
                      </td>
                      <td className="text-sm">
                        <TotalSpendAmountCal email={item?.email} />
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleMakeDeliveryMen(item?.email)}
                            disabled={item.role === "deliveryMen"}
                            className="btn btn-sm btn-primary"
                          >
                            <FiTruck className="mr-1" /> Delivery
                          </button>
                          <button
                            onClick={() => handleMakeAdmin(item?.email)}
                            disabled={item.role === "admin"}
                            className="btn btn-sm btn-accent"
                          >
                            <FiUserPlus className="mr-1" /> Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default All_Users;

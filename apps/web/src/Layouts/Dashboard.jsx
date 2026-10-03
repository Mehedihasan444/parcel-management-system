import {
  FiBox,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMail,
  FiPackage,
  FiTruck,
  FiUsers,
  FiCreditCard,
  FiUser,
  FiStar,
  FiMenu,
  FiSettings,
  FiFileText,
} from "react-icons/fi";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import useAdmin from "../Hooks/useAdmin";
import useDeliveryMen from "../Hooks/useDeliveryMen";
import useAuth from "../Hooks/useAuth";
import ThemeToggle from "../Components/Seo/ThemeToggle";
import Avatar from "../Components/UI/Avatar";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
  }`;

const Dashboard = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isDeliveryMen, isDeliveryMenLoading] = useDeliveryMen();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const rolesLoading = isAdminLoading || isDeliveryMenLoading;

  const handleLogout = async () => {
    await logOut().catch(() => {});
    navigate("/");
  };

  const closeDrawer = () => {
    const el = document.getElementById("dashboard-drawer");
    if (el instanceof HTMLInputElement) el.checked = false;
  };

  const role = rolesLoading ? "…" : isAdmin ? "Admin" : isDeliveryMen ? "Rider" : "Customer";
  const roleBadge = isAdmin ? "badge-primary" : isDeliveryMen ? "badge-secondary" : "badge-accent";

  const links = isAdmin
    ? [
        { to: "/dashboard/adminHome", label: "Admin home", icon: FiGrid },
        { to: "/dashboard/allParcels", label: "All parcels", icon: FiBox },
        { to: "/dashboard/allUsers", label: "All users", icon: FiUsers },
        { to: "/dashboard/allDeliveryMen", label: "Delivery partners", icon: FiTruck },
      ]
      : isDeliveryMen
        ? [
            { to: "/dashboard/myDeliveryList", label: "My delivery list", icon: FiTruck },
            { to: "/dashboard/myReviews", label: "My reviews", icon: FiStar },
            { to: "/dashboard/myEarnings", label: "My earnings", icon: FiCreditCard },
          ]
        : [
            { to: "/dashboard/bookAParcel", label: "Book a parcel", icon: FiPackage },
            { to: "/dashboard/myParcels", label: "My parcels", icon: FiBox },
            { to: "/dashboard/paymentHistory", label: "Payment history", icon: FiCreditCard },
            { to: "/dashboard/myProfile", label: "My profile", icon: FiUser },
            { to: "/dashboard/settings", label: "Settings", icon: FiSettings },
          ];

  return (
    <div className="drawer min-h-screen bg-base-200 lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content relative flex min-h-screen flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-500/10 via-brand-500/[0.04] to-transparent"
        />
        <div className="sticky top-0 z-30 border-b border-base-200/60 bg-base-100/85 glass">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <label
                htmlFor="dashboard-drawer"
                className="btn btn-ghost btn-circle lg:hidden"
                aria-label="Open dashboard menu"
              >
                <FiMenu className="text-xl" />
              </label>
              <span className={`badge ${roleBadge} badge-sm font-semibold`}>{role}</span>
              <span className="hidden text-sm text-base-content/50 sm:inline">
                Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Link to="/" className="btn btn-ghost btn-sm">
                <FiHome aria-hidden="true" /> Site
              </Link>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <Toaster position="top-right" richColors closeButton gap={8} />
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-80 flex-col border-r border-base-200 bg-base-100">
          <Link
            to="/"
            onClick={closeDrawer}
            className="flex h-16 shrink-0 items-center gap-2.5 border-b border-base-200/60 px-6"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <FiPackage className="text-lg" />
            </span>
            <span className="font-display text-lg font-bold">
              RapidParcel<span className="text-brand-500">Hub</span>
            </span>
          </Link>

          <div className="flex flex-1 flex-col p-4">
            <nav className="mt-2 grid gap-1" aria-label="Dashboard">
              <p className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/40">
                Workspace
              </p>
              {rolesLoading ? (
                <div className="grid gap-1" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-11 rounded-xl" />
                  ))}
                </div>
              ) : (
                links.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass} onClick={closeDrawer}>
                    <Icon className="text-base" aria-hidden="true" />
                    {label}
                  </NavLink>
                ))
              )}
            </nav>

            <div className="divider my-4" />

            <nav className="grid gap-1" aria-label="General">
              <p className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/40">
                General
              </p>
              <NavLink to="/" className={linkClass} onClick={closeDrawer}>
                <FiHome className="text-base" aria-hidden="true" /> Home
              </NavLink>
              <NavLink to="/dashboard/contact" className={linkClass} onClick={closeDrawer}>
                <FiMail className="text-base" aria-hidden="true" /> Contact
              </NavLink>
              <NavLink to="/pricing" className={linkClass} onClick={closeDrawer}>
                <FiCreditCard className="text-base" aria-hidden="true" /> Pricing
              </NavLink>
              <NavLink to="/faq" className={linkClass} onClick={closeDrawer}>
                <FiFileText className="text-base" aria-hidden="true" /> FAQ
              </NavLink>
              <NavLink to="/help" className={linkClass} onClick={closeDrawer}>
                <FiMail className="text-base" aria-hidden="true" /> Help & Support
              </NavLink>
            </nav>

            <div className="mt-auto rounded-2xl border border-base-200 bg-base-200/50 p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.image}
                  name={user?.name}
                  email={user?.email}
                  className="h-10 w-10 rounded-full text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {user?.name || user?.email || "Guest"}
                  </p>
                  <p className="truncate text-xs text-base-content/60">{user?.email || ""}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                >
                  <FiLogOut />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

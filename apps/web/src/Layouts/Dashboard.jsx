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
} from "react-icons/fi";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import useAdmin from "../Hooks/useAdmin";
import useDeliveryMen from "../Hooks/useDeliveryMen";
import useAuth from "../Hooks/useAuth";
import ThemeToggle from "../Components/Seo/ThemeToggle";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
  }`;

const Dashboard = () => {
  const [isAdmin] = useAdmin();
  const [isDeliveryMen] = useDeliveryMen();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut().catch(() => {});
    navigate("/");
  };

  const role = isAdmin ? "Admin" : isDeliveryMen ? "Rider" : "Customer";
  const roleBadge = isAdmin
    ? "badge-primary"
    : isDeliveryMen
      ? "badge-secondary"
      : "badge-accent";

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
        ]
      : [
          { to: "/dashboard/bookAParcel", label: "Book a parcel", icon: FiPackage },
          { to: "/dashboard/myParcels", label: "My parcels", icon: FiBox },
          { to: "/dashboard/paymentHistory", label: "Payment history", icon: FiCreditCard },
          { to: "/dashboard/myProfile", label: "My profile", icon: FiUser },
        ];

  return (
    <div className="drawer min-h-screen bg-base-200/40 lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen flex-col">
        <div className="sticky top-0 z-30 border-b border-base-200 bg-base-100/85 glass">
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
                Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""} 👋
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
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="dashboard-drawer" aria-label="Close menu" className="drawer-overlay" />
        <aside className="flex min-h-full w-80 flex-col bg-base-100 p-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-2xl px-2 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <FiPackage className="text-lg" />
            </span>
            <span className="font-display text-lg font-bold">
              RapidParcel<span className="text-brand-500">Hub</span>
            </span>
          </Link>

          <nav className="mt-2 grid gap-1" aria-label="Dashboard">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="text-base" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="divider my-4" />

          <nav className="grid gap-1" aria-label="General">
            <NavLink to="/" className={linkClass}>
              <FiHome className="text-base" aria-hidden="true" /> Home
            </NavLink>
            <NavLink to="/dashboard/contact" className={linkClass}>
              <FiMail className="text-base" aria-hidden="true" /> Contact
            </NavLink>
          </nav>

          <div className="mt-auto rounded-2xl border border-base-200 bg-base-200/50 p-3">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={user?.photoURL || "https://i.pravatar.cc/80?img=12"}
                    alt={user?.displayName || "User avatar"}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.displayName || user?.email || "Guest"}
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
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;

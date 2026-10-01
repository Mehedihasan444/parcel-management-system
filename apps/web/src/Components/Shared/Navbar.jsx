import { useState } from "react";
import { FiMenu, FiX, FiBell, FiArrowRight, FiPackage } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import useAdmin from "../../Hooks/useAdmin";
import useDeliveryMen from "../../Hooks/useDeliveryMen";
import ThemeToggle from "../Seo/ThemeToggle";

function dashboardPath(isAdmin, isDeliveryMen) {
  if (isAdmin) return "/dashboard/adminHome";
  if (isDeliveryMen) return "/dashboard/myDeliveryList";
  return "/dashboard/bookAParcel";
}

function dashboardLabel(isAdmin, isDeliveryMen) {
  if (isAdmin) return "Admin Panel";
  if (isDeliveryMen) return "Rider Panel";
  return "Dashboard";
}

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-base-200 text-base-content" : "text-base-content/70 hover:text-base-content"
  }`;

const Navbar = () => {
  const { user, logOut } = useAuth();
  const [isAdmin] = useAdmin();
  const [isDeliveryMen] = useDeliveryMen();
  const [open, setOpen] = useState(false);

  const handleLogOut = () => {
    logOut().catch((error) => console.log(error));
  };

  const dest = dashboardPath(isAdmin, isDeliveryMen);
  const label = dashboardLabel(isAdmin, isDeliveryMen);

  return (
    <header className="sticky top-0 z-50 border-b border-base-200/70 bg-base-100/80 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-circle lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          <Link to="/" className="flex items-center gap-2.5" aria-label="RapidParcelHub home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <FiPackage className="text-lg" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              RapidParcel<span className="text-brand-500">Hub</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to={dest} className={linkClass}>
            {label}
          </NavLink>
          <NavLink to="/dashboard/myParcels" className={linkClass}>
            Track
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button type="button" className="btn btn-ghost btn-circle" aria-label="Notifications">
            <span className="indicator">
              <FiBell className="text-lg" />
              <span className="badge badge-xs badge-primary indicator-item" />
            </span>
          </button>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full ring-2 ring-brand-500/40 ring-offset-2 ring-offset-base-100">
                  <img
                    alt={user?.displayName || "User avatar"}
                    src={user?.photoURL || "https://i.pravatar.cc/80?img=12"}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <ul className="menu menu-sm dropdown-content mt-3 w-60 rounded-2xl border border-base-200 bg-base-100 p-2 shadow-xl">
                <li className="menu-title px-3 pt-2">
                  <span className="truncate text-sm font-semibold normal-case">
                    {user?.displayName || user?.email}
                  </span>
                </li>
                <li>
                  <Link to={dest}>{label}</Link>
                </li>
                <li>
                  <Link to="/dashboard/myProfile">My profile</Link>
                </li>
                <li>
                  <button type="button" onClick={handleLogOut}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-sm border-0 bg-brand-500 text-white hover:bg-brand-600"
              >
                Get started
                <FiArrowRight aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-base-200 bg-base-100 px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <div className="grid gap-1">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to={dest} className={linkClass} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
            <NavLink
              to="/dashboard/myParcels"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              Track parcel
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

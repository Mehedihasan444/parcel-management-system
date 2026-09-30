import { FaBarsStaggered, FaRegBell } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import useAuth from "../../Hooks/useAuth";
import { Link, NavLink } from "react-router-dom";
import useAdmin from "../../Hooks/useAdmin";
import useDeliveryMen from "../../Hooks/useDeliveryMen";
const Navbar = () => {
  const { user, logOut } = useAuth();
  const [isAdmin] = useAdmin();
  const [isDeliveryMen] = useDeliveryMen();
  const handleLogOut = () => {
    logOut()
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="max-w-7xl mx-auto navbar bg-base-100">
      <div className="navbar-start">
        {/* <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <FaBarsStaggered className="text-xl" />
          </div>
          <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink
                to={`/dashboard/${
                  isAdmin
                    ? "adminHome"
                    : isDeliveryMen
                    ? "myDeliveryList"
                    : "bookAParcel"
                }`}
              >
                {" "}
                {isAdmin
                  ? "Admin Panel"
                  : isDeliveryMen
                  ? "Delivery Men Panel"
                  : "Dashboard"}
              </NavLink>
            </li>
          </ul>
        </div> */}
        <a href="/" className="btn btn-ghost text-xl font-bold">
          RapidParcel<span className="text-[#1CA774]">Hub</span>
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        {/* <ul className="menu menu-horizontal px-1">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
         
          <li>
            <NavLink
              to={`/dashboard/${
                isAdmin
                  ? "adminHome"
                  : isDeliveryMen
                  ? "myDeliveryList"
                  : "bookAParcel"
              }`}
            >
              {" "}
              {isAdmin
                ? "Admin Panel"
                : isDeliveryMen
                ? "Delivery Men Panel"
                : "Dashboard"}
            </NavLink>
          </li>
        </ul> */}
      </div>
      <div className="navbar-end ">
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <FaRegBell className="text-xl" />
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        {/* --------- */}

        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="User Image" src={user?.photoURL} />
              </div>
            </div>
            <ul className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              {/* <li className=" ">
                <input
                  type="text"
                  className=""
                  value={user?.displayName}
                  readOnly
                />
              </li> */}
                <h3 className="font-bold   text-xl mb-2" >{user?.displayName}</h3>
              <hr />
              <li className="mt-2">
                <Link to={`/dashboard/${
                  isAdmin
                    ? "adminHome"
                    : isDeliveryMen
                    ? "myDeliveryList"
                    : "bookAParcel"
                }`}>{isAdmin
                ? "Admin Panel"
                : isDeliveryMen
                ? "Delivery Men Panel"
                : "Dashboard"}</Link>
              </li>
              <li>
                <button className="" onClick={handleLogOut}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>
        )}

      
      </div>
    </div>
  );
};

export default Navbar;

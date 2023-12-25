import {FaBook,FaBoxOpen,FaBoxes,FaEnvelope,FaHome,FaSearch,FaUsers,
} from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import { MdReviews } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";


const Dashboard = () => {
  // TODO: get isAdmin value from the database
  const isAdmin =true;

  const isDeliveryMan = false;
  return (
    <div className="flex">
      <div className="w-64 min-h-screen bg-orange-400">
        <ul className="menu p-4">
          {isAdmin ? (
            <>
              <li>
                <NavLink to="/dashboard/adminHome">
                  <FaHome></FaHome>
                  Admin Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/allParcels">
                <FaBoxes />
                  All Parcels
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/allUsers">
                <FaUsers />
                  All Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/allDeliveryMen">
                  <FaBook></FaBook>
                  All Delivery Men
                </NavLink>
              </li>
            </>
          ) : (
            <>
            {
              isDeliveryMan?
              <>
               <li>
                <NavLink to="/dashboard/myDeliveryList">
                <TbTruckDelivery />
                  My Delivery List
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/myReviews">
                <MdReviews />
                  My Reviews
                </NavLink>
              </li>
              </>:<>
              <li>
                <NavLink to="/dashboard/bookAParcel">
                <FaBoxOpen />
                  Book A Parcel
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/myParcels">
                <FaBoxes />
                  My Parcels
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/myProfile">
                <CgProfile />
                  My Profile
                </NavLink>
              </li>
              </>
            }
             

              
            </>
          )}
        </ul>
        {/* shared nav links */}
        <div className="divider"></div>
        <ul className="menu p-4">
          <li>
            <NavLink to="/">
              <FaHome></FaHome>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/order/salad">
              <FaSearch></FaSearch>
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink to="/order/contact">
              <FaEnvelope></FaEnvelope>
              Contact
            </NavLink>
          </li>
        </ul>
      </div>

      {/* dashboard content */}
      <div className="flex-1 p-8">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Dashboard;

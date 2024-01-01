import {
  FaBook,
  FaBoxOpen,
  FaBoxes,
  FaEnvelope,
  FaHome,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import { MdReviews } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { CgProfile } from "react-icons/cg";
import useAdmin from "../hooks/useAdmin";
import useDeliveryMen from "../Hooks/useDeliveryMen";
import AdminRoute from "../Routes/AdminRoute";
import DeliveryMenRoute from "../Routes/DeliveryMenRoute";
import PrivateRoute from "../Routes/PrivateRoute";
// import logo from "../assets/Logo.png";
import { FaBarsStaggered } from "react-icons/fa6";

const Dashboard = () => {
  const [isAdmin] = useAdmin();
  const [isDeliveryMen] = useDeliveryMen();

  //bg-orange-400
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        {/* Page content here */}
        <div className="">
          <label htmlFor="my-drawer-2" className="btn  drawer-button lg:hidden">
            <FaBarsStaggered className=" text-xl" />
          </label>
          <Outlet></Outlet>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}

          {isAdmin ? (
            <>
              <li>
                <AdminRoute>
                  {" "}
                  <NavLink to="/dashboard/adminHome">
                    <FaHome></FaHome>
                    Admin Home
                  </NavLink>
                </AdminRoute>
              </li>
              <li>
                <AdminRoute>
                  <NavLink to="/dashboard/allParcels">
                    <FaBoxes />
                    All Parcels
                  </NavLink>
                </AdminRoute>
              </li>
              <li>
                <AdminRoute>
                  {" "}
                  <NavLink to="/dashboard/allUsers">
                    <FaUsers />
                    All Users
                  </NavLink>
                </AdminRoute>
              </li>
              <li>
                <AdminRoute>
                  {" "}
                  <NavLink to="/dashboard/allDeliveryMen">
                    <FaBook></FaBook>
                    All Delivery Men
                  </NavLink>
                </AdminRoute>
              </li>
            </>
          ) : (
            <>
              {isDeliveryMen ? (
                <>
                  <li>
                    <DeliveryMenRoute>
                      {" "}
                      <NavLink to="/dashboard/myDeliveryList">
                        <TbTruckDelivery />
                        My Delivery List
                      </NavLink>
                    </DeliveryMenRoute>
                  </li>
                  <li>
                    <DeliveryMenRoute>
                      <NavLink to="/dashboard/myReviews">
                        <MdReviews />
                        My Reviews
                      </NavLink>
                    </DeliveryMenRoute>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <PrivateRoute>
                      <NavLink to="/dashboard/bookAParcel">
                        <FaBoxOpen />
                        Book A Parcel
                      </NavLink>
                    </PrivateRoute>
                  </li>
                  <li>
                    <PrivateRoute>
                      <NavLink to="/dashboard/myParcels">
                        <FaBoxes />
                        My Parcels
                      </NavLink>
                    </PrivateRoute>
                  </li>
                  <li>
                    <PrivateRoute>
                      <NavLink to="/dashboard/myProfile">
                        <CgProfile />
                        My Profile
                      </NavLink>
                    </PrivateRoute>
                  </li>
                  <li>
                    <PrivateRoute>
                      <NavLink to="/dashboard/paymentHistory">
                        <CgProfile />
                        Payment History
                      </NavLink>
                    </PrivateRoute>
                  </li>
                </>
              )}
            </>
          )}

          {/* shared nav links */}
          <div className="divider"></div>

          <li>
            <NavLink to="/">
              <FaHome></FaHome>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/contact">
              <FaEnvelope></FaEnvelope>
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;




 // <div className="flex">
    //   <div className="w-64 min-h-screen bg-orange-400">
    //     <div className="mt-10">
    //       <img src={logo} alt="" className="" />
    //     </div>
    //     <ul className="menu p-4">
    //       {isAdmin ? (
    //         <>
    //           <li>
    //             <AdminRoute> <NavLink to="/dashboard/adminHome">
    //               <FaHome></FaHome>
    //               Admin Home
    //             </NavLink></AdminRoute>

    //           </li>
    //           <li>
    //             <AdminRoute><NavLink to="/dashboard/allParcels">
    //             <FaBoxes />
    //               All Parcels
    //             </NavLink></AdminRoute>

    //           </li>
    //           <li>
    //           <AdminRoute> <NavLink to="/dashboard/allUsers">
    //             <FaUsers />
    //               All Users
    //             </NavLink></AdminRoute>

    //           </li>
    //           <li>
    //           <AdminRoute>  <NavLink to="/dashboard/allDeliveryMen">
    //               <FaBook></FaBook>
    //               All Delivery Men
    //             </NavLink></AdminRoute>

    //           </li>
    //         </>
    //       ) : (
    //         <>
    //         {
    //           isDeliveryMen?
    //           <>

    //            <li>
    //             <DeliveryMenRoute> <NavLink to="/dashboard/myDeliveryList">
    //             <TbTruckDelivery />
    //               My Delivery List
    //             </NavLink></DeliveryMenRoute>
    //           </li>
    //           <li>
    //           <DeliveryMenRoute><NavLink to="/dashboard/myReviews">
    //             <MdReviews />
    //               My Reviews
    //             </NavLink></DeliveryMenRoute>

    //           </li>
    //           </>:<>
    //           <li>
    //             <PrivateRoute><NavLink to="/dashboard/bookAParcel">
    //             <FaBoxOpen />
    //               Book A Parcel
    //             </NavLink></PrivateRoute>

    //           </li>
    //           <li>
    //           <PrivateRoute><NavLink to="/dashboard/myParcels">
    //             <FaBoxes />
    //               My Parcels
    //             </NavLink></PrivateRoute>

    //           </li>
    //           <li>
    //           <PrivateRoute><NavLink to="/dashboard/myProfile">
    //             <CgProfile />
    //               My Profile
    //             </NavLink></PrivateRoute>

    //           </li>
    //           <li>
    //           <PrivateRoute><NavLink to="/dashboard/paymentHistory">
    //             <CgProfile />
    //             Payment History
    //             </NavLink></PrivateRoute>

    //           </li>
    //           </>
    //         }

    //         </>
    //       )}
    //     </ul>
    //     {/* shared nav links */}
    //     <div className="divider"></div>
    //     <ul className="menu p-4">
    //       <li>
    //         <NavLink to="/">
    //           <FaHome></FaHome>
    //           Home
    //         </NavLink>
    //       </li>
    //       <li>
    //         <NavLink to="/dashboard/contact">
    //           <FaEnvelope></FaEnvelope>
    //           Contact
    //         </NavLink>
    //       </li>
    //     </ul>
    //   </div>

    //   {/* dashboard content */}
    //   <div className="flex-1 p-8">
    //     <Outlet></Outlet>
    //   </div>
    // </div>
    // --------------------------
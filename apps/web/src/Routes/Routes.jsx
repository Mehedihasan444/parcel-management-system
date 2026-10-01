import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../Layouts/Main";
import RouteError from "../Components/Shared/RouteError";
import Error from "../Components/Shared/Error";
import Loading from "../Components/Shared/Loading";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Layouts/Dashboard";
import AdminRoute from "./AdminRoute";
import DeliveryMenRoute from "./DeliveryMenRoute";
import Book_A_Parcel from "../Pages/Book_A_Parcel";
import My_Parcels from "../Pages/My_Parcels";
import My_Profile from "../Pages/My_Profile";
import All_Parcels from "../Pages/All_Parcels";
import All_Users from "../Pages/All_Users";
import All_Delivery_Men from "../Pages/All_Delivery_Men";
import My_Delivery_List from "../Pages/My_Delivery_List";
import My_Reviews from "../Pages/My_Reviews";
import Contact from "../Pages/Contact";
import UpdateBooking from "../Pages/UpdateBooking";
import UpdateItem from "../Pages/UpdateItem";
import ReviewPage from "../Pages/ReviewPage";
import PaymentHistory from "../Pages/PaymentHistory";
import { API_BASE_URL } from "../config/api";

// Heavy, rarely-visited screens are split out so the landing bundle stays lean.
// Charts (apex), maps (mapbox) and Stripe each pull hundreds of KB.
const AdminHome = lazy(() => import("../Pages/AdminHome"));
const Payments = lazy(() => import("../Pages/Payments"));
const Location = lazy(() => import("../Components/Location/Location"));

const lazyPage = (node) => <Suspense fallback={<Loading />}>{node}</Suspense>;
const guard = (Guard, node) => <Guard>{node}</Guard>;

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <Error /> },
    ],
  },
  {
    path: "dashboard",
    element: guard(PrivateRoute, <Dashboard />),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="bookAParcel" replace /> },
      // Customer
      { path: "bookAParcel", element: guard(PrivateRoute, <Book_A_Parcel />) },
      {
        path: "updateBooking/:id",
        element: guard(PrivateRoute, <UpdateBooking />),
        loader: ({ params }) => fetch(`${API_BASE_URL}/users/booking/${params.id}`),
      },
      { path: "reviewPage", element: guard(PrivateRoute, <ReviewPage />) },
      { path: "payments/:id", element: guard(PrivateRoute, lazyPage(<Payments />)) },
      { path: "paymentHistory", element: guard(PrivateRoute, <PaymentHistory />) },
      { path: "myParcels", element: guard(PrivateRoute, <My_Parcels />) },
      { path: "myProfile", element: guard(PrivateRoute, <My_Profile />) },
      // Riders
      {
        path: "myDeliveryList",
        element: guard(DeliveryMenRoute, <My_Delivery_List />),
      },
      { path: "myReviews", element: guard(DeliveryMenRoute, <My_Reviews />) },
      {
        path: "viewLocation/:location",
        element: guard(PrivateRoute, lazyPage(<Location />)),
      },
      // Admins
      { path: "adminHome", element: guard(AdminRoute, lazyPage(<AdminHome />)) },
      { path: "allParcels", element: guard(AdminRoute, <All_Parcels />) },
      { path: "allUsers", element: guard(AdminRoute, <All_Users />) },
      { path: "updateItem/:id", element: guard(AdminRoute, <UpdateItem />) },
      { path: "allDeliveryMen", element: guard(AdminRoute, <All_Delivery_Men />) },
      // Shared
      { path: "contact", element: <Contact /> },
    ],
  },
]);

export default Routes;

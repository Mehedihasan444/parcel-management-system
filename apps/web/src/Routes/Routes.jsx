import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Main from "../Layouts/Main";
import RouteError from "../Components/Shared/RouteError";
import Error from "../Components/Shared/Error";
import Loading from "../Components/Shared/Loading";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import OAuthCallback from "../Pages/OAuthCallback";
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
import Legal from "../Pages/Legal";
import AdminReports from "../Pages/AdminReports";
import BulkShipping from "../Pages/BulkShipping";
import AddressBook from "../Pages/AddressBook";
import PaymentMethods from "../Pages/PaymentMethods";
import PaymentHistory from "../Pages/PaymentHistory";
import UpdateBooking from "../Pages/UpdateBooking";
import UpdateItem from "../Pages/UpdateItem";
import ReviewPage from "../Pages/ReviewPage";
import RiderEarnings from "../Pages/RiderEarnings";
import Track from "../Pages/Track";
import About from "../Pages/About";
import FAQ from "../Pages/FAQ";
import Pricing from "../Pages/Pricing";
import Help from "../Pages/Help";
import ProofOfDelivery from "../Pages/ProofOfDelivery";
import BookingDetails from "../Pages/BookingDetails";
import Settings from "../Pages/Settings";
import DashboardIndex from "./DashboardIndex";

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
      { path: "contact", element: <Contact /> },
      { path: "legal", element: <Legal /> },
      { path: "track/:identifier", element: <Track /> },
      { path: "about", element: <About /> },
      { path: "faq", element: <FAQ /> },
      { path: "pricing", element: <Pricing /> },
      { path: "help", element: <Help /> },
      { path: "oauth/callback", element: <OAuthCallback /> },
      { path: "*", element: <Error /> },
    ],
  },
  {
    path: "dashboard",
    element: guard(PrivateRoute, <Dashboard />),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardIndex /> },
      // Customer
      { path: "bookAParcel", element: guard(PrivateRoute, <Book_A_Parcel />) },
      {
        path: "updateBooking/:id",
        element: guard(PrivateRoute, <UpdateBooking />),
      },
      { path: "reviewPage", element: guard(PrivateRoute, <ReviewPage />) },
      { path: "payments/:id", element: guard(PrivateRoute, lazyPage(<Payments />)) },
      { path: "paymentHistory", element: guard(PrivateRoute, <PaymentHistory />) },
      { path: "myParcels", element: guard(PrivateRoute, <My_Parcels />) },
      { path: "myProfile", element: guard(PrivateRoute, <My_Profile />) },
      { path: "addressBook", element: guard(PrivateRoute, <AddressBook />) },
      { path: "paymentMethods", element: guard(PrivateRoute, <PaymentMethods />) },
      { path: "settings", element: guard(PrivateRoute, <Settings />) },
      {
        path: "bookingDetails/:id",
        element: guard(PrivateRoute, <BookingDetails />),
      },
      // Riders
      {
        path: "myDeliveryList",
        element: guard(DeliveryMenRoute, <My_Delivery_List />),
      },
      { path: "myReviews", element: guard(DeliveryMenRoute, <My_Reviews />) },
      { path: "myEarnings", element: guard(DeliveryMenRoute, <RiderEarnings />) },
      {
        path: "proofOfDelivery/:id",
        element: guard(DeliveryMenRoute, <ProofOfDelivery />),
      },
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
      { path: "reports", element: guard(AdminRoute, <AdminReports />) },
      { path: "bulk-shipping", element: guard(AdminRoute, <BulkShipping />) },
      // Shared
      { path: "contact", element: <Contact /> },
    ],
  },
]);

export default Routes;

import { createBrowserRouter } from "react-router-dom";
import Main from "../Layouts/Main";
import Error from "../Components/Shared/Error";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Layouts/Dashboard";
import AdminRoute from "./AdminRoute";
import Book_A_Parcel from "../Pages/Book_A_Parcel";
import My_Parcels from "../Pages/My_Parcels";
import My_Profile from "../Pages/My_Profile";
import All_Parcels from "../Pages/All_Parcels";
import All_Users from "../Pages/All_Users";
import All_Delivery_Men from "../Pages/All_Delivery_Men";
import My_Delivery_List from "../Pages/My_Delivery_List";
import My_Reviews from "../Pages/My_Reviews";
import DeliveryMenRoute from "./DeliveryMenRoute";
import Contact from "../Pages/Contact";
import UpdateBooking from "../Pages/UpdateBooking";
import AdminHome from "../Pages/AdminHome";
import UpdateItem from "../Pages/UpdateItem";
import ReviewPage from "../Pages/ReviewPage";
import Payments from "../Pages/Payments";
import Location from "../Components/Location/Location";
import Test from "../../../Test";

const Routes = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    errorElement: <Error></Error>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
      // {
      //   path: "/test",
      //   element: <Test></Test>,
      // },
    ],
  },
  {
    path: "dashboard",
    element: <Dashboard></Dashboard>,
    children: [
      // normal user routes
      {
        path: "bookAParcel",
        element: <Book_A_Parcel></Book_A_Parcel>,
      },
      {
        path: "updateBooking/:id",
        element: <UpdateBooking></UpdateBooking>,
        loader: ({ params }) =>
          fetch(`http://localhost:5000/api/v1/users/booking/${params.id}`),
      },
      {
        path: "reviewPage",
        element: <ReviewPage></ReviewPage>,
      },
      {
        path: "payments/:id",
        element: <Payments></Payments>,
      },
      {
        path: "myParcels",
        element: <My_Parcels></My_Parcels>,
      },
      {
        path: "myProfile",
        element: <My_Profile></My_Profile>,
      },

      // Delivery Men Will See only routes
      {
        path: "myDeliveryList",
        element: <My_Delivery_List></My_Delivery_List>,
      },
      {
        path: "myReviews",
        element: <My_Reviews></My_Reviews>,
      },
      {
        path: "viewLocation/:location",
        element: <Location></Location>,
      },

      // // admin only routes
      {
        path: "adminHome",
        element: <AdminHome></AdminHome>,
      },
      {
        path: "allParcels",
        element: <All_Parcels></All_Parcels>,
      },
      {
        path: "allUsers",
        element: <All_Users></All_Users>,
      },
      {
        path: "updateItem/:id",
        element: <UpdateItem></UpdateItem>,
      },
      {
        path: "allDeliveryMen",
        element: <All_Delivery_Men></All_Delivery_Men>,
      },
      {
        path: "contact",
        element: <Contact></Contact>,
      },
    ],
  },
]);

export default Routes;

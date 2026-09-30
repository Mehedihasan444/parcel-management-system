import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Shared/Navbar";
import Footer from "../Components/Shared/Footer";

const Main = () => {
  const location = useLocation();

  const noHeaderFooter =
    location.pathname.includes("login") ||
    location.pathname.includes("register");

  return (
    <div className="">
      {noHeaderFooter || <Navbar></Navbar>}
      {/* <Navbar></Navbar> */}
      <div className="">

      <Outlet></Outlet>
      </div>

      {noHeaderFooter || <Footer></Footer>}
      {/* <Footer></Footer> */}
    </div>
  );
};

export default Main;

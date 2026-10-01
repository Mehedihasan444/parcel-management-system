import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "../Components/Shared/Navbar";
import Footer from "../Components/Shared/Footer";

const Main = () => {
  const location = useLocation();

  const noHeaderFooter =
    location.pathname.includes("login") || location.pathname.includes("register");

  return (
    <div className="">
      {noHeaderFooter || <Navbar />}
      <div className="">
        <Outlet />
      </div>

      {noHeaderFooter || <Footer />}
      <Toaster position="top-right" richColors closeButton gap={8} />
    </div>
  );
};

export default Main;

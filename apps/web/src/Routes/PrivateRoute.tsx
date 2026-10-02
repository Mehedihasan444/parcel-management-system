import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "../Components/Shared/Loading";
import useAuth from "../Hooks/useAuth";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.loading) return <Loading label="Checking your session…" />;
  if (auth?.user) return children;
  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;

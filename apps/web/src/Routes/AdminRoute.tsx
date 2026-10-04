import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAdmin from "../Hooks/useAdmin";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Shared/Loading";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [isAdmin, isAdminLoading] = useAdmin();
  const location = useLocation();

  if (auth?.loading || isAdminLoading) return <Loading label="Verifying admin access…" />;
  if (auth?.user && isAdmin) return children;
  return <Navigate to="/" state={{ from: location.pathname + location.search }} replace />;
};

export default AdminRoute;

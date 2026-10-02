import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Shared/Loading";
import useDeliveryMen from "../Hooks/useDeliveryMen";

const DeliveryMenRoute = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [isDeliveryMen, isDeliveryMenLoading] = useDeliveryMen();
  const location = useLocation();

  if (auth?.loading || isDeliveryMenLoading) return <Loading label="Verifying rider access…" />;
  if (auth?.user && isDeliveryMen) return children;
  return <Navigate to="/" state={{ from: location?.pathname }} replace />;
};

export default DeliveryMenRoute;

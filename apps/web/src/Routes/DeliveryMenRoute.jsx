import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Shared/Loading";
import useDeliveryMen from "../Hooks/useDeliveryMen";

const DeliveryMenRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isDeliveryMen, isDeliveryMenLoading] = useDeliveryMen();
  const location = useLocation();

  if (loading || isDeliveryMenLoading) return <Loading label="Verifying rider access…" />;
  if (user && isDeliveryMen) return children;
  return <Navigate to="/" state={{ from: location?.pathname }} replace />;
};

DeliveryMenRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DeliveryMenRoute;

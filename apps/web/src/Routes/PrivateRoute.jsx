import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "../Components/Shared/Loading";
import useAuth from "../Hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Checking your session…" />;
  if (user) return children;
  return <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;

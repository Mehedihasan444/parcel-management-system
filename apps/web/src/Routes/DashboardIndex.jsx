import { Navigate } from "react-router-dom";
import useAdmin from "../Hooks/useAdmin";
import useDeliveryMen from "../Hooks/useDeliveryMen";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Shared/Loading";

/**
 * Role-aware landing for /dashboard. The old index always sent everyone to
 * the customer booking form, so admins and riders landed on the wrong
 * workspace (and could briefly see customer links). This sends each role to
 * its home and shows a loader while roles resolve.
 */
function DashboardIndex() {
  const { user, loading } = useAuth();
  const [isAdmin, isAdminLoading] = useAdmin();
  const [isDeliveryMen, isDeliveryMenLoading] = useDeliveryMen();

  if (loading || isAdminLoading || isDeliveryMenLoading) {
    return <Loading label="Preparing your dashboard…" />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="adminHome" replace />;
  if (isDeliveryMen) return <Navigate to="myDeliveryList" replace />;
  return <Navigate to="bookAParcel" replace />;
}

export default DashboardIndex;

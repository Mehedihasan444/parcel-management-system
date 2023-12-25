import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Shared/Loading";
import useDeliveryMan from "../Hooks/useDeliveryMan";



const DeliveryManRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const [isDeliveryMan, isDeliveryManLoading] = useDeliveryMan();
    const location = useLocation();

    if (loading || isDeliveryManLoading) {
        return <Loading></Loading>
    }

    if (user && isDeliveryMan) {
        return children;
    }

    return <Navigate to="/" state={location.pathname} replace></Navigate>

};

export default DeliveryManRoute;
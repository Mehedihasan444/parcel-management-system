import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import PropTypes from "prop-types";

const TotalSpendAmountCal = ({ email }) => {
  const axiosSecure = useAxiosSecure();
  const { data: allParcels = [] } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  const totalSpendAmount = allParcels
    .filter((parcel) => parcel.email.toLowerCase() === email.toLowerCase())
    .reduce((sum, parcel) => sum + (parcel.price || 0), 0);

  return <div>{totalSpendAmount}</div>;
};

TotalSpendAmountCal.propTypes = {
  email: PropTypes.string,
};

export default TotalSpendAmountCal;

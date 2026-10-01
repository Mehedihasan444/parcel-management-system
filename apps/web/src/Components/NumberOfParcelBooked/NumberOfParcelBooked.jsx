import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import PropTypes from "prop-types";

const NumberOfParcelBooked = ({ email }) => {
  const axiosSecure = useAxiosSecure();
  const { data: allParcels = [] } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  const parcelBooked = allParcels.filter(
    (parcel) => parcel.email.toLowerCase() === email.toLowerCase()
  );
  console.log(parcelBooked);
  return <div>{parcelBooked.length}</div>;
};

NumberOfParcelBooked.propTypes = {
  email: PropTypes.string,
};

export default NumberOfParcelBooked;

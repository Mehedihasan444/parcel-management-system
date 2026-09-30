import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const NumberOfParcelBooked = ({ email }) => {
  const axiosSecure = useAxiosSecure();
  const { data: allParcels = [], refetch } = useQuery({
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

export default NumberOfParcelBooked;

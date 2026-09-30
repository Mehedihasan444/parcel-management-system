import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const TotalSpendAmountCal = ({ email }) => {
  const axiosSecure = useAxiosSecure();
  const { data: allParcels = [], refetch } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  let totalSpendAmount = 0;
  const bookings = allParcels
    .filter((parcel) => parcel.email.toLowerCase() === email.toLowerCase())
    .map((parcel) => {
      totalSpendAmount += parcel.price;
      return parcel;
    });



  return <div>{totalSpendAmount}</div>;
};

export default TotalSpendAmountCal;

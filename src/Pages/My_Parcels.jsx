import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { Link } from "react-router-dom";
import useAuth from "../Hooks/useAuth";


const My_Parcels = () => {
const {user}=useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: parcels = [], refetch } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/bookings/${user.email}`);
      return res.data;
    },
  });

  

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-5">My_Parcels</h1>
      <span className="divider"></span>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-base">
              <th>#</th>
              <th>Parcel Type</th>
              <th>Requested Delivery Date</th>
              <th>Approximate Delivery Date</th>
              <th>Booking Date</th>
              <th>Delivery Men ID</th>
              <th>Booking Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.parcelType}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  {" "}
                  <span className="text-lg font-semibold">{item?.status}</span>
                </td>
                <td>
                  <div className="flex gap-3">
                    <Link to={`/dashboard/updateBooking/${item?._id}`}>
                      <button className="btn btn-sm">Update</button>
                      </Link>
                      {
                        item?.status === "pending" &&
                        <button // onClick={() => handleDelete(item?._id)} 
                        className="btn btn-sm">Cancel</button>
                      }
                    {
                      item?.status === "delivered" &&
                    <Link to={`/dashboard/reviewPage/${item?._id}`}>
                      <button className="btn btn-sm">Review</button>
                    </Link>
                    }
                    {/* {
                      item?.status === "delivered" &&
                    } */}
                    <Link to={`/dashboard/payments/${item?._id}`}>
                      <button className="btn btn-sm">Pay</button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default My_Parcels;

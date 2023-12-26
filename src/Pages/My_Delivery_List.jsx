import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const My_Delivery_List = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: deliveryList = [], refetch } = useQuery({
    queryKey: ["deliveryList"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/deliveryMen/deliveryList/${user.email}`
      );
      return res.data;
    },
  });
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/deliveryMen/deliveryList/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
          }
        });
      }
    });
  };

  return (
    <div>
      <SectionTitle heading={"My Delivery List"} subHeading={""}></SectionTitle>

      <span className="divider"></span>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-base">
              <th>#</th>
              <th>Booked User's Name</th>
              <th>Receivers Name</th>
              <th>Booked user's Phone</th>
              <th>Requested Delivery Date</th>
            </tr>
          </thead>
          <tbody>
            {deliveryList?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.bookedUserName}</td>
                <td>{item?.receiversName}</td>
                <td>{item?.bookedUserPhone}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td>{item?.approximateDeliveryDate}</td>
                <td>{item?.recieversPhoneNumber}</td>
                <td>{item?.recieversAddress}</td>
                <td>
                  <Link to={`/dashboard/updateBooking/${item?._id}`}>
                    <button className="btn btn-sm">View Location</button>
                  </Link>
                </td>
                <td>
                  <Link to={`/dashboard/updateBooking/${item?._id}`}>
                    <button className="btn btn-sm">Cancel</button>
                  </Link>
                </td>
                <td>
                  <Link to={`/dashboard/updateBooking/${item?._id}`}>
                    <button className="btn btn-sm">Cancel</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default My_Delivery_List;

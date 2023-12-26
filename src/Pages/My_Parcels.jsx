import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../hooks/useAxiosSecure";
import ReviewPage from "./ReviewPage";

const My_Parcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: parcels = [], refetch } = useQuery({
    queryKey: ["parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/bookings/${user.email}`);
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
        axiosSecure.delete(`/users/bookings/${id}`).then((res) => {
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
      {/* <h1 className="text-3xl font-bold text-center mb-5">My_Parcels</h1> */}
      <SectionTitle heading={"My Parcels"}></SectionTitle>
      <div className="flex justify-between items-center my-5">
        <div className="text-2xl font-bold ">
          <h3 className="">Filter By Status:</h3>
        </div>
        <div className="">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-medium">Pick status</span>
            </div>
            <select className="select select-bordered">
              <option disabled selected>
                Select one
              </option>
              <option>Delivered</option>
              <option>Pending</option>
              <option>On the way</option>
              <option>Returned</option>
              <option>cancel</option>
            </select>
          </label>
        </div>
      </div>

      {/* <span className="divider"></span> */}
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-base">
              <th>#</th>
              <th>Parcel Type</th>
              <th>Requested Delivery Date</th>
              <th>Delivery Men ID</th>
              <th>Booking Status</th>
              <th>Approximate Delivery Date</th>
              <th>Booking Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.parcelType}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td>{item?.deliveryMenID}</td>
                <td>
                  {" "}
                  <span className="">{item?.status}</span>
                </td>

                <td>{item?.approximateDeliveryDate}</td>
                <td>{item?.bookingDate}</td>
                <td className="">
                  {item?.status === "delivered" && (
                    // <Link to={`/dashboard/reviewPage/${item?._id}`}>

                    <button
                      className="btn btn-sm"
                      onClick={() =>
                        document.getElementById("my_modal_3").showModal()
                      }
                    >
                      Review
                      <ReviewPage id={item?._id}></ReviewPage>
                    </button>

                    // </Link>
                  )}
                  {item?.status === "pending" && (
                    <>
                      <Link to={`/dashboard/updateBooking/${item?._id}`}>
                        <button className="btn btn-sm">Update</button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item?._id)}
                        className="btn btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {/* {
                      item?.status === "delivered" &&
                    } */}
                  <Link to={`/dashboard/payments/${item?._id}`}>
                    <button className="btn btn-sm">Pay</button>
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

export default My_Parcels;

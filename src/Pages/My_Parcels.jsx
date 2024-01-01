import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import ReviewPage from "./ReviewPage";
import {  useState } from "react";

const My_Parcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [stat,setStat] = useState('');

  const { data: parcels = [], refetch } = useQuery({
    queryKey: ["parcels",stat],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/bookings/${user?.email}?status=${stat}`);
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



  const handleFilter = (e) => {
    const Value = e.target.value;
    setStat(Value)
    refetch();
  };

  return (
    <div className="sm:w-[70vw] ">
      {/* <h1 className="text-3xl font-bold text-center mb-5">My_Parcels</h1> */}
      <SectionTitle heading={"My Parcels"}></SectionTitle>
      <div className="flex justify-between items-center my-5">
        <div className="text-2xl font-bold ">
          <h3 className="">Filter By Status:</h3>
        </div>
        <div className="" >
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-medium">Pick status</span>
            </div>
            <select className="select select-bordered" name="filter" onChange={handleFilter}>
              <option disabled selected>
                Select one
              </option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="On The Way">On the way</option>
              <option value="returned">Returned</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        </div>
      </div>

      {/* <span className="divider"></span> */}
      <div className="overflow-x-auto">
        <table className="table table-md border text-center">
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
                  <span className="">{item?.status}</span>
                </td>
                <td>{item?.approximateDeliveryDate}</td>
                <td>{item?.bookingDate}</td>
                <td className="flex gap-1">
                  {item?.status === "delivered" && (
                    // <Link to={`/dashboard/reviewPage/${item?._id}`}>

                    <button
                      className="btn btn-sm btn-primary text-white"
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
                        <button className="btn btn-sm btn-accent text-white">
                          Update
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item?._id)}
                        className="btn btn-sm btn-error text-white"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {/* {
                      item?.status === "delivered" &&
                    } */}
                  <Link to={`/dashboard/payments/${item?._id}`}>
                    <button className="btn btn-sm btn-info text-white">
                      Pay
                    </button>
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

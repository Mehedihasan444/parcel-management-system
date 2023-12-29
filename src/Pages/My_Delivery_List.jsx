import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const My_Delivery_List = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: userData = {} } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user?.email}`);
      return res.data;
    },
  });
  const { data: deliveryList = [], refetch } = useQuery({
    queryKey: ["deliveryList"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users/deliveryMen/deliveryList/${userData._id}`
      );
      return res.data;
    },
  });
  // console.log(deliveryList);
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Cancel it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const info = {
          status: "Cancelled",
        };
        axiosSecure
          .patch(`/deliveryMen/deliveryList/cancel/deliver/${id}`, info)
          .then((res) => {
            console.log(res.data);
            if (res.data.modifiedCount > 0) {
              refetch();
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Cancelled!",
                text: "Parcel has been Cancelled.",
                showConfirmButton: false,
                timer: 1500,
              });
           
            } else {
              Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Something went wrong",
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      }
    });
  };

  const handleDeliver = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delivered!",
    }).then((result) => {
      if (result.isConfirmed) {
        const info = {
          status: "Delivered",
        };
        axiosSecure
          .patch(`/deliveryMen/deliveryList/cancel/deliver/${id}`, info)
          .then((res) => {
            console.log(res.data);

            if (res.data.modifiedCount > 0) {
              refetch();
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
              });
            } else {
              Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Something went wrong",
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      }
    });
  };
  return (
    <div>
      <SectionTitle heading={"My Delivery List"} subHeading={"Assign Parcels"}></SectionTitle>

      <span className="divider"></span>
      <div className="overflow-x-auto">
        <table className="table table-xs text-center">
          <thead className="text-center">
            <tr className="text-base">
              <th>#</th>
              <th>Name</th>
              <th>Receivers Name</th>
              <th>Phone</th>
              <th>Receivers Phone</th>
              <th>Requested Delivery Date</th>
              <th>Approximate Delivery Date</th>
              <th>Receivers Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveryList?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.name}</td>
                <td>{item?.receiverName}</td>
                <td>{item?.phone}</td>
                <td>{item?.receiverPhone}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td>{item?.approximateDeliveryDate}</td>
                <td>
                  {" "}
                  <div className="flex justify-center mb-1">
                    <Link
                      to={`/dashboard/viewLocation/${item?.deliveryAddressLatitude},${item?.deliveryAddressLongitude}`}
                    >
                      <button className="btn btn-sm btn-primary " >
                        View Location
                      </button>
                    </Link>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(item?._id)}
                      className="btn btn-sm btn-secondary  bg-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeliver(item?._id)}
                      className="btn btn-sm btn-success text-white"
                    >
                      Deliver
                    </button>
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

export default My_Delivery_List;

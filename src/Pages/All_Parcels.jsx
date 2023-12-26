import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { Link } from "react-router-dom";
import AllParcelsModal from "../Components/AllParcelsModal/AllParcelsModal";

const All_Parcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: allParcels = [], refetch } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  console.log(allParcels);
  return (
    <div>
      <SectionTitle heading={"all Parcels"}></SectionTitle>
      {/* <span className="divider"></span> */}

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold ">Filter booking by date:</h3>
        <div className="flex justify-end  gap-5 my-5">
           <div className="">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-medium">Staring date</span>
            </div>
            <input
              type="date"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
            />
          </label>
        </div>
        <div className="">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text font-medium">Ending date</span>
            </div>
            <input
              type="date"
              placeholder="Type here"
              className="input input-bordered w-full max-w-xs"
            />
          </label>
        </div>
        <div className="flex justify-center items-end  gap-3">
                    {/* <Link to={`/dashboard/payments/${item?._id}`}> */}
                    {/* <button className="btn btn-sm">Manage</button> */}
                    {/* You can open the modal using document.getElementById('ID').showModal() method */}
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        document.getElementById("my_modal_3").showModal()
                      }
                    >
                      Manage
                      <AllParcelsModal></AllParcelsModal>
                    </button>
                    {/* </Link> */}
                  </div>
        </div>
       
      </div>

      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead className="border">
            <tr className="text-base">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Requested Delivery Date</th>
              <th>Booking Date</th>
              <th>Cost</th>
              {/* <th className="text-center">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {allParcels?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.name}</td>
                <td>{item?.phone}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td>{item?.bookingDate}</td>
                <td>{item?.price} TK</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default All_Parcels;

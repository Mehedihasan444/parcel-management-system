import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import AlparcelsTable from "../Components/AlparcelsTable/AlparcelsTable";

const All_Parcels = () => {
  const axiosSecure = useAxiosSecure();

 
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/users/collection");
      return res.data;
    },
  });
// console.log(users)
  return (
    <div>
      <SectionTitle heading={"all Parcels"}></SectionTitle>
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
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (

            <AlparcelsTable key={index} userEmail={user.email}></AlparcelsTable>
          ))}
          </tbody>
          
        </table>
      </div>
    </div>
  );
};

export default All_Parcels;

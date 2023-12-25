import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { Link } from "react-router-dom";


const All_Parcels = () => {
const {user}=useAuth()
    const axiosSecure = useAxiosSecure();

    const { data: allParcels = [], refetch } = useQuery({
      queryKey: ["allParcels"],
      queryFn: async () => {
        const res = await axiosSecure.get('/users/admin/bookings')
        return res.data;
      },
    });

console.log(allParcels)
    return (
        <div>
      <SectionTitle heading={"all Parcels"}></SectionTitle>
      <span className="divider"></span>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-base">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Requested Delivery Date</th>
              <th>Booking Date</th>
              <th>Cost</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
          {
            allParcels?.map((item, idx) => (<tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.name}</td>
                <td>{item?.phone}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td>{item?.bookingDate}</td>
                <td>{item?.price} TK</td>
                <td>
                  <div className="flex gap-3">
                    {/* <Link to={`/dashboard/payments/${item?._id}`}> */}
                      <button className="btn btn-sm">Manage</button>
                    {/* </Link> */}
                  </div>
                </td>
              </tr>
            ))
            }
          </tbody>
        </table>
      </div>
    </div>
    );
};

export default All_Parcels;
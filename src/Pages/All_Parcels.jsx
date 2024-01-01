import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import AllParcelsTable from "../Components/AllParcelsTable/AllParcelsTable";
import { DateRangePicker } from "react-date-range";
import { useEffect, useState } from "react";

const All_Parcels = () => {
  const axiosSecure = useAxiosSecure();
  const [bookings, setBookings] = useState([]);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/users/collection");
      return res.data;
    },
  });

  const { data: allParcels = [], refetch } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  useEffect(() => {
    const filteredBookings = [];
    for (let i = 0; i < users?.length; i++) {
      const filteredData = allParcels.filter(
        (item) =>
          item?.email.toLowerCase() === users[i]?.email.toLowerCase() &&
          item?.status === "pending"
        //"On The Way"
      );
      filteredBookings.push(...filteredData);
    }
    setBookings(filteredBookings);
  }, [allParcels, users]);

  const handleFilter = (e) => {
    e.preventDefault();
    const form = e.target;
    const start = form.startingDate.value;
    const end = form.endingDate.value;
    console.log(start, end);

    const filteredByDate = bookings.filter((item) => {
      let itemDate = item?.requestedDeliveryDate;
      //.toLocaleDateString()
      console.log(itemDate);
      return itemDate >= start && itemDate <= end;
    });
    console.log(filteredByDate);
    setBookings(filteredByDate);
    refetch();
  };

  return (
    <div>
      <SectionTitle heading={"all Parcels"}></SectionTitle>
      <div className="flex justify-end items-center">
        {/* <h3 className="text-lg sm:text-2xl font-bold ">
          Filter By Requested Delivery Date:
        </h3> */}
        <form onSubmit={handleFilter}>
          <div className="flex justify-end  gap-5 my-5">
            <div className="">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text font-medium">Staring date</span>
                </div>
                <input
                  type="date"
                  name="startingDate"
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
                  name="endingDate"
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn btn-info text-white ">
                Filter
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-md text-center border">
          <thead className="border">
            <tr className="text-base">
              {/* <th>#</th> */}
              <th>Name</th>
              <th>Phone</th>
              <th>Requested Delivery Date</th>
              <th>Booking Date</th>
              <th>Cost</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody className="">
            <AllParcelsTable bookings={bookings}></AllParcelsTable>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default All_Parcels;

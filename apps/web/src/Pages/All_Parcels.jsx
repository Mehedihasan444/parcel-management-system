import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import AllParcelsTable from "../Components/AllParcelsTable/AllParcelsTable";

const All_Parcels = () => {
  const axiosSecure = useAxiosSecure();
  const [range, setRange] = useState({ start: "", end: "" });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/users/collection");
      return res.data;
    },
  });

  const { data: allParcels = [] } = useQuery({
    queryKey: ["allParcels"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });

  const pendingBookings = useMemo(() => {
    const emails = new Set(users.map((u) => u?.email?.toLowerCase()));
    return allParcels.filter(
      (item) => emails.has(item?.email?.toLowerCase()) && item?.status === "pending"
    );
  }, [allParcels, users]);

  const bookings = useMemo(() => {
    if (!range.start || !range.end) return pendingBookings;
    return pendingBookings.filter((item) => {
      const date = item?.requestedDeliveryDate;
      return date >= range.start && date <= range.end;
    });
  }, [pendingBookings, range]);

  const handleFilter = (e) => {
    e.preventDefault();
    const form = e.target;
    setRange({ start: form.startingDate.value, end: form.endingDate.value });
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

import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import AllParcelsModal from "../AllParcelsModal/AllParcelsModal";
import { useState } from "react";
const AlparcelsTable = ({ userEmail }) => {
  const axiosSecure = useAxiosSecure();
  const [id, setId] = useState("");

  const { data: allParcels = [], refetch } = useQuery({
    queryKey: ["allParcels", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin/bookings");
      return res.data;
    },
  });
  // const email = userEmail.toLowerCase();
  const filterData = allParcels.filter(
    (item) => (item.email?.toLowerCase() === userEmail?.toLowerCase() )&& item.status!=='On The Way'
  );


  return (
    <>
      {filterData?.map((item, idx) => (
        <tr key={item._id}>
          <th>{idx + 1}</th>
          <td>{item?.name}</td>
          <td>{item?.phone}</td>
          <td>{item?.requestedDeliveryDate}</td>
          <td>{item?.bookingDate}</td>
          <td>{item?.price} TK</td>
          <td>
            <div onClick={()=>setId(item?._id)} className="flex justify-center items-end  gap-3">
              <button
                className="btn btn-primary"
                onClick={() => {
                  document.getElementById("my_modal_3").showModal();
                  
                }}
              >
                Manage
                <AllParcelsModal id={id}></AllParcelsModal>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default AlparcelsTable;

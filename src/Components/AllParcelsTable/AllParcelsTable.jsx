
import AllParcelsModal from "../AllParcelsModal/AllParcelsModal";
import {  useState } from "react";

const AllParcelsTable = ({ bookings }) => {
  const [id, setId] = useState("");

  return (
    <>
      {bookings?.map((item, idx) => (
        <tr key={item._id}>
          {/* <th>{idx + 1}</th> */}
          <td>{item?.name}</td>
          <td>{item?.phone}</td>
          <td>{item?.requestedDeliveryDate}</td>
          <td>{item?.bookingDate}</td>
          <td>{item?.price} TK</td>
          <td>
            <div
              onClick={() => setId(item?._id)}
              className="flex justify-center items-end  gap-3"
            >
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

export default AllParcelsTable;

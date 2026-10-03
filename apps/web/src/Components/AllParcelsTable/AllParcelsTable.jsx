import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import AllParcelsModal, { ADMIN_ASSIGN_DIALOG_ID } from "../AllParcelsModal/AllParcelsModal";
import StatusPill from "../UI/StatusPill";

const AllParcelsTable = ({ bookings, selectedIds = [], onSelect }) => {
  const [selectedId, setSelectedId] = useState("");

  const openManage = (bookingId) => {
    setSelectedId(bookingId);
    const dialog = document.getElementById(ADMIN_ASSIGN_DIALOG_ID);
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  };

  const isSelected = (id) => selectedIds.includes(id);

  return (
    <>
      {bookings?.map((item) => (
        <tr key={item._id} className="hover">
          <td className="w-12 text-center">
            <input
              type="checkbox"
              checked={isSelected(item._id)}
              onChange={(e) => onSelect && onSelect(item._id, e.target.checked)}
              aria-label={`Select parcel ${item._id}`}
            />
          </td>
          <td className="font-semibold">{item?.name}</td>
          <td>{item?.phone}</td>
          <td className="text-sm">
            <p>{item?.requestedDeliveryDate}</p>
            {item?.approximateDeliveryDate && (
              <p className="text-xs text-base-content/55">ETA {item.approximateDeliveryDate}</p>
            )}
          </td>
          <td className="text-sm">{item?.bookingDate?.split?.("T")?.[0]}</td>
          <td className="font-semibold">{item?.price} TK</td>
          <td className="text-center">
            <StatusPill status={item?.status} />
            <div className="mt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => openManage(item._id)}
                className="btn btn-primary btn-sm"
              >
                Manage
              </button>
              <Link to={`/dashboard/updateItem/${item._id}`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
            </div>
          </td>
        </tr>
      ))}
      <AllParcelsModal id={selectedId} />
    </>
  );
};

AllParcelsTable.propTypes = {
  bookings: PropTypes.array,
  selectedIds: PropTypes.array,
  onSelect: PropTypes.func,
};

export default AllParcelsTable;

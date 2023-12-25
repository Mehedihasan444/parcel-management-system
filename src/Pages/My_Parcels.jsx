

const My_Parcels = () => {



  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-5">My_Parcels</h1>
      <span className="divider"></span>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-base">
              <th>#</th>
              <th>Parcel Type</th>
              <th>Requested Delivery Date</th>
              <th>Approximate Delivery Date</th>
              <th>Booking Date</th>
              <th>Delivery Men ID</th>
              <th>Booking Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {parcel?.map((item, idx) => (
              <tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.parcelType}</td>
                <td>{item?.requestedDeliveryDate}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  {" "}
                  <button className="btn btn-sm">{item?.status}</button>
                </td>
                <td>
                  <div className="flex gap-3">
                    <Link to={`/dashboard/updateBooking/${item?._id}`}>
                      <button className="btn btn-sm">Update</button>
                    </Link>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleDelete(item?._id)}
                    >
                      Cancel
                    </button>
                    <Link to={`/review/${item?._id}`}>
                      <button className="btn btn-sm">Review</button>
                    </Link>
                    <Link to={`/billPay/${item?._id}`}>
                      <button className="btn btn-sm">Pay</button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))} */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default My_Parcels;

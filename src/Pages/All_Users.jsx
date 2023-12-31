import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAxiosSecure from "../hooks/useAxiosSecure";
import TotalSpendAmountCal from "../Components/TotalSpendAmountCal/TotalSpendAmountCal";
import { useEffect, useState } from "react";
import NumberOfParcelBooked from "../Components/NumberOfParcelBooked/NumberOfParcelBooked";

const All_Users = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(1);

  const { data: allUsers, refetch } = useQuery({
    queryKey: ["allUsers",currentPage],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users?page=${currentPage}`);
      return res.data;
    },
  });
  useEffect(() => {
    if (allUsers) {
      const count = allUsers?.count;
      // console.log(count);
      const NumOfPages = Math.ceil(count / 5);
      setNumberOfPages(NumOfPages);
    }
  }, [allUsers]);
  const handleMakeAdmin = async (email) => {
    // console.log(email);
    const info = {
      role: "admin",
    };
    await axiosSecure.patch(`/users/${email}`, info).then((res) => {
      console.log(res.data);
      refetch();
    });
  };
  const handleMakeDeliveryMen = async (email) => {
    // console.log(email);
    const info = {
      role: "deliveryMen",
    };
    await axiosSecure.patch(`/users/${email}`, info).then((res) => {
      console.log(res.data);
      refetch();
    });
  };
  refetch()
  const pages = [...Array(numberOfPages)];
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
   
      console.log('hello')
    }
  };
  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
      // refetch()
      console.log('hello')

    }
  };
  // console.log('check',numberOfParcelBooked)

  return (
    <div className="">
      <SectionTitle
        heading={"Manage all users"}
        subHeading={"How Many??"}
      ></SectionTitle>
      <div className="flex justify-around ">
        <h1 className="text-4xl font-bold ">
          Total Users: {allUsers?.count}
        </h1>
      </div>
      {/* table */}

      <div className="overflow-x-auto mt-3">
        <table className="table table-xs text-center">
          {/* head */}
          <thead className="text-base border">
            <tr>
              <th>#</th>

              <th>Name</th>
              <th>Phone</th>
              <th>Number of Parcel Booked</th>
              <th>Total Spent Amount</th>
              <th>Make Delivery Men</th>
              <th>Make Admin</th>
            </tr>
          </thead>
          <tbody>
            {allUsers?.result?.map((item, i) => (
              <tr key={item._id}>
                <td>{i + 1}</td>
                <td> {item?.name} </td>
                <td>{item?.phone}</td>
                <td>
                  {/* {numberOfParcelBooked.length}  */}
                  <NumberOfParcelBooked
                    email={item?.email}
                  ></NumberOfParcelBooked>
                </td>
                <td>
                  <TotalSpendAmountCal email={item?.email} />
                </td>
                <th>
                  <button
                    onClick={() => {
                      handleMakeDeliveryMen(item?.email);
                    }}
                    className="btn btn-primary  border-none text-white"
                    disabled={item.role === "deliveryMen" ? true : false}
                  >
                    Delivery Men
                  </button>
                </th>
                <td>
                  {
                    // item.role==='admin'?"Admin":
                    <button
                      onClick={() => {
                        handleMakeAdmin(item?.email);
                      }}
                      disabled={item.role === "admin" ? true : false}
                      className="btn btn-primary border-none text-white"
                    >
                      Admin
                    </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="">
        <button className={`btn btn-accent mr-3 ${currentPage === 1 ? "btn-disabled" : ""
            }`} onClick={handlePreviousPage}>
          «
        </button>
        {pages?.map((page, idx) => (
          <button key={idx} className={`${ currentPage === idx + 1 ? "btn-disabled" : ""
            } mr-2 btn btn-accent`}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button className={`btn btn-accent mr-3 ${currentPage === pages.length ? "btn-disabled" : ""
            }`}  onClick={handleNextPage}>
          »
        </button>
      </div>
    </div>
  );
};

export default All_Users;

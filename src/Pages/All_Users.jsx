
// import { FaTrash, FaUsers } from "react-icons/fa";
import SectionTitle from "../Components/SectionTitle/SectionTitle";

const All_Users = () => {
   
  
    return (
      <div className="">
        <SectionTitle
          heading={"Manage all users"}
          subHeading={"How Many??"}
        ></SectionTitle>
        <div className="flex justify-around ">
          <h1 className="text-4xl font-bold ">Total Users: </h1>
        </div>
        {/* table */}
  
        <div className="overflow-x-auto mt-3">
          <table className="table">
            {/* head */}
            <thead className="text-2xl bg-[#D1A054] text-white">
              <tr>
                <th>#</th>
  
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* {users.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
  
                  <td>
                    <div className="font-bold">{item.name}</div>
                  </td>
                  <td>{item.email}</td>
                  <td> 
                      {
                          item.role==='admin'?"Admin": <button
                      onClick={() => {
                        handleMakeAdmin(item._id, item.name);
                      }}
                      className="btn btn-primary bg-[#D1A054] border-none text-white"
                    >
                      <FaUsers />
                    </button>
                      }
                     </td>
                  <th>
                    <button
                      onClick={() => {
                        handleDeleteUser(item._id, item.name);
                      }}
                      className="btn btn-primary bg-[#D1A054] border-none text-white"
                    >
                      <FaTrash />
                    </button>
                  </th>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

export default All_Users;




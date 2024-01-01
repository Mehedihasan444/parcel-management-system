import { useQuery } from "@tanstack/react-query";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import SectionTitle from "../Components/SectionTitle/SectionTitle";


const PaymentHistory = () => {
const {user}=useAuth()
const axiosSecure = useAxiosSecure();

const { data: payments=[] } = useQuery({
  queryKey: ["payments"],
  queryFn: async () => {
    const res = await axiosSecure.get(`/payments/${user.email}`);
    return res.data;
  },
});

console.log(payments)
    
    return (
        <div className="sm:w-[70vw]">
            <h1 className=""></h1>
            <SectionTitle heading={"Payment History"} subHeading={"At a Glance!"}></SectionTitle>
            <div className="overflow-x-auto mt-3">
        <table className="table table-md text-center border">
          {/* head */}
          <thead className="">
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Transaction Id</th>
              <th>Total Price</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item,i) => (
              <tr key={item._id}>
                <td>{i+1}</td>
            
                <td>{item.email}</td>
                <td>{item.transactionId}</td>
                <td>${item.price}</td>
                <td>{item.date}</td>
                <td>{item.status}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
    );
};

export default PaymentHistory;
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import { useEffect } from "react";
import DeliveryCounter from "../Components/DeliveryCounter/DeliveryCounter";
import AverageReviewCal from "../Components/AverageReviewCal/AverageReviewCal";


const All_Delivery_Men = () => {
    const {user}=useAuth()
    const axiosSecure = useAxiosSecure();

    const { data: allDeliveryMen = [], refetch } = useQuery({
      queryKey: ["allDeliveryMen"],
      queryFn: async () => {
        const res = await axiosSecure.get('/users/admin/deliveryMens')
        return res.data;
      },
    });

//console.log(allDeliveryMen)



    return (
        <div>
      <SectionTitle heading={"all DeliveryMen's"}></SectionTitle>
      {/* <span className="divider"></span> */}
      <div className="overflow-x-auto">
        <table className="table table-md text-center border">
          <thead className="border">
            <tr className="text-base">
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Number of parcel delivered</th>
              <th>Average review</th>
              
            </tr>
          </thead>
          <tbody className="">
          {
            allDeliveryMen?.map((item, idx) => (<tr key={item._id}>
                <th>{idx + 1}</th>
                <td>{item?.name}</td>
                <td>{item?.phone}</td>
                <td>
                  <DeliveryCounter id={item._id}></DeliveryCounter>
                  {/* {item?.numberOfParcelDelivered} */}
                  </td>
                <td>

                  <AverageReviewCal id={item?._id}></AverageReviewCal>
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

export default All_Delivery_Men;
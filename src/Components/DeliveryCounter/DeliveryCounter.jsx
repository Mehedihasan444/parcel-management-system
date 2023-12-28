import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";


const DeliveryCounter = ({id}) => {
const axiosSecure = useAxiosSecure()

console.log(id)
const { data: numberOfDelivery, refetch } = useQuery({
    queryKey: ["numberOfDelivery",id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/deliveryMen/delivery/count/${id}`)
      return res.data;
    },
  });
console.log(numberOfDelivery)

    return (
        <div>
            <h1 className="text-center">{numberOfDelivery?.length}</h1>
        </div>
    );
};

export default DeliveryCounter;
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useDeliveryMen = (): [boolean | undefined, boolean] => {
  const auth = useAuth();
  const axiosSecure = useAxiosSecure();
  const email = auth?.user?.email;
  const { data: isDeliveryMen, isPending: isDeliveryMenLoading } = useQuery({
    queryKey: [email, "isDeliveryMen"],
    enabled: !!email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/deliveryMen/${email}`);
      return res.data?.deliveryMen as boolean | undefined;
    },
  });
  return [isDeliveryMen, isDeliveryMenLoading];
};

export default useDeliveryMen;

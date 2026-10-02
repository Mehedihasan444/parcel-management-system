import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = (): [boolean | undefined, boolean] => {
  const auth = useAuth();
  const axiosSecure = useAxiosSecure();
  const email = auth?.user?.email;
  const { data: isAdmin, isPending: isAdminLoading } = useQuery({
    queryKey: [email, "isAdmin"],
    enabled: !!email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin/${email}`);
      return res.data?.admin as boolean | undefined;
    },
  });
  return [isAdmin, isAdminLoading];
};

export default useAdmin;

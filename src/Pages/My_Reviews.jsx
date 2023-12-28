import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../Hooks/useAxiosSecure";

import { Rating } from "@smastrom/react-rating";

const My_Reviews = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: users = {} } = useQuery({
    queryKey: ["users"], // You might need to adjust the key based on your API response structure
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
  });
  const { data: reviews = [],refetch } = useQuery({
    queryKey: ["reviews"], // You might need to adjust the key based on your API response structure
    queryFn: async () => {
      const res = await axiosSecure.get(`/delivery/reviews/${users._id}`);
      return res.data;
    },
  });

  return (
    <div>
      <SectionTitle heading={"My Reviews"} subHeading={""}></SectionTitle>

      <div className="" onChange={()=>refetch()}>
        {reviews?.map((review) => ( 
          <div key={review.id} className="bg-white p-4 rounded shadow-md flex gap-4 mb-5">
            <div className="mb-2 ">
              <img
                src={review?.image}
                alt={`Profile of ${review?.name}`}
                className="rounded-full  w-12 object-cover "
              />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-center ">
                   <h3 className="font-bold text-2xl">
               {review?.name}
              </h3>
              <p className="">{review?.reviewDate}</p>
              </div>
           
              <div className=" " >
      <Rating style={{ maxWidth: 100 }} value={review?.rating} readOnly />
    </div>
              
              <p className="text-xs"><span className="font-semibold">Feedback:<br /> </span> {review.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default My_Reviews;




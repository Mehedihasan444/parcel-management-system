import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import useAuth from "../Hooks/useAuth";
import useAxiosSecure from "../hooks/useAxiosSecure";


const My_Reviews = () => {
const {user}=useAuth()
const axiosSecure =useAxiosSecure()
    const { data: reviews, error } = useQuery({
        queryKey: ['deliveryReviews'], // You might need to adjust the key based on your API response structure
        queryFn: async () => {
          const res = await axiosSecure.get(`/delivery/reviews/${user.email}`);
          return res.data;
        },
      });

      if (error) {
        return <div>Error fetching reviews</div>;
      }
    return (
        <div>
    
            <SectionTitle heading={"My Reviews"} subHeading={""}></SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reviews &&
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded shadow-md">
              <div className="mb-2">
                <img
                  src={review.giverImage}
                  alt={`Profile of ${review.giverName}`}
                  className="rounded-full h-12 w-12 object-cover"
                />
              </div>
              <div className="mb-2">
                <strong>{review.giverName}</strong>
              </div>
              <div className="mb-2">Rating: {review.rating}/5</div>
              <div className="mb-2">Review Date: {review.reviewDate}</div>
              <div>Feedback: {review.feedback}</div>
            </div>
          ))}
      </div>
    </div>
    );
};

export default My_Reviews;
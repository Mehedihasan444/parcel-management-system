import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useEffect } from "react";

const AverageReviewCal = ({ id }) => {
  const axiosSecure = useAxiosSecure();

  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["reviews"], // You might need to adjust the key based on your API response structure
    queryFn: async () => {
      const res = await axiosSecure.get(`/delivery/reviews/${id}`);
      return res.data;
    },
  });
  // console.log(reviews.length);
  let avgReview=0;
  for (let i = 0; i < reviews.length; i++) {
    avgReview += reviews[i].rating;
  }
  let result = avgReview / reviews.length;
  console.log(result);






  useEffect(()=>{
    axiosSecure.patch(`/deliveryMen/reviews/average/${id}`,{rating:result})
    .then((res)=>{
      console.log(res.data)
    
    })
  },[axiosSecure,id,result])



  return <div className="text-center">{result}</div>;
};

export default AverageReviewCal;

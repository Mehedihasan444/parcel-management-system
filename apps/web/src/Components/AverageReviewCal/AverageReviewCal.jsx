import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useEffect } from "react";
import PropTypes from "prop-types";

const AverageReviewCal = ({ id }) => {
  const axiosSecure = useAxiosSecure();

  const { data: reviews = [] } = useQuery({
    queryKey: ["averageReviews", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/delivery/reviews/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
  let avgReview = 0;
  for (let i = 0; i < reviews.length; i++) {
    avgReview += reviews[i].rating;
  }
  const result = reviews.length ? avgReview / reviews.length : 0;

  useEffect(() => {
    if (!id || !Number.isFinite(result)) return;
    axiosSecure.patch(`/deliveryMen/reviews/average/${id}`, { rating: result }).catch(() => {});
  }, [axiosSecure, id, result]);

  return <div className="text-center">{reviews.length ? result.toFixed(1) : "—"}</div>;
};

AverageReviewCal.propTypes = {
  id: PropTypes.string,
};

export default AverageReviewCal;

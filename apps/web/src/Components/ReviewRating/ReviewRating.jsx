import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";
import { useState } from "react";
import PropTypes from "prop-types";

const ReviewRating = ({ setRatingValue }) => {
  const [rating, setRating] = useState(0);
  setRatingValue(rating);
  return (
    <div className="flex justify-center ">
      <Rating style={{ maxWidth: 250 }} value={rating} onChange={setRating} />
    </div>
  );
};

ReviewRating.propTypes = {
  setRatingValue: PropTypes.func.isRequired,
};

export default ReviewRating;

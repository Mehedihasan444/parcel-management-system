import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";
import { useState } from "react";

const ReviewRating = ({setRatingValue}) => {
  const [rating, setRating] = useState(0);
  setRatingValue(rating)
  return (
    <div className="flex justify-center ">
      <Rating style={{ maxWidth: 250 }} value={rating} onChange={setRating} />
    </div>
  );
};

export default ReviewRating;

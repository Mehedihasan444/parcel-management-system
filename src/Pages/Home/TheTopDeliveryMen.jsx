import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa6";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { Rating } from "@smastrom/react-rating";

const TheTopDeliveryMen = () => {
  const axiosSecure = useAxiosSecure();
  const [data, setData] = useState([]);
  useEffect(() => {
    axiosSecure.get("/users/admin").then((res) => setData(res.data));
  }, [axiosSecure]);
  const sortedData = data.sort((a, b) => b.avgRating - a.avgRating);

  console.log(sortedData);
  const deliveryMen = sortedData.filter((data) => data.role === "deliveryMen");

  return (
    <div className="max-w-7xl mx-auto my-16">
      <h1 className="text-4xl font-bold text-center mb-10">
        The Top Delivery Man
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
        {deliveryMen?.slice(0, 5).map((card) => (
          <div
            className="relative flex flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border"
            key={card?.id}
          >
            <div className="relative flex justify-center mx-4 mt-4 overflow-hidden text-gray-700 bg-white shadow-md  h-40 rounded-xl bg-clip-border">
              <img
                src={card?.image}
                alt="profile-picture "
                className="bg-cover  h-full"
              />
            </div>
            <div className="p-6 text-center">
              <h4 className="block mb-2 font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
                {card?.name}
              </h4>
              <p className="block font-sans text-base antialiased font-medium leading-relaxed text-transparent bg-gradient-to-tr from-pink-600 to-pink-400 bg-clip-text">
                <span>Parcel delivered {card?.parcelDelivered}</span>
              </p>
               <div className="flex justify-center items-center ">
              <Rating
                style={{ maxWidth: 150 }}
                value={card?.avgRating}
                readOnly
              />
            </div>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheTopDeliveryMen;

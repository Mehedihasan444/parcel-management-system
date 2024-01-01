import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { Rating } from "@smastrom/react-rating";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";

const TheTopDeliveryMen = () => {
  const axiosSecure = useAxiosSecure();
  const [data, setData] = useState([]);
  useEffect(() => {
    axiosSecure.get("/users/admin").then((res) => setData(res.data));
  }, [axiosSecure]);
  const sortedData = data.sort((a, b) => {
    const ratingA = a.avgRating || 0;
    const ratingB = b.avgRating || 0;
    const deliveredA = a.parcelDelivered || 0;
    const deliveredB = b.parcelDelivered || 0;
  
    return ratingB - ratingA || deliveredB - deliveredA;
  });
  
  // console.log(sortedData);
  const deliveryMen = sortedData.filter((data) => data.role === "deliveryMen");

  return (
    <div className="max-w-7xl mx-auto my-16">
      {/* <h1 className="text-4xl font-bold text-center mb-10">
        
      </h1> */}
      <SectionTitle
        heading={"The Top Delivery Man"}
        subHeading={"Users Choice"}
      />
      <div className="grid grid-cols-1 px-10 sm:px-0 justify-center sm:grid-cols-5 gap-5">
        {deliveryMen?.slice(0, 5).map((card) => (

          <div className="flex justify-center items-center"  key={card?.id}>
<div
            className="relative flex flex-col w-64 sm:w-full  text-gray-700 bg-white shadow-md rounded-xl bg-clip-border"
           
          >
            <div className="relative flex justify-center mx-4 mt-4 overflow-hidden text-gray-700 bg-white shadow-md  h-40 rounded-xl bg-clip-border">
              <img
                src={card?.image}
                alt="profile-picture "
                className="bg-cover w-full object-cover  h-full"
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
          </div>
          
        ))}
      </div>
    </div>
  );
};

export default TheTopDeliveryMen;

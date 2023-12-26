import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa6";

const TheTopDeliveryMen = () => {

    const [data, setData] = useState([]);
    useEffect(() => {
      axios.get('TopDeliveryMenData.json')
      .then(res => setData(res.data));
    }, []);


    return (
        <div className="max-w-7xl mx-auto my-16">
      <h1 className="text-4xl font-bold text-center mb-10">The Top Delivery Man</h1>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
        {data?.slice(0,5).map((card) => (
          <div className="relative flex flex-col text-gray-700 bg-white shadow-md rounded-xl bg-clip-border" key={card?.id}>
          <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white shadow-md  h-40 rounded-xl bg-clip-border">
            <img src={card?.image} alt="profile-picture " className="bg-cover  h-full"/>
          </div>
          <div className="p-6 text-center">
            <h4 className="block mb-2 font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
              {card?.name}
            </h4>
            <p className="block font-sans text-base antialiased font-medium leading-relaxed text-transparent bg-gradient-to-tr from-pink-600 to-pink-400 bg-clip-text">
             <span>
              Parcel delivered {card?.parcelsDelivered}
              </span> 
            </p>
          </div>
          <div className="flex justify-center p-6 pt-2 gap-1">
            
          
           <FaStar />
           <FaStar />
          <FaStar />
          <FaStar />
          <FaStar /> 
          </div>
        </div>
        
         ))}
      </div>
    </div>
    );
};

export default TheTopDeliveryMen;
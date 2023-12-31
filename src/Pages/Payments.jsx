import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../Components/CheckoutForm/CheckoutForm";
import { useParams } from "react-router-dom";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import { useEffect, useState } from "react";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_GATEWAY_PK);

const Payments = () => {
const {id}=useParams()
const axiosSecure =useAxiosSecure()
const [data,setData]=useState({})



useEffect(()=>{
  axiosSecure.get(`/users/booking/${id}`)
    .then((res)=>setData(res.data))
},[axiosSecure,id])
console.log("data",data)

  return (
    <div>
      <SectionTitle
        heading={"payment"}
        subHeading={"Please pay to proceed"}
      ></SectionTitle>
      <div className="">
        <Elements stripe={stripePromise}>
          <CheckoutForm data={data}/>
        </Elements>
      </div>
    </div>
  );
};

export default Payments;

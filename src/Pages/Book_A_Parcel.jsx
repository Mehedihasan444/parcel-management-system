import SectionTitle from "../Components/SectionTitle/SectionTitle";
import { useForm } from "react-hook-form"
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import useAxiosPublic from "../Hooks/useAxiosPublic";
const Book_A_Parcel = () => {
  const {user}=useAuth()
  const axiosPublic= useAxiosPublic()
  const { register, handleSubmit,watch,reset } = useForm()
  const onSubmit = async (data) =>{
  
    console.log(data.weight);

  let price;

    if (data.weight === '1') {
      price = 50;
    } else if (data.weight === '2') {
      price = 100;
    } else if (data.weight > 2) {
      price = 150;
    } else {
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: `Invalid ${data.weight} weight. enter valid weight`,
        showConfirmButton: false,
        timer: 1500,
      });
return ;
    }
const info = {
  ...data,price: price,
}
   const res= await  axiosPublic.post('/users/bookings',info)
    console.log(res.data)
    if (res.data.insertedId) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Booking success",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    else{
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Something went wrong",
        showConfirmButton: false,
        timer: 1500,
      });
    }


  }



  return (
    <div>
  
      <SectionTitle heading={" Book a Parcel"} subHeading={"Make Your Life Easy"}></SectionTitle>
      {/* <div className="divider"></div> */}
      <div className=" shadow-md rounded-md p-10 bg-slate-200">
         <form  onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <div className="flex justify-between gap-5">
          <div className="flex flex-col flex-1">
            <label htmlFor="name" className="mb-1 text-gray-700">
              Name:
            </label>
            <input 
             {...register("name")}
            defaultValue={user?.displayName}
              type="text"
              name="name"
    
              readOnly
              className="p-2 border rounded"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label htmlFor="email" className="mb-1 text-gray-700">
              Email:
            </label>
            <input 
             {...register("email")}
            defaultValue={user?.email}
              type="email"
              name="email"
         
              readOnly
              className="p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-between gap-5">
          <div className="flex flex-col flex-1">
            <label htmlFor="phone" className="mb-1 text-gray-700">
              Phone Number:
            </label>
            <input 
             {...register("phone")}
              type="tel"
              name="phone"
              placeholder="Phone Number"
            
              className="p-2 border rounded"
              required
            />
          </div>
          <div className="flex flex-col flex-1">
            <label htmlFor="parcelType" className="mb-1 text-gray-700">
              Parcel Type:
            </label>
            <input 
             {...register("parcelType")}
              type="text"
              name="parcelType"
              placeholder="Parcel Type"
          
              className="p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="flex justify-between gap-5">
          <div className="flex flex-col flex-1">
            <label htmlFor="receiverName" className="mb-1 text-gray-700">
              Receiver's Name:
            </label>
            <input 
             {...register("receiverName")}
              type="text"
              name="receiverName"
              placeholder="Receiver's Name"
            
            
              className="p-2 border rounded"
              required
            />
          </div>
          <div className="flex flex-col flex-1">
            <label htmlFor="parcelWeight" className="mb-1 text-gray-700">
              Parcel Weight (kg):
            </label>
            <input 
             {...register("weight")}
             
              type="number"
              name="weight"
              placeholder="Parcel Weight (kg)"
              min="0.1"
              step="0.1"
     
              className="p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="receiverPhone" className="mb-1 text-gray-700">
            Receiver's Phone Number:
          </label>
          <input 
           {...register("receiverPhone")}
            type="tel"
            name="receiverPhone"
            placeholder="Receiver's Phone Number"
    
            className="p-2 border rounded"
            required
          />
        </div>
        <div className="flex justify-between items-center gap-5">
          <div className="flex flex-col flex-1">
             <label htmlFor="deliveryAddressLatitude " className="mb-1 text-gray-700">
          Delivery Address Latitude 

          </label>
          <input 
           {...register("deliveryAddressLatitude")} type="text"
            name="deliveryAddressLatitude"
            placeholder="i.e 21.121365496"
     
            className="p-2 border rounded"
            required
          />
          </div>
          <div className="flex flex-col flex-1">
          <label htmlFor="deliveryAddressLongitude" className="mb-1 text-gray-700">
  Delivery Address longitude
          </label>
          <input 
           {...register("deliveryAddressLongitude")} type="text"
            name="deliveryAddressLongitude"
            placeholder="i.e 21.121365496"
     
            className="p-2 border rounded"
            required
          />
          </div>
         
        </div>
        <div className="flex flex-col">
          <label htmlFor="requestedDeliveryDate" className="mb-1 text-gray-700">
            Requested Delivery Date:
          </label>
          <input 
           {...register("requestedDeliveryDate")}
            type="date"
            name="requestedDeliveryDate"
     
            className="p-2 border rounded"
            required
          />
        </div>
        <div className="flex justify-between mt-4">
          {/* <button
            type="button"
            onClick={calculatePrice}
            className="bg-green-500 text-white p-2 rounded cursor-pointer"
          >
            Calculate Price
          </button> */}
          <button
            type="submit"
            className="btn px-10 text-lg bg-blue-500 text-white "
          >
            Book
          </button>
        </div>
      </form>
      </div>
     
    </div>
  );
};

export default Book_A_Parcel;

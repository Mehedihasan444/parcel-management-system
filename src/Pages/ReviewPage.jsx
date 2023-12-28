import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import ReviewRating from "../Components/ReviewRating/ReviewRating";
import { useState } from "react";

const ReviewPage = ({ id }) => {
  const { register, handleSubmit, watch ,reset} = useForm();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
const [ratingValue,setRatingValue]=useState()

  const { data: bookingData = {} } = useQuery({
    queryKey: ["bookingData"],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
  });

  console.log(bookingData);

  const onSubmit = async (data) => {
    console.log(data)
    // console.log(ratingValue)

    const res = await axiosSecure.post('/users/reviews',{...data, rating: ratingValue ,image:user?.photoURL})
      console.log(res.data);
      if (res.data.insertedId) {
        reset()
          Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Review submitted successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      }else{
             Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Something went wrong",
        showConfirmButton: false,
        timer: 1500,
      });
      }


    
 
  };

  return (
    <div>
      <dialog id="my_modal_3" className="modal text-black">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-bold text-2xl mb-5">Give Review</h3>
            <div className="space-y-3">
              <div className="flex justify-center items-center ">
                <img src={user?.photoURL}  alt="" className="rounded-full" />
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor="deliveryMen" className="text-base text-left">
                    Name:
                  </label>
                  <input
                    {...register("name")}
                    defaultValue={bookingData?.name}
                    type="text"
                    readOnly
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs sm:w-[450px]"
                  />
                </div>
              </div>
              <div className="">
                {/*rating  */}
                <ReviewRating setRatingValue ={setRatingValue}></ReviewRating>
                </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor="deliveryMen" className="text-base text-left">
                    Feedback:
                  </label>
                  <textarea {...register("feedback")} 
                  className="textarea textarea-bordered h-24 max-w-xs sm:w-[450px]"  
                  placeholder="Type here" 
                  name="feedback" id="" cols="30" rows="10"/>

                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor="deliveryMen" className="text-base text-left">
                    Delivery Men Id:
                  </label>
                  <input
                    {...register("deliveryMenID")}
                    defaultValue={bookingData?.deliveryMenID}
                    type="text"
                    readOnly
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs sm:w-[450px]"
                  />
                </div>
              </div>

              <button
                //   onClick={handleAssign}
                className="btn btn-primary "
              >
                submit
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default ReviewPage;

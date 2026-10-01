import SectionTitle from "../Components/SectionTitle/SectionTitle";
import { useForm } from "react-hook-form";
import useAuth from "../Hooks/useAuth";
import { notify } from "../lib/notify";
import { calculatePrice } from "../lib/pricing";
import useAxiosPublic from "../Hooks/useAxiosPublic";
const Book_A_Parcel = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = async (data) => {
    // console.log(data.weight);

    const price = calculatePrice(data.weight);
    if (price === null) {
      notify.warning(`Invalid ${data.weight} weight. Enter a valid weight`);
      return;
    }
    const info = {
      ...data,
      bookingDate: new Date(),
      price: price,
      status: "pending",
      deliveryMenID: "",
    };
    const res = await axiosPublic.post("/users/bookings", info);
    console.log(res.data);
    if (res.data.insertedId) {
      reset();
      notify.success("Booking successful");
    } else {
      notify.error("Something went wrong");
    }
  };

  return (
    <div>
      <SectionTitle heading={" Book a Parcel"} subHeading={"Make Your Life Easy"}></SectionTitle>
      {/* <div className="divider"></div> */}
      <div className=" shadow-md rounded-md p-10 sm:w-[60vw] bg-slate-200">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
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
                Receiver&apos;s Name:
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
              Receiver&apos;s Phone Number:
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
                {...register("deliveryAddressLatitude")}
                type="text"
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
                {...register("deliveryAddressLongitude")}
                type="text"
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
            <button type="submit" className="btn px-10 text-lg bg-blue-500 text-white ">
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Book_A_Parcel;

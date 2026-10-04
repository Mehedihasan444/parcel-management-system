import { notify } from "../lib/notify";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import ReviewRating from "../Components/ReviewRating/ReviewRating";
import Avatar from "../Components/UI/Avatar";
import { useId, useState } from "react";
import PropTypes from "prop-types";

const ReviewPage = ({ id }) => {
  const { register, handleSubmit, reset } = useForm();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [ratingValue, setRatingValue] = useState();
  const dialogId = `review-modal-${id || "standalone"}`;
  const titleId = useId();

  const { data: bookingData = {} } = useQuery({
    queryKey: ["bookingData", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const openModal = () => {
    const dialog = document.getElementById(dialogId);
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  };

  const onSubmit = async (data) => {
    if (!ratingValue) {
      notify.warning("Please pick a star rating first");
      return;
    }
    try {
      const res = await axiosSecure.post("/users/reviews", {
        ...data,
        rating: ratingValue,
        image: user?.image,
        deliveryMenID: data.deliveryMenID || bookingData?.deliveryMenID,
        name: data.name || bookingData?.name || user?.name,
      });
      if (res.data.insertedId) {
        reset();
        setRatingValue(undefined);
        notify.success("Review submitted successfully");
        document.getElementById(dialogId)?.close?.();
      } else {
        notify.error("Something went wrong");
      }
    } catch {
      notify.error("Something went wrong");
    }
  };

  return (
    <div>
      {id && (
        <button
          type="button"
          className="btn btn-sm border-0 bg-brand-500 text-white hover:bg-brand-600"
          onClick={openModal}
        >
          Review
        </button>
      )}
      <dialog id={dialogId} className="modal text-black" aria-labelledby={titleId}>
        <div className="modal-box">
          <form method="dialog">
            <button
              type="submit"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label="Close"
            >
              &times;
            </button>
          </form>

          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 id={titleId} className="font-bold text-2xl mb-5">
              Give Review
            </h3>
            {!id && (
              <p className="mb-4 text-sm text-base-content/70">
                Pick a delivered parcel from My Parcels to pre-fill this form.
              </p>
            )}
            <div className="space-y-3">
              <div className="flex justify-center items-center ">
                <Avatar
                  src={user?.image}
                  name={user?.name}
                  email={user?.email}
                  className="h-20 w-20 rounded-full text-xl"
                />
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor={`name-${dialogId}`} className="text-base text-left">
                    Name:
                  </label>
                  <input
                    {...register("name")}
                    defaultValue={bookingData?.name}
                    type="text"
                    readOnly={Boolean(bookingData?.name)}
                    placeholder="Type here"
                    id={`name-${dialogId}`}
                    className="input input-bordered w-full max-w-xs sm:w-[450px]"
                  />
                </div>
              </div>
              <div>
                <ReviewRating setRatingValue={setRatingValue} />
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor={`feedback-${dialogId}`} className="text-base text-left">
                    Feedback:
                  </label>
                  <textarea
                    {...register("feedback")}
                    className="textarea textarea-bordered h-24 max-w-xs sm:w-[450px]"
                    placeholder="Type here"
                    id={`feedback-${dialogId}`}
                    cols={30}
                    rows={10}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="flex flex-col ">
                  <label htmlFor={`rider-${dialogId}`} className="text-base text-left">
                    Delivery Men Id:
                  </label>
                  <input
                    {...register("deliveryMenID")}
                    defaultValue={bookingData?.deliveryMenID}
                    type="text"
                    readOnly={Boolean(bookingData?.deliveryMenID)}
                    placeholder="Type here"
                    id={`rider-${dialogId}`}
                    className="input input-bordered w-full max-w-xs sm:w-[450px]"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">
                submit
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

ReviewPage.propTypes = {
  id: PropTypes.string,
};

export default ReviewPage;

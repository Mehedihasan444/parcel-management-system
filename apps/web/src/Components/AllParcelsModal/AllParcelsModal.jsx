import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { notify } from "../../lib/notify";
import PropTypes from "prop-types";

export const ADMIN_ASSIGN_DIALOG_ID = "admin-assign-modal";

const AllParcelsModal = ({ id }) => {
  const { register, handleSubmit, reset } = useForm();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const { data: deliveryMen = [] } = useQuery({
    queryKey: ["deliveryMen"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users/admin");
      return res.data;
    },
  });

  const deliMenFilter = deliveryMen.filter(
    (deliMan) => deliMan.role !== "admin" && deliMan.role !== "user"
  );

  const onSubmit = async (data) => {
    if (!id) {
      notify.warning("Pick a parcel first");
      return;
    }
    if (!data.selectedDeliveryMen || !data.approximateDeliveryDate) {
      notify.warning("Choose a rider and an approximate date");
      return;
    }
    setPending(true);
    try {
      const res = await axiosSecure.patch(`/users/bookings/assign/deliveryMen/${id}`, {
        approximateDeliveryDate: data.approximateDeliveryDate,
        selectedDeliveryMen: data.selectedDeliveryMen,
      });
      if (res.data.modifiedCount > 0) {
        reset();
        await queryClient.invalidateQueries({ queryKey: ["allParcels"] });
        notify.success("Delivery partner assigned successfully");
        document.getElementById(ADMIN_ASSIGN_DIALOG_ID)?.close?.();
      } else {
        notify.error("Nothing changed — assignment not saved");
      }
    } catch {
      notify.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <dialog id={ADMIN_ASSIGN_DIALOG_ID} className="modal text-black">
      <div className="modal-box">
        <form method="dialog">
          <button
            type="submit"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label="Close"
          >
            ✕
          </button>
        </form>

        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold text-2xl mb-5">Assign Delivery Man</h3>
          {!id && (
            <p className="mb-3 text-sm text-base-content/70">
              Select Manage on a parcel row first.
            </p>
          )}
          <div className="space-y-3">
            <div className="flex justify-center items-center">
              <div className="flex flex-col ">
                <label htmlFor="deliveryMen" className="text-base text-left">
                  Delivery Man:
                </label>
                <select
                  {...register("selectedDeliveryMen")}
                  id="deliveryMen"
                  className="select select-bordered w-full sm:w-[430px]"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Pick one
                  </option>
                  {deliMenFilter?.map((deliMan) => (
                    <option key={deliMan._id} value={deliMan._id}>
                      {deliMan.name} - {deliMan._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="flex flex-col ">
                <label htmlFor="deliveryDate" className="text-base text-left">
                  Approximate Delivery Date:
                </label>
                <input
                  {...register("approximateDeliveryDate")}
                  placeholder="Type here"
                  className="input input-bordered w-full sm:w-[430px]"
                  type="date"
                  id="deliveryDate"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={pending || !id}>
              {pending ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : null}
              {pending ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

AllParcelsModal.propTypes = {
  id: PropTypes.string,
};

export default AllParcelsModal;

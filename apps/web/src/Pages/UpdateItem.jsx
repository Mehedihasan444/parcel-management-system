import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiBox, FiMapPin, FiUser } from "react-icons/fi";
import { notify } from "../lib/notify";
import { calculatePrice, PRICE_TIERS } from "../lib/pricing";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import FormField, { inputClass } from "../Components/UI/FormField";
import Loading from "../Components/Shared/Loading";
import DocumentTitle from "../Components/Seo/DocumentTitle";

/* eslint-disable react-hooks/incompatible-library */
function UpdateItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [pending, setPending] = useState(false);

  const {
    data: parcelData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminBooking", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!parcelData) return;
    for (const key of [
      "phone",
      "parcelType",
      "weight",
      "receiverName",
      "receiverPhone",
      "deliveryAddressLatitude",
      "deliveryAddressLongitude",
      "requestedDeliveryDate",
    ]) {
      if (parcelData[key] !== undefined) setValue(key, parcelData[key]);
    }
  }, [parcelData, setValue]);

  const livePrice = calculatePrice(watch("weight"));

  const onSubmit = async (data) => {
    const price = calculatePrice(data.weight);
    if (price === null) {
      notify.warning(`Invalid ${data.weight} weight. Enter a valid weight`);
      return;
    }
    setPending(true);
    try {
      const info = { ...data, bookingDate: new Date(), price };
      const res = await axiosSecure.patch(`/users/updateBooking/${id}`, info);
      if (res.data.modifiedCount > 0) {
        notify.success("Parcel updated");
        navigate("/dashboard/allParcels");
      } else {
        notify.error("Nothing changed — update not saved");
      }
    } catch {
      notify.error("Something went wrong");
    } finally {
      setPending(false);
    }
  };

  if (isLoading) return <Loading label="Loading parcel…" />;
  if (isError || !parcelData) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Edit parcel" />
        <PageHeader
          eyebrow="Admin"
          title="Edit parcel"
          description="This booking could not be loaded. It may have been deleted."
        />
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Edit parcel" />
      <PageHeader
        eyebrow={`Admin · ${parcelData?.email || "booking"}`}
        title="Edit parcel"
        description={`Booking ${parcelData?._id || id} — status: ${parcelData?.status || "unknown"}. Price updates live with weight.`}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm sm:p-8"
        >
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-base-content/60">
              <FiUser aria-hidden="true" /> Sender
            </legend>
            <FormField label="Phone number" htmlFor="phone" className="sm:col-span-2">
              <input
                {...register("phone")}
                type="tel"
                id="phone"
                placeholder="+880 1XXX-XXXXXX"
                className={inputClass}
                required
              />
            </FormField>
          </fieldset>

          <div className="divider" />

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-base-content/60">
              <FiBox aria-hidden="true" /> Parcel & receiver
            </legend>
            <FormField label="Parcel type" htmlFor="parcelType">
              <input
                {...register("parcelType")}
                type="text"
                id="parcelType"
                placeholder="Parcel Type"
                className={inputClass}
                required
              />
            </FormField>
            <FormField
              label="Weight (kg)"
              htmlFor="weight"
              hint="1 kg → ৳50 · 2 kg → ৳100 · above → ৳150"
            >
              <input
                {...register("weight")}
                type="number"
                id="weight"
                placeholder="e.g. 2"
                min="0.1"
                step="0.1"
                className={inputClass}
                required
              />
            </FormField>
            <FormField label="Receiver's name" htmlFor="receiverName">
              <input
                {...register("receiverName")}
                type="text"
                id="receiverName"
                placeholder="Receiver's Name"
                className={inputClass}
                required
              />
            </FormField>
            <FormField label="Receiver's phone" htmlFor="receiverPhone">
              <input
                {...register("receiverPhone")}
                type="tel"
                id="receiverPhone"
                placeholder="+880 1XXX-XXXXXX"
                className={inputClass}
                required
              />
            </FormField>
          </fieldset>

          <div className="divider" />

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-base-content/60">
              <FiMapPin aria-hidden="true" /> Destination
            </legend>
            <FormField label="Latitude" htmlFor="deliveryAddressLatitude">
              <input
                {...register("deliveryAddressLatitude")}
                type="text"
                id="deliveryAddressLatitude"
                placeholder="i.e 23.8103"
                className={inputClass}
                required
              />
            </FormField>
            <FormField label="Longitude" htmlFor="deliveryAddressLongitude">
              <input
                {...register("deliveryAddressLongitude")}
                type="text"
                id="deliveryAddressLongitude"
                placeholder="i.e 90.4125"
                className={inputClass}
                required
              />
            </FormField>
            <FormField
              label="Requested delivery date"
              htmlFor="requestedDeliveryDate"
              className="sm:col-span-2"
            >
              <input
                {...register("requestedDeliveryDate")}
                type="date"
                id="requestedDeliveryDate"
                className={inputClass}
                required
              />
            </FormField>
          </fieldset>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="btn border-0 bg-brand-500 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-70 sm:px-12"
            >
              {pending ? (
                <span className="loading loading-spinner loading-sm" aria-hidden="true" />
              ) : null}
              {pending ? "Updating…" : livePrice !== null ? `Save · ৳${livePrice}` : "Save changes"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => reset()}>
              Reset
            </button>
          </div>
        </form>

        <aside className="hero-mesh sticky top-20 overflow-hidden rounded-3xl p-6 text-white shadow-xl lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
            Order summary
          </p>
          <p className="font-display mt-3 text-5xl font-extrabold">
            {livePrice !== null ? `৳${livePrice}` : "—"}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {livePrice !== null ? "Estimated total" : "Enter a weight to estimate"}
          </p>
          <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
            {PRICE_TIERS.map((t) => (
              <li key={t.label} className="flex items-center justify-between text-white/75">
                <span>{t.label}</span>
                <span className="font-semibold text-white">৳{t.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-white/10 p-3 text-xs leading-relaxed text-white/70">
            Admin edits use the same validated endpoint as customers. Assign riders from All
            Parcels.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default UpdateItem;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiUpload,
  FiXCircle,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import useAuth from "../Hooks/useAuth";
import { notify } from "../lib/notify";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const ProofOfDelivery = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["podBooking", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
  });

  const { data: existingProof } = useQuery({
    queryKey: ["podExisting", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/pod/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (photo) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(photo);
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      notify.error("Please upload a delivery photo");
      return;
    }
    if (!otp.trim()) {
      notify.error("Please enter the delivery OTP");
      return;
    }
    if (!signature.trim()) {
      notify.error("Please enter the receiver's signature");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("otp", otp.trim());
      formData.append("signature", signature.trim());

      const res = await axiosSecure.post(`/pod/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        notify.success("Proof of delivery submitted successfully");
        setPhoto(null);
        setPhotoPreview(null);
        setOtp("");
        setSignature("");
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || "Failed to submit proof of delivery");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Proof of Delivery" />
        <PageHeader eyebrow="Delivery" title="Loading..." description="Fetching booking details" />
        <div className="flex justify-center py-20">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Not Found" />
        <PageHeader eyebrow="Delivery" title="Booking not found" description="This booking doesn't exist" />
        <div className="text-center py-10">
          <FiXCircle className="mx-auto text-6xl text-base-content/30" />
          <Link to="/dashboard/myDeliveryList" className="btn btn-primary mt-6">
            Back to delivery list
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = booking.status === "delivered";
  const isAssignedToMe = String(booking.deliveryMenID) === String(booking.deliveryMenID);

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Proof of Delivery" />
      <PageHeader
        eyebrow="Proof of Delivery"
        title={booking.trackingId || "Delivery"}
        description={`Submit proof for booking #${id.slice(-8)}`}
        actions={
          <span className="badge badge-outline">
            {booking.parcelType} · {booking.weight}kg
          </span>
        }
      />

      {isDelivered && existingProof ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <FiCheckCircle className="mx-auto text-5xl text-emerald-500" />
          <h3 className="mt-3 font-display text-xl font-bold text-emerald-700">
            Already Delivered
          </h3>
          <p className="mt-1 text-sm text-emerald-600">
            This parcel was marked as delivered on{" "}
            {existingProof.deliveredAt
              ? new Date(existingProof.deliveredAt).toLocaleString()
              : "a previous date"}
          </p>
          {existingProof.photoUrl && (
            <img
              src={existingProof.photoUrl}
              alt="Proof of delivery"
              className="mx-auto mt-4 max-h-64 rounded-2xl border border-emerald-200"
            />
          )}
          <div className="mt-4">
            <Link to="/dashboard/myDeliveryList" className="btn btn-primary">
              Back to delivery list
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
            <h3 className="font-display text-lg font-bold">Booking Details</h3>
            <div className="mt-4 space-y-3">
              <DetailRow label="Sender" value={booking.name} />
              <DetailRow label="Receiver" value={booking.receiverName} />
              <DetailRow label="Receiver Phone" value={booking.receiverPhone} />
              <DetailRow label="Delivery Address" value={booking.deliveryAddress} />
              <DetailRow label="Status" value={booking.status} />
              <DetailRow label="Requested Date" value={booking.requestedDeliveryDate} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm"
          >
            <h3 className="font-display text-lg font-bold">Submit Proof</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Delivery Photo *</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    <FiUpload aria-hidden="true" />
                    {photo ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-xl border border-base-200 object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Delivery OTP *</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP provided by sender"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Receiver Signature *</span>
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type receiver's full name as signature"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <FiCheckCircle aria-hidden="true" />
                )}
                {submitting ? "Submitting..." : "Submit Proof of Delivery"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-base-content/50">{label}</span>
    <span className="font-medium text-right">{value || "—"}</span>
  </div>
);

export default ProofOfDelivery;

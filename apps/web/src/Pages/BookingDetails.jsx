import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import useAxiosSecure from "../Hooks/useAxiosSecure";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import StatusPill from "../Components/UI/StatusPill";
import EmptyState from "../Components/UI/EmptyState";

const BookingDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["bookingDetails", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Booking Details" />
        <PageHeader eyebrow="Booking" title="Loading..." description="Fetching booking details" />
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
        <PageHeader eyebrow="Booking" title="Booking not found" description="This booking doesn't exist" />
        <EmptyState
          icon={FiAlertCircle}
          title="Booking not found"
          body="The booking you're looking for doesn't exist or has been removed."
          action={
            <Link to="/dashboard/myParcels" className="btn btn-primary">
              Back to My Parcels
            </Link>
          }
        />
      </div>
    );
  }

  const isDelivered = booking.status === "delivered";

  return (
    <div>
      <DocumentTitle title={`RapidParcelHub | ${booking.trackingId || "Booking"}`} />
      <PageHeader
        eyebrow="Booking Details"
        title={booking.trackingId || `Booking #${id.slice(-8)}`}
        description={`Status: ${booking.status}`}
        actions={<StatusPill status={booking.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Parcel Information</h3>
          <div className="mt-4 space-y-3">
            <DetailRow icon={FiPackage} label="Type" value={booking.parcelType} />
            <DetailRow icon={FiTruck} label="Weight" value={`${booking.weight} kg`} />
            <DetailRow icon={FiClock} label="Requested Date" value={booking.requestedDeliveryDate} />
            <DetailRow
              icon={FiClock}
              label="Approximate Delivery"
              value={booking.approximateDeliveryDate || "—"}
            />
            <DetailRow icon={FiMapPin} label="Pickup Address" value={booking.pickupAddress} />
            <DetailRow icon={FiMapPin} label="Delivery Address" value={booking.deliveryAddress} />
          </div>
        </section>

        <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">People</h3>
          <div className="mt-4 space-y-3">
            <DetailRow icon={FiUser} label="Sender" value={booking.name} />
            <DetailRow icon={FiUser} label="Sender Phone" value={booking.senderPhone} />
            <DetailRow icon={FiUser} label="Receiver" value={booking.receiverName} />
            <DetailRow icon={FiUser} label="Receiver Phone" value={booking.receiverPhone} />
            {booking.deliveryMenID && (
              <DetailRow icon={FiTruck} label="Delivery Partner" value={booking.deliveryMenID} />
            )}
          </div>
        </section>
      </div>

      {isDelivered && booking.proofOfDelivery && (
        <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-display text-lg font-bold text-emerald-700">Proof of Delivery</h3>
          <div className="mt-3 flex items-center gap-4">
            {booking.proofOfDelivery.photoUrl && (
              <img
                src={booking.proofOfDelivery.photoUrl}
                alt="Proof of delivery"
                className="h-24 w-24 rounded-2xl border border-emerald-200 object-cover"
              />
            )}
            <div>
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <FiCheckCircle aria-hidden="true" />
                Delivered on{" "}
                {booking.proofOfDelivery.deliveredAt
                  ? new Date(booking.proofOfDelivery.deliveredAt).toLocaleString()
                  : "—"}
              </p>
              {booking.proofOfDelivery.signature && (
                <p className="mt-1 text-sm text-emerald-600">
                  Signed by: {booking.proofOfDelivery.signature}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/dashboard/myParcels" className="btn btn-outline">
          Back to My Parcels
        </Link>
        {booking.status !== "delivered" && booking.status !== "cancelled" && (
          <Link to={`/dashboard/updateBooking/${id}`} className="btn btn-primary">
            Update Booking
          </Link>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 shrink-0 text-base-content/40" aria-hidden="true" />
    <div>
      <p className="text-xs text-base-content/50">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  </div>
);

export default BookingDetails;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiAlertCircle,
} from "react-icons/fi";
import useAxiosPublic from "../Hooks/useAxiosPublic";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import Avatar from "../Components/UI/Avatar";
import PropTypes from "prop-types";

const STATUS_CONFIG = {
  pending: { icon: FiClock, label: "Pending", tone: "amber" },
  assigned: { icon: FiTruck, label: "Assigned", tone: "sky" },
  "On The Way": { icon: FiTruck, label: "On The Way", tone: "brand" },
  delivered: { icon: FiCheckCircle, label: "Delivered", tone: "emerald" },
  cancelled: { icon: FiAlertCircle, label: "Cancelled", tone: "rose" },
  returned: { icon: FiAlertCircle, label: "Returned", tone: "orange" },
};

const STATUS_ORDER = ["pending", "assigned", "On The Way", "delivered", "cancelled", "returned"];

const Track = () => {
  const { identifier } = useParams();
  const axiosPublic = useAxiosPublic();
  const [parcel, setParcel] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParcel = async () => {
      setLoading(true);
      setError(null);
      try {
        const [parcelRes, eventsRes] = await Promise.all([
          axiosPublic.get(`/tracking/${identifier}`),
          axiosPublic.get(`/tracking/${identifier}/events`),
        ]);
        setParcel(parcelRes.data);
        setEvents(eventsRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Parcel not found");
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [axiosPublic, identifier]);

  const currentStatus = parcel?.status || "pending";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const completedStatuses = STATUS_ORDER.slice(0, currentIndex + 1);

  if (loading) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Tracking" />
        <PageHeader
          eyebrow="Track"
          title="Tracking parcel..."
          description="Loading parcel details"
        />
        <div className="flex justify-center py-20">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Not found" />
        <PageHeader
          eyebrow="Track"
          title="Parcel not found"
          description="The tracking ID or parcel ID you entered doesn't match any shipment."
        />
        <div className="text-center py-10">
          <FiAlertCircle className="mx-auto text-6xl text-base-content/30" />
          <p className="mt-4 text-base-content/60">{error || "No parcel matches that ID"}</p>
          <Link to="/" className="btn btn-primary mt-6">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[currentStatus] || {
    icon: FiPackage,
    label: currentStatus,
    tone: "brand",
  };

  return (
    <div>
      <DocumentTitle title={`RapidParcelHub | ${parcel.trackingId || identifier}`} />
      <PageHeader
        eyebrow="Tracking"
        title={parcel.trackingId || identifier}
        description={config.label}
        actions={
          <span className="badge badge-outline">
            {parcel.parcelType} · {parcel.weight}kg
          </span>
        }
      />

      {/* Status header */}
      <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl ${
                config.tone === "emerald"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : config.tone === "amber"
                    ? "bg-amber-500/10 text-amber-600"
                    : config.tone === "sky"
                      ? "bg-sky-500/10 text-sky-600"
                      : config.tone === "rose"
                        ? "bg-rose-500/10 text-rose-600"
                        : config.tone === "orange"
                          ? "bg-orange-500/10 text-orange-600"
                          : "bg-brand-500/10 text-brand-600"
              }`}
            >
              <config.icon className="text-2xl" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">{config.label}</h2>
              <p className="text-sm text-base-content/60">
                {parcel.trackingId
                  ? `Tracking ID: ${parcel.trackingId}`
                  : `Parcel ID: ${parcel._id}`}
              </p>
            </div>
          </div>
          {parcel.approximateDeliveryDate && (
            <div className="text-right">
              <p className="text-xs text-base-content/50">Estimated delivery</p>
              <p className="font-display font-bold">{parcel.approximateDeliveryDate}</p>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-5">
        <h3 className="font-display text-lg font-bold mb-4">Timeline</h3>
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-base-200" aria-hidden="true" />
          <div className="space-y-6">
            {completedStatuses.map((status, i) => {
              const event = events.find((e) => e.status?.toLowerCase() === status.toLowerCase());
              const isCurrent = i === currentIndex;
              const cfg = STATUS_CONFIG[status] || {
                icon: FiPackage,
                label: status,
                tone: "brand",
              };
              return (
                <div key={status} className="relative flex gap-4">
                  <div className="relative flex-shrink-0">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full border-2 ${
                        isCurrent
                          ? `bg-${
                              cfg.tone === "emerald"
                                ? "emerald"
                                : cfg.tone === "amber"
                                  ? "amber"
                                  : cfg.tone === "sky"
                                    ? "sky"
                                    : cfg.tone === "rose"
                                      ? "rose"
                                      : cfg.tone === "orange"
                                        ? "orange"
                                        : "brand"
                            }-500 border-${
                              cfg.tone === "emerald"
                                ? "emerald"
                                : cfg.tone === "amber"
                                  ? "amber"
                                  : cfg.tone === "sky"
                                    ? "sky"
                                    : cfg.tone === "rose"
                                      ? "rose"
                                      : cfg.tone === "orange"
                                        ? "orange"
                                        : "brand"
                            }-500`
                          : "bg-base-100 border-base-200"
                      }`}
                    >
                      <cfg.icon
                        className={`text-base ${isCurrent ? "text-white" : "text-base-content/40"}`}
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold">{cfg.label}</h4>
                      {event?.timestamp && (
                        <time className="text-xs text-base-content/50">
                          {new Date(event.timestamp).toLocaleString()}
                        </time>
                      )}
                    </div>
                    <p className="text-sm text-base-content/70">
                      {event?.description || `${cfg.label} ${isCurrent ? "(current)" : ""}`}
                    </p>
                    {event?.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-base-content/50">
                        <FiMapPin aria-hidden="true" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Parcel details */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard icon={FiPackage} label="Parcel type" value={parcel.parcelType} />
        <DetailCard icon={FiClock} label="Weight" value={`${parcel.weight} kg`} />
        <DetailCard icon={FiMapPin} label="Requested date" value={parcel.requestedDeliveryDate} />
        <DetailCard icon={FiTruck} label="Status" value={currentStatus} />
      </section>

      {/* Sender / Receiver */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <ContactCard
          title="Sender"
          name={parcel.senderName}
          phone={parcel.senderPhone}
          address={parcel.pickupAddress}
        />
        <ContactCard
          title="Receiver"
          name={parcel.receiverName}
          phone={parcel.receiverPhone}
          address={parcel.deliveryAddress}
        />
      </section>

      {/* Rider info if assigned */}
      {parcel.deliveryMenID && (
        <section className="mt-6">
          <h3 className="font-display text-lg font-bold mb-3">Assigned Rider</h3>
          <div className="flex items-center gap-3 rounded-3xl border border-base-200 bg-base-100 p-4">
            <Avatar
              src={null}
              name="Rider"
              email={parcel.deliveryMenID}
              className="h-12 w-12 text-base"
            />
            <div>
              <p className="font-semibold">Rider ID: {parcel.deliveryMenID}</p>
              <p className="text-sm text-base-content/60">Contact via app for real-time updates</p>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-3xl border border-base-200 bg-base-100 p-4 text-center">
    <Icon className="mx-auto text-base-content/40" aria-hidden="true" />
    <p className="mt-2 font-semibold">{value}</p>
    <p className="text-xs text-base-content/50">{label}</p>
  </div>
);

DetailCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const ContactCard = ({ title, name, phone, address }) => (
  <div className="rounded-3xl border border-base-200 bg-base-100 p-5">
    <h4 className="font-semibold uppercase tracking-wider text-xs text-base-content/50">{title}</h4>
    <p className="mt-2 font-bold">{name || "—"}</p>
    <p className="text-sm text-base-content/60">{phone || "—"}</p>
    {address && <p className="mt-2 text-sm text-base-content/50">{address}</p>}
  </div>
);

ContactCard.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string,
  phone: PropTypes.string,
  address: PropTypes.string,
};

export default Track;

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../Components/CheckoutForm/CheckoutForm";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../Components/SectionTitle/SectionTitle";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import Loading from "../Components/Shared/Loading";
import useAxiosSecure from "../Hooks/useAxiosSecure";

const publishableKey = import.meta.env.VITE_PAYMENT_GATEWAY_PK;

const Payments = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), []);

  const {
    data = {},
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["paymentBooking", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/booking/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  if (!publishableKey) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Payment" />
        <SectionTitle heading="payment" subHeading="Please pay to proceed" />
        <div className="mx-auto max-w-xl rounded-3xl border border-warning/30 bg-warning/10 p-6 text-center">
          <p className="font-semibold">Payments are not configured</p>
          <p className="mt-2 text-sm text-base-content/70">
            The Stripe publishable key is missing. Add{" "}
            <code className="font-mono">VITE_PAYMENT_GATEWAY_PK</code> to{" "}
            <code className="font-mono">apps/web/.env</code> (see{" "}
            <code className="font-mono">.env.example</code>) and restart Vite, then return to pay ৳
            {data?.price || "—"} for this parcel.
          </p>
          <Link to="/dashboard/myParcels" className="btn btn-ghost btn-sm mt-4">
            Back to my parcels
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading label="Loading payment…" />;
  if (isError) {
    return (
      <div>
        <DocumentTitle title="RapidParcelHub | Payment" />
        <SectionTitle heading="payment" subHeading="Please pay to proceed" />
        <p className="text-center text-sm text-base-content/70">
          This booking could not be loaded. It may have been deleted.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Payment" />
      <SectionTitle heading="payment" subHeading="Please pay to proceed" />
      <div>
        <Elements stripe={stripePromise}>
          <CheckoutForm data={data} />
        </Elements>
      </div>
    </div>
  );
};

export default Payments;

import { Link } from "react-router-dom";
import { FiCheck, FiPackage, FiTruck, FiZap } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const Pricing = () => {
  const plans = [
    {
      name: "Standard",
      icon: FiPackage,
      price: "৳50",
      unit: "per parcel",
      description: "For everyday deliveries within the city.",
      features: [
        "Up to 5 kg",
        "1-3 business days",
        "Real-time tracking",
        "Email notifications",
        "Basic insurance",
      ],
      cta: "Book Now",
      tone: "brand",
    },
    {
      name: "Express",
      icon: FiZap,
      price: "৳120",
      unit: "per parcel",
      description: "For urgent deliveries that can't wait.",
      features: [
        "Up to 10 kg",
        "Same-day delivery",
        "Real-time tracking",
        "SMS + email notifications",
        "Priority insurance",
        "Proof of delivery",
      ],
      cta: "Book Now",
      tone: "primary",
    },
    {
      name: "Business",
      icon: FiTruck,
      price: "Custom",
      unit: "volume pricing",
      description: "For businesses with regular shipping needs.",
      features: [
        "Unlimited weight",
        "Flexible scheduling",
        "Dedicated account manager",
        "Bulk booking (CSV)",
        "API access",
        "Custom insurance",
        "Priority support",
      ],
      cta: "Contact Sales",
      tone: "brand",
    },
  ];

  const addons = [
    { name: "Extra Insurance", price: "৳20", description: "Cover up to ৳50,000 in value" },
    { name: "Signature Required", price: "৳10", description: "Receiver must sign on delivery" },
    { name: "Fragile Handling", price: "৳15", description: "Special care for delicate items" },
    { name: "Weekend Delivery", price: "৳25", description: "Saturday and Sunday delivery" },
  ];

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Pricing" />
      <PageHeader
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        description="No hidden fees. Choose the plan that fits your shipping needs."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-6 shadow-sm ${
              plan.tone === "primary"
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500"
                : "border-base-200 bg-base-100"
            }`}
          >
            {plan.tone === "primary" && (
              <span className="badge badge-primary badge-sm">Most Popular</span>
            )}
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`grid h-12 w-12 place-items-center rounded-2xl ${
                  plan.tone === "primary"
                    ? "bg-brand-500 text-white"
                    : "bg-brand-500/10 text-brand-600"
                }`}
              >
                <plan.icon className="text-xl" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-base-content/50">{plan.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-display text-3xl font-bold">{plan.price}</span>
              <span className="text-sm text-base-content/50"> {plan.unit}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <FiCheck className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={plan.name === "Business" ? "/contact" : "/dashboard/bookAParcel"}
              className={`btn mt-6 w-full ${
                plan.tone === "primary" ? "btn-primary" : "btn-outline"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Add-ons</h2>
        <p className="mt-1 text-sm text-base-content/60">
          Enhance your delivery with optional add-ons.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {addons.map((addon) => (
            <div
              key={addon.name}
              className="rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
            >
              <h3 className="font-semibold">{addon.name}</h3>
              <p className="mt-1 text-xs text-base-content/60">{addon.description}</p>
              <p className="mt-2 font-display text-lg font-bold text-brand-600">
                +{addon.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-base-200 bg-base-100 p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-bold">Need a custom quote?</h2>
        <p className="mt-2 text-sm text-base-content/60">
          For high-volume shipping or enterprise needs, we offer tailored pricing.
        </p>
        <Link to="/contact" className="btn btn-primary mt-4">
          Get in Touch
        </Link>
      </section>
    </div>
  );
};

export default Pricing;

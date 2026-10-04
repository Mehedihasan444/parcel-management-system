import { FiCalendar, FiMapPin, FiShield, FiUsers, FiCreditCard, FiBarChart2 } from "react-icons/fi";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";
import Reveal from "../../Components/UI/Reveal";

const CARDS = [
  {
    icon: FiCalendar,
    title: "Effortless booking",
    description:
      "Price, pickup and delivery in under a minute — with instant confirmation, receipt and live cost estimate as you type.",
    span: "md:col-span-2",
    visual: (
      <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
        {["1 kg · ৳50", "2 kg · ৳100", "2 kg+ · ৳150"].map((t) => (
          <span
            key={t}
            className="rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: FiMapPin,
    title: "Live tracking",
    description: "Follow every parcel hub-to-door with rider assignment and a status timeline.",
    span: "",
    visual: (
      <div className="mt-5 space-y-2" aria-hidden="true">
        {["Picked up", "Hub scan", "Out for delivery"].map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-2.5 text-xs font-medium text-base-content/70"
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ${
                i < 2 ? "bg-brand-500" : "bg-base-300 text-base-content/60"
              }`}
            >
              {i < 2 ? "✓" : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FiShield,
    title: "Secure payments",
    description: "Stripe-powered checkout with full payment history for customers and admins.",
    span: "",
    visual: null,
  },
  {
    icon: FiUsers,
    title: "Three workspaces",
    description:
      "Customers book, riders run a focused delivery queue, admins see the whole network — one login, the right view.",
    span: "",
    visual: null,
  },
  {
    icon: FiCreditCard,
    title: "Receipts & history",
    description: "Every charge recorded with transaction IDs you can reconcile in seconds.",
    span: "",
    visual: null,
  },
  {
    icon: FiBarChart2,
    title: "Network overview",
    description: "Bookings per day and running totals keep dispatch decisions data-driven.",
    span: "md:col-span-2",
    visual: (
      <div className="mt-5 flex h-16 items-end gap-1.5" aria-hidden="true">
        {[35, 55, 40, 70, 52, 88, 64, 95, 74, 100, 82, 92].map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={`flex-1 rounded-t-md ${i === 9 ? "bg-brand-500" : "bg-brand-500/25"}`}
          />
        ))}
      </div>
    ),
  },
];

const OurFeatures = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <SectionTitle heading="Everything delivery needs, in one place" subHeading="Our features" />
      <div className="grid gap-5 md:grid-cols-3">
        {CARDS.map(({ icon: Icon, title, description, span, visual }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.08} className={span}>
            <article className="group h-full rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 sm:p-7">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white dark:text-brand-300">
                <Icon className="text-xl" aria-hidden="true" />
              </div>
              <h3 className="font-display mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-base-content/70">{description}</p>
              {visual}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default OurFeatures;

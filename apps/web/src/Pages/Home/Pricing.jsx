import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PRICE_TIERS } from "../../lib/pricing";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";
import Reveal from "../../Components/UI/Reveal";

const BLURBS = [
  "Live cost estimate while booking",
  "Insured handling included",
  "No hidden fees, ever",
];

const Pricing = () => {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
      <SectionTitle heading="Simple pricing, no surprises" subHeading="What it costs" />
      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {PRICE_TIERS.map((tier, i) => {
          const featured = i === 1;
          return (
            <Reveal key={tier.label} delay={i * 0.1} className="h-full">
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                  featured
                    ? "hero-mesh border-transparent text-white shadow-2xl"
                    : "border-base-200 bg-base-100 shadow-sm hover:shadow-xl"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-base font-bold">{tier.label}</h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-extrabold">৳{tier.price}</span>
                  <span
                    className={`text-sm ${featured ? "text-white/70" : "text-base-content/60"}`}
                  >
                    flat
                  </span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {BLURBS.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <FiCheck
                        className={`mt-0.5 shrink-0 ${featured ? "text-brand-300" : "text-brand-600"}`}
                        aria-hidden="true"
                      />
                      <span className={featured ? "text-white/80" : "text-base-content/75"}>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard/bookAParcel"
                  className={`btn mt-7 w-full border-0 font-semibold ${
                    featured
                      ? "bg-white text-ink-900 hover:bg-white/90"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  }`}
                >
                  Book now <FiArrowRight aria-hidden="true" />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default Pricing;

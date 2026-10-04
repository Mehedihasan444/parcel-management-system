import { FiPackage, FiNavigation, FiCheckCircle } from "react-icons/fi";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";
import Reveal from "../../Components/UI/Reveal";

const STEPS = [
  {
    icon: FiPackage,
    step: "01",
    title: "Book in a minute",
    body: "Enter pickup, destination and weight — the price is estimated instantly and transparently.",
  },
  {
    icon: FiNavigation,
    step: "02",
    title: "Track it live",
    body: "Watch your parcel move hub-to-door with rider assignment and status updates.",
  },
  {
    icon: FiCheckCircle,
    step: "03",
    title: "Delivered & rated",
    body: "Confirm delivery, pay securely and rate your rider to keep quality high.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-base-200 bg-base-200/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionTitle heading="From doorstep to doorstep" subHeading="How it works" />
        <div className="relative grid gap-5 md:grid-cols-3">
          <div
            className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent md:block"
            aria-hidden="true"
          />
          {STEPS.map(({ icon: Icon, step, title, body }, i) => (
            <Reveal key={step} delay={i * 0.12}>
              <article className="relative rounded-3xl border border-base-200 bg-base-100 p-6 text-center shadow-sm sm:p-8">
                <span className="font-display mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink-900 text-white shadow-lg dark:bg-white dark:text-ink-900">
                  <Icon className="text-2xl" aria-hidden="true" />
                </span>
                <p className="font-accent mt-4 text-lg italic text-brand-600">{step}</p>
                <h3 className="font-display mt-1 text-lg font-bold">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-base-content/70">
                  {body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

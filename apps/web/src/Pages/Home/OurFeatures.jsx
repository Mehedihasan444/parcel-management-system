import { useEffect, useState } from "react";
import { FiCalendar, FiMapPin, FiShield } from "react-icons/fi";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";

const FALLBACK = [
  {
    id: "booking",
    icon: FiCalendar,
    title: "Effortless booking",
    description:
      "Price, pickup and delivery in under a minute — with instant confirmation and receipt.",
  },
  {
    id: "tracking",
    icon: FiMapPin,
    title: "Live tracking",
    description: "Follow every parcel hub-to-door with rider assignment and status timeline.",
  },
  {
    id: "secure",
    icon: FiShield,
    title: "Secure payments",
    description: "Stripe-powered checkout with full payment history for customers and admins.",
  },
];

const OurFeatures = () => {
  const [cards, setCards] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch("featuresData.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("no features"))))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setCards(data);
      })
      .catch(() => {
        /* keep curated fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle heading="Everything delivery needs, in one place" subHeading="Our features" />
      <div className="grid gap-5 md:grid-cols-3">
        {cards?.map((card) => {
          const Icon = card.icon || FALLBACK.find((f) => f.id === card.id)?.icon || FiShield;
          return (
            <article
              key={card?.id || card?.title}
              className="group rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                {card?.img ? (
                  <img src={card.img} alt="" className="h-7 w-7 object-contain" loading="lazy" />
                ) : (
                  <Icon className="text-xl" aria-hidden="true" />
                )}
              </div>
              <h3 className="font-display mt-5 text-lg font-bold">{card?.title}</h3>
              <div className="mt-3 h-1 w-12 rounded-full bg-brand-500/70" aria-hidden="true" />
              <p className="mt-3 text-sm leading-relaxed text-base-content/70">
                {card?.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default OurFeatures;

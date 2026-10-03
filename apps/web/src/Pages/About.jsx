import { Link } from "react-router-dom";
import {
  FiAward,
  FiBox,
  FiClock,
  FiGlobe,
  FiHeart,
  FiPackage,
  FiShield,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";
import Stat from "../Components/UI/Stat";

const About = () => {
  const values = [
    {
      icon: FiShield,
      title: "Reliability",
      body: "Every parcel is tracked end-to-end with real-time updates, so you always know where your shipment is.",
    },
    {
      icon: FiClock,
      title: "Speed",
      body: "Optimized routing and a network of delivery partners ensure your parcels arrive on time, every time.",
    },
    {
      icon: FiHeart,
      title: "Care",
      body: "From fragile items to urgent documents, we handle every delivery with the utmost care and professionalism.",
    },
    {
      icon: FiGlobe,
      title: "Reach",
      body: "Serving customers across the country with a growing network of delivery partners and pickup points.",
    },
  ];

  const stats = [
    { icon: FiPackage, value: "50K+", label: "Parcels Delivered" },
    { icon: FiUsers, value: "10K+", label: "Happy Customers" },
    { icon: FiTruck, value: "500+", label: "Delivery Partners" },
    { icon: FiAward, value: "99.5%", label: "On-Time Rate" },
  ];

  const team = [
    { name: "Ahmed Rahman", role: "Founder & CEO", bio: "Logistics expert with 15+ years in supply chain management." },
    { name: "Sarah Khan", role: "Head of Operations", bio: "Ensures every delivery runs smoothly from pickup to drop-off." },
    { name: "Mizanur Islam", role: "Lead Engineer", bio: "Builds the technology that powers real-time tracking." },
    { name: "Fatima Akter", role: "Customer Success", bio: "Dedicated to making every customer experience exceptional." },
  ];

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | About Us" />
      <PageHeader
        eyebrow="About Us"
        title="Delivering trust, one parcel at a time"
        description="RapidParcelHub is a modern parcel management system built to make shipping simple, fast, and reliable."
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} tone="brand" />
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Our Story</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold">The Problem</h3>
            <p className="mt-2 text-sm leading-relaxed text-base-content/70">
              Sending parcels used to be a hassle — long queues, uncertain delivery times,
              and no way to track your shipment in real time. Businesses and individuals
              deserved better. We built RapidParcelHub to solve that.
            </p>
          </div>
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold">Our Solution</h3>
            <p className="mt-2 text-sm leading-relaxed text-base-content/70">
              A complete parcel management platform that connects senders, receivers, and
              delivery partners. Book a parcel online, track it in real time, and get
              proof of delivery — all in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Our Values</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                  <v.icon className="text-lg" aria-hidden="true" />
                </span>
                <h3 className="font-display font-bold">{v.title}</h3>
              </div>
              <p className="mt-3 text-sm text-base-content/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">Meet the Team</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-3xl border border-base-200 bg-base-100 p-5 text-center shadow-sm"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-500/10 text-2xl font-bold text-brand-600">
                {member.name.charAt(0)}
              </div>
              <h3 className="mt-3 font-display font-bold">{member.name}</h3>
              <p className="text-xs font-medium text-brand-600">{member.role}</p>
              <p className="mt-2 text-xs text-base-content/60">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to ship with us?</h2>
        <p className="mt-2 text-sm text-base-content/60">
          Join thousands of customers who trust RapidParcelHub for their deliveries.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/contact" className="btn btn-outline">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;

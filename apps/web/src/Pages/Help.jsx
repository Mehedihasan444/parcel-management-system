import { Link } from "react-router-dom";
import {
  FiBook,
  FiClock,
  FiMail,
  FiMessageCircle,
  FiPackage,
  FiPhone,
  FiTruck,
} from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const Help = () => {
  const topics = [
    {
      icon: FiPackage,
      title: "Booking a Parcel",
      description: "Learn how to book a new parcel delivery, choose parcel types, and schedule pickups.",
      link: "/dashboard/bookAParcel",
      linkText: "Book a Parcel",
    },
    {
      icon: FiTruck,
      title: "Tracking Your Shipment",
      description: "Understand tracking statuses and how to follow your parcel in real time.",
      link: "/track",
      linkText: "Track a Parcel",
    },
    {
      icon: FiClock,
      title: "Delivery Times & Scheduling",
      description: "Find out about delivery timeframes, express options, and weekend deliveries.",
      link: "/pricing",
      linkText: "View Pricing",
    },
    {
      icon: FiBook,
      title: "Becoming a Delivery Partner",
      description: "Join our fleet of delivery partners and earn money on your schedule.",
      link: "/register",
      linkText: "Sign Up",
    },
  ];

  const contactMethods = [
    {
      icon: FiMail,
      title: "Email Support",
      description: "Get help via email within 24 hours.",
      value: "support@rapidparcelhub.com",
    },
    {
      icon: FiPhone,
      title: "Phone Support",
      description: "Call us Mon-Fri, 9am-6pm.",
      value: "+880 1XXX-XXXXXX",
    },
    {
      icon: FiMessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real time.",
      value: "Available in dashboard",
    },
  ];

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | Help & Support" />
      <PageHeader
        eyebrow="Help & Support"
        title="How can we help you?"
        description="Find answers to common questions or get in touch with our support team."
      />

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Popular Topics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                  <topic.icon className="text-lg" aria-hidden="true" />
                </span>
                <h3 className="font-display font-bold">{topic.title}</h3>
              </div>
              <p className="mt-3 text-sm text-base-content/70">{topic.description}</p>
              <Link
                to={topic.link}
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                {topic.linkText} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Contact Us</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {contactMethods.map((method) => (
            <div
              key={method.title}
              className="rounded-3xl border border-base-200 bg-base-100 p-5 text-center shadow-sm"
            >
              <method.icon className="mx-auto text-3xl text-brand-500" aria-hidden="true" />
              <h3 className="mt-3 font-display font-bold">{method.title}</h3>
              <p className="mt-1 text-xs text-base-content/60">{method.description}</p>
              <p className="mt-2 text-sm font-semibold text-brand-600">{method.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Still need help?</h2>
        <p className="mt-2 text-sm text-base-content/60">
          Can't find what you're looking for? Send us a message and we'll get back to you.
        </p>
        <Link to="/contact" className="btn btn-primary mt-4">
          Send a Message
        </Link>
      </section>
    </div>
  );
};

export default Help;

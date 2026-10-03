import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Booking",
      questions: [
        {
          q: "How do I book a parcel?",
          a: "Sign in to your account, go to 'Book a Parcel', fill in the sender and receiver details, choose a parcel type, and submit. You'll receive a tracking ID immediately.",
        },
        {
          q: "What parcel types do you accept?",
          a: "We accept documents, small packages, medium parcels, and large shipments. Each type has different weight limits and pricing. Check the Pricing page for details.",
        },
        {
          q: "Can I schedule a pickup?",
          a: "Yes! When booking, you can choose a preferred pickup date and time. Our delivery partners will arrive at your specified location.",
        },
        {
          q: "How do I cancel a booking?",
          a: "Go to 'My Parcels', find the booking, and click Cancel. Bookings can only be cancelled before they are picked up by a delivery partner.",
        },
      ],
    },
    {
      category: "Tracking",
      questions: [
        {
          q: "How do I track my parcel?",
          a: "Use the tracking ID provided at booking. Enter it on the Track page or go to 'My Parcels' in your dashboard to see real-time status updates.",
        },
        {
          q: "What do the tracking statuses mean?",
          a: "Pending: booking received. Assigned: a delivery partner is assigned. On The Way: your parcel is in transit. Delivered: successfully delivered to the receiver.",
        },
        {
          q: "Can I track without an account?",
          a: "Yes! Use the public Track page. Just enter your tracking ID and you'll see the current status and timeline.",
        },
      ],
    },
    {
      category: "Delivery",
      questions: [
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 1-3 business days depending on distance. Express delivery options are available at checkout for faster delivery.",
        },
        {
          q: "What is Proof of Delivery?",
          a: "For secure deliveries, the receiver provides an OTP and signature. The delivery partner captures a photo as proof. You can view the proof in your booking details.",
        },
        {
          q: "What if the receiver is not available?",
          a: "The delivery partner will attempt delivery twice. If unsuccessful, the parcel will be returned to the sender. You'll be notified at each step.",
        },
      ],
    },
    {
      category: "Account & Payments",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Register' on the homepage. You can sign up with email/password or use Google OAuth. Registration takes less than a minute.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept credit/debit cards through Stripe. Payment is processed securely at the time of booking.",
        },
        {
          q: "How do I get a refund?",
          a: "If a booking is cancelled before pickup, a full refund is processed automatically. Refunds take 5-7 business days to appear on your statement.",
        },
        {
          q: "How do I become a delivery partner?",
          a: "Register as a user, then apply for the delivery partner role from your profile. Our team will review your application and get back to you within 48 hours.",
        },
      ],
    },
  ];

  let globalIndex = 0;

  return (
    <div>
      <DocumentTitle title="RapidParcelHub | FAQ" />
      <PageHeader
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Find answers to common questions about booking, tracking, delivery, and payments."
      />

      <div className="mt-6 space-y-8">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="font-display text-xl font-bold">{section.category}</h2>
            <div className="mt-3 space-y-2">
              {section.questions.map((item) => {
                const idx = globalIndex++;
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-base-200 bg-base-100 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-medium">{item.q}</span>
                      <FiChevronDown
                        className={`shrink-0 text-base-content/40 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-base-200 px-5 py-4 text-sm text-base-content/70">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
        <FiHelpCircle className="mx-auto text-4xl text-brand-500" />
        <h2 className="mt-3 font-display text-xl font-bold">Still have questions?</h2>
        <p className="mt-1 text-sm text-base-content/60">
          Can't find the answer you're looking for? We're here to help.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/contact" className="btn btn-primary">
            Contact Support
          </Link>
          <Link to="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

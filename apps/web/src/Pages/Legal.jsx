import { FiFileText, FiLock, FiSettings } from "react-icons/fi";
import PageHeader from "../Components/UI/PageHeader";
import DocumentTitle from "../Components/Seo/DocumentTitle";

const SECTIONS = [
  {
    id: "terms",
    icon: FiFileText,
    title: "Terms of use",
    body: [
      "RapidParcelHub moves parcels you own or are authorized to ship. Prohibited items (hazardous goods, contraband, cash over ৳10,000) are refused at the hub and reported.",
      "Prices are flat by weight — ৳50 up to 1 kg, ৳100 up to 2 kg, ৳150 above — with no hidden fees. You pay after booking from My Parcels via Stripe.",
      "Delivery dates are estimates. If we miss an approximate date by more than 48 hours, contact support with your tracking ID for a re-dispatch or refund.",
    ],
  },
  {
    id: "privacy",
    icon: FiLock,
    title: "Privacy policy",
    body: [
      "We store your name, email, phone, booking addresses and payment references to run deliveries. Rider locations are kept only for active shipments.",
      "We never sell your data. Payment cards are processed by Stripe — card numbers never touch our servers.",
      "Ask for export or deletion anytime at support@rapidparcelhub.com. Admin role checks run server-side on every request.",
    ],
  },
  {
    id: "cookies",
    icon: FiSettings,
    title: "Cookie policy",
    body: [
      "We use a session cookie for Better Auth (keeps you signed in) and a theme preference (light/dark). No advertising trackers.",
      "Blocking the session cookie signs you out — the app cannot keep your dashboard session without it.",
    ],
  },
];

function Legal() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <DocumentTitle title="RapidParcelHub | Terms & privacy" />
      <PageHeader
        eyebrow="Legal"
        title="Terms, privacy & cookies"
        description="Plain-language rules for shipping with RapidParcelHub. Last updated October 2026."
      />
      <div className="grid gap-4">
        {SECTIONS.map(({ id, icon: Icon, title, body }) => (
          <section
            key={id}
            id={id}
            className="scroll-mt-24 rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm sm:p-8"
          >
            <h2 className="flex items-center gap-2.5 text-xl font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Icon aria-hidden="true" />
              </span>
              {title}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-base-content/75">
              {body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Legal;

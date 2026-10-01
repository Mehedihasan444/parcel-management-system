import { FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Product",
    links: [
      ["Book a parcel", "/dashboard/bookAParcel"],
      ["Track parcel", "/dashboard/myParcels"],
      ["Pricing", "/#features"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/"],
      ["Contact", "/dashboard/contact"],
      ["Careers", "/"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms of use", "/"],
      ["Privacy policy", "/"],
      ["Cookie policy", "/"],
    ],
  },
];

const Footer = () => {
  return (
    <div className="border-t border-base-200">
      <footer className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_repeat(3,0.6fr)]">
        <aside>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <FiPackage className="text-lg" />
            </span>
            <span className="font-display text-lg font-bold">
              RapidParcel<span className="text-brand-500">Hub</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-base-content/70">
            Reliable logistics since 2000 — booking, live tracking and secure payments for
            customers, riders and admins.
          </p>
          <div className="mt-5 flex gap-2">
            {["98.2% on-time", "4.9★ rated", "24/7 support"].map((b) => (
              <span key={b} className="badge badge-outline text-xs">
                {b}
              </span>
            ))}
          </div>
        </aside>
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="link link-hover text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </footer>
      <footer className="border-t border-base-200 bg-base-200/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-base-content/60 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} RapidParcelHub. All rights reserved.</p>
          <p>Book · Track · Deliver — with care.</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

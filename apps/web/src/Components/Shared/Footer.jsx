import { FiPackage } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionButton({ to, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for home to mount, then scroll.
      setTimeout(() => scrollToId(to), 150);
    } else {
      scrollToId(to);
    }
  };

  return (
    <a href={`/#${to}`} onClick={go} className="link link-hover text-sm">
      {children}
    </a>
  );
}

SectionButton.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

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
        <nav aria-label="Product">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            Product
          </h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/dashboard/bookAParcel" className="link link-hover text-sm">
                Book a parcel
              </Link>
            </li>
            <li>
              <Link to="/dashboard/myParcels" className="link link-hover text-sm">
                Track parcel
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="link link-hover text-sm">
                Pricing
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/about" className="link link-hover text-sm">
                About
              </Link>
            </li>
            <li>
              <Link to="/faq" className="link link-hover text-sm">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/help" className="link link-hover text-sm">
                Help & Support
              </Link>
            </li>
            <li>
              <Link to="/contact" className="link link-hover text-sm">
                Contact
              </Link>
            </li>
            <li>
              <SectionButton to="how-it-works">How it works</SectionButton>
            </li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
            Legal
          </h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/legal" className="link link-hover text-sm">
                Terms of use
              </Link>
            </li>
            <li>
              <Link to="/legal" className="link link-hover text-sm">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/legal" className="link link-hover text-sm">
                Cookie policy
              </Link>
            </li>
          </ul>
        </nav>
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

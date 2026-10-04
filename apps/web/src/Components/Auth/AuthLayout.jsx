import PropTypes from "prop-types";
import { FiCheck, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";
import DocumentTitle from "../Seo/DocumentTitle";

const POINTS = ["Live parcel tracking", "Secure Stripe payments", "Rider + admin workspaces"];

/**
 * Split-screen auth shell: brand panel on the left, form card on the right.
 */
export default function AuthLayout({ title, subtitle, docTitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <DocumentTitle title={docTitle} />
      <aside className="hero-mesh relative hidden overflow-hidden text-white lg:block">
        <div className="hero-grid absolute inset-0" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Back to home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600">
              <FiPackage className="text-xl" />
            </span>
            <span className="font-display text-xl font-bold">
              RapidParcel<span className="text-brand-300">Hub</span>
            </span>
          </Link>
          <div>
            <h2 className="font-display max-w-md text-balance text-4xl font-extrabold leading-tight">
              Delivery you can{" "}
              <span className="font-accent font-normal italic text-brand-300">watch</span> happen.
            </h2>
            <ul className="mt-8 space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-white/80">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/30">
                    <FiCheck className="text-sm text-brand-200" aria-hidden="true" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/50">98.2% on-time · 4.9★ from 2,400+ daily shippers</p>
        </div>
      </aside>

      <main className="grid place-items-center bg-base-200/40 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 flex items-center gap-2.5 lg:hidden"
            aria-label="Back to home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <FiPackage className="text-lg" />
            </span>
            <span className="font-display text-lg font-bold">
              RapidParcel<span className="text-brand-500">Hub</span>
            </span>
          </Link>
          <div className="rounded-3xl border border-base-200 bg-base-100 p-7 shadow-xl shadow-ink-900/5 sm:p-9">
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-base-content/65">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  docTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

import { useState } from "react";
import PropTypes from "prop-types";
import { FiSearch, FiShield, FiTruck, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";

const TRUST = [
  { icon: FiZap, label: "Same-day dispatch" },
  { icon: FiShield, label: "Insured handling" },
  { icon: FiTruck, label: "Live rider tracking" },
];

const Banner = ({ setSearch }) => {
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch?.(value.trim());
    if (value.trim()) {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            Book · Assign · Deliver with ease
          </p>
          <h1 className="font-display mt-5 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Parcel delivery,
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-sky-300 bg-clip-text text-transparent">
              minus the chaos.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            RapidParcelHub gives customers instant booking and live tracking, riders a focused
            delivery queue, and admins the controls to keep every parcel moving.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            role="search"
          >
            <label className="relative flex-1">
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                aria-hidden="true"
              />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                name="tracking"
                type="text"
                placeholder="Enter tracking ID or destination…"
                className="input input-lg w-full border-white/15 bg-white/10 pl-11 text-white placeholder:text-white/50 focus:border-brand-400 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="btn btn-lg border-0 bg-brand-500 px-7 font-semibold text-white hover:bg-brand-400"
            >
              Track parcel
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="text-brand-300" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard/bookAParcel"
              className="btn border-0 bg-white px-6 font-semibold text-ink-900 hover:bg-white/90"
            >
              Book a parcel
            </Link>
            <Link
              to="/register"
              className="btn btn-outline border-white/25 px-6 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="glass rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Live shipment</p>
              <span className="badge border-0 bg-brand-500/20 text-brand-200">In transit</span>
            </div>
            <p className="font-display mt-3 text-2xl font-bold">RPH-8421-DHK</p>
            <p className="text-sm text-white/60">Dhaka → Chattogram · Express</p>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/60">
                <span>Picked up</span>
                <span>Hub scan</span>
                <span>Out for delivery</span>
              </div>
              <progress className="progress progress-success mt-2 w-full" value="66" max="100" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                ["2.4k+", "Parcels/day"],
                ["98.2%", "On-time"],
                ["4.9★", "Rating"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 px-2 py-3">
                  <p className="font-display text-lg font-bold">{n}</p>
                  <p className="text-xs text-white/60">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass absolute -bottom-6 -left-6 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl">
            <p className="text-xs text-white/60">Rider nearby</p>
            <p className="text-sm font-semibold">Karim · 4 min away</p>
          </div>
        </div>
      </div>
    </section>
  );
};

Banner.propTypes = {
  setSearch: PropTypes.func,
};

export default Banner;

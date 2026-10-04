import { useState } from "react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import { FiSearch, FiShield, FiTruck, FiZap, FiMapPin, FiCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const TRUST = [
  { icon: FiZap, label: "Same-day dispatch" },
  { icon: FiShield, label: "Insured handling" },
  { icon: FiTruck, label: "Live rider tracking" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Banner = ({ setSearch }) => {
  const [value, setValue] = useState("");
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = value.trim();
    // Keep the optional controlled hook for embeds/tests, but the search is
    // now real: jump to the dashboard list filtered by tracking ID, parcel
    // type, receiver or status. PrivateRoute bounces anonymous users to login.
    setSearch?.(q);
    if (q) {
      navigate(`/dashboard/myParcels?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="hero-mesh relative overflow-hidden text-white">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24">
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200"
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute h-full w-full rounded-full bg-brand-400 animate-pulse-ring" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            </span>
            Book · Assign · Deliver with ease
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display mt-5 text-balance text-4xl font-extrabold leading-[1.04] sm:text-6xl"
          >
            Parcel delivery,
            <br />
            <span className="font-accent font-normal italic bg-gradient-to-r from-brand-200 via-brand-300 to-sky-200 bg-clip-text text-transparent">
              minus the chaos.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            RapidParcelHub gives customers instant booking and live tracking, riders a focused
            delivery queue, and admins the controls to keep every parcel moving.
          </motion.p>

          <motion.form
            variants={fadeUp}
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
                type="search"
                aria-label="Track parcel by ID, type, receiver or status"
                placeholder="Enter tracking ID or destination…"
                className="input input-lg w-full border-white/15 bg-white/10 pl-11 text-white placeholder:text-white/50 focus:border-brand-400 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="btn btn-lg border-0 bg-brand-500 px-7 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:-translate-y-0.5 hover:bg-brand-400"
            >
              Track parcel
            </button>
          </motion.form>

          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="text-brand-300" aria-hidden="true" />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard/bookAParcel"
              className="btn border-0 bg-white px-6 font-semibold text-ink-900 shadow-xl hover:bg-white/90"
            >
              Book a parcel
            </Link>
            <Link
              to="/register"
              className="btn btn-outline border-white/25 px-6 text-white hover:border-white hover:bg-white/10 hover:text-white"
            >
              Create account
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
          aria-hidden="true"
        >
          <div className="glass rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Live shipment</p>
              <span className="badge border-0 bg-brand-500/20 text-brand-200">In transit</span>
            </div>
            <p className="font-display mt-3 text-2xl font-bold">RPH-8421-DHK</p>
            <p className="flex items-center gap-1.5 text-sm text-white/60">
              <FiMapPin /> Dhaka → Chattogram · Express
            </p>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/60">
                <span className="inline-flex items-center gap-1">
                  <FiCheck className="text-brand-300" /> Picked up
                </span>
                <span className="inline-flex items-center gap-1">
                  <FiCheck className="text-brand-300" /> Hub scan
                </span>
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
          <div className="glass animate-floaty absolute -bottom-6 -left-6 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl">
            <p className="text-xs text-white/60">Rider nearby</p>
            <p className="text-sm font-semibold text-white">Karim · 4 min away</p>
          </div>
          <div className="glass animate-floaty absolute -right-4 -top-6 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-xl [animation-delay:1.2s]">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              <FiCheck className="text-brand-300" /> Delivered · 12:04
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative border-t border-white/10 bg-black/20">
        <div className="marquee-mask mx-auto max-w-7xl overflow-hidden px-4 py-4 sm:px-6">
          <div className="animate-marquee flex w-max items-center gap-12 text-sm font-medium text-white/45">
            {Array.from({ length: 2 }).flatMap((_, copy) =>
              [
                "Dhaka Mart",
                "Chattogram Foods",
                "Sylhet Crafts",
                "Khulna Books",
                "Rajshahi Silk",
                "Barishal Fresh",
                "Rangpur Dairy",
                "Mymensingh Toys",
              ].map((brand) => (
                <span key={`${copy}-${brand}`} className="flex items-center gap-12">
                  <span className="font-display tracking-wide">{brand}</span>
                  <span className="text-brand-400/60" aria-hidden="true">
                    ✦
                  </span>
                </span>
              ))
            )}
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

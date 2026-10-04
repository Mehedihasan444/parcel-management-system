import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import Reveal from "../../Components/UI/Reveal";

/**
 * Closing call-to-action band above the footer.
 */
export default function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <Reveal>
        <div className="hero-mesh relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-20">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              Get started in minutes
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-2xl text-balance text-3xl font-extrabold sm:text-5xl">
              Ready to ship{" "}
              <span className="font-accent font-normal italic text-brand-200">smarter?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Create a free account, book your first parcel in under a minute, and track it all the
              way to the doorstep.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="btn border-0 bg-white px-7 font-semibold text-ink-900 hover:bg-white/90"
              >
                Create free account <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard/bookAParcel"
                className="btn btn-outline border-white/25 px-7 text-white hover:border-white hover:bg-white/10 hover:text-white"
              >
                Book a parcel
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

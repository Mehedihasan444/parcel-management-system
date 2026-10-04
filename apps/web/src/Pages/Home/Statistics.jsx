import { useEffect, useState } from "react";
import CountUpPkg from "react-countup";
// Rolldown/Vite-8 CJS interop: the default export may sit under `.default`.
const CountUp = CountUpPkg.default ?? CountUpPkg;
import { FiBox, FiCheckCircle, FiUsers } from "react-icons/fi";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";
import Reveal from "../../Components/UI/Reveal";

const FALLBACK = [
  { icon: FiBox, value: 2400, suffix: "+", label: "Parcels booked" },
  { icon: FiCheckCircle, value: 2350, suffix: "+", label: "Parcels delivered" },
  { icon: FiUsers, value: 1200, suffix: "+", label: "Registered users" },
];

const ACCENTS = [
  "from-brand-500 to-emerald-600",
  "from-sky-500 to-cyan-500",
  "from-violet-500 to-purple-600",
];

const Statistics = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Live counts are admin-only endpoints; don't probe them anonymously —
    // that would 401 and flash 0/0/0. Fallback marketing numbers show instead.
    if (!user?.email || !localStorage.getItem("access-token")) return;
    let cancelled = false;
    Promise.all([
      axiosSecure.get("/users/admin/bookings").then((res) => res.data),
      axiosSecure.get("/users/admin").then((res) => res.data),
    ])
      .then(([bookings, adminUsers]) => {
        if (cancelled) return;
        setParcels(Array.isArray(bookings) ? bookings : []);
        setUsers(Array.isArray(adminUsers) ? adminUsers : []);
        setLive(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [axiosSecure, user?.email]);

  const delivered = parcels.filter((item) => item.status === "delivered");

  const stats = live
    ? [
        { icon: FiBox, value: parcels.length, suffix: "", label: "Parcels booked" },
        { icon: FiCheckCircle, value: delivered.length, suffix: "", label: "Parcels delivered" },
        { icon: FiUsers, value: users.length, suffix: "", label: "Registered users" },
      ]
    : FALLBACK;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle heading="Numbers that keep us moving" subHeading="Live network stats" />
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map(({ icon: Icon, value, suffix, label }, i) => (
          <Reveal key={label} delay={i * 0.1}>
            <div className="group overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div
                className={`bg-gradient-to-br ${ACCENTS[i % ACCENTS.length]} relative overflow-hidden px-6 pb-8 pt-6 text-white`}
              >
                <div
                  className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125"
                  aria-hidden="true"
                />
                <Icon className="relative text-2xl opacity-90" aria-hidden="true" />
                <p className="font-display relative mt-3 text-5xl font-extrabold tabular-nums">
                  <CountUp start={0} end={value} duration={2.5} />
                  {suffix}
                </p>
              </div>
              <p className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-base-content/60">
                {label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      {!live && (
        <p className="mt-4 text-center text-xs text-base-content/50">
          Representative network volume — sign in as an admin for live counts.
        </p>
      )}
    </section>
  );
};

export default Statistics;

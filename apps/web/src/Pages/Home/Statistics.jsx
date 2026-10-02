import { useEffect, useState } from "react";
import CountUpPkg from "react-countup";
// Rolldown/Vite-8 CJS interop: the default export may sit under `.default`.
const CountUp = CountUpPkg.default ?? CountUpPkg;
import { FiBox, FiCheckCircle, FiUsers } from "react-icons/fi";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import SectionTitle from "../../Components/SectionTitle/SectionTitle";
import Reveal from "../../Components/UI/Reveal";

const Statistics = () => {
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axiosSecure
      .get("/users/admin/bookings")
      .then((res) => {
        if (!cancelled) setParcels(res.data);
      })
      .catch(() => {});
    axiosSecure
      .get("/users/admin")
      .then((res) => {
        if (!cancelled) setUsers(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [axiosSecure]);

  const delivered = parcels.filter((item) => item.status === "delivered");

  const stats = [
    { icon: FiBox, value: parcels.length, label: "Parcels booked", accent: "from-brand-500 to-emerald-600" },
    { icon: FiCheckCircle, value: delivered.length, label: "Parcels delivered", accent: "from-sky-500 to-cyan-500" },
    { icon: FiUsers, value: users.length, label: "Registered users", accent: "from-violet-500 to-purple-600" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <SectionTitle heading="Numbers that keep us moving" subHeading="Live network stats" />
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map(({ icon: Icon, value, label, accent }, i) => (
          <Reveal key={label} delay={i * 0.1}>
            <div className="group overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className={`bg-gradient-to-br ${accent} relative overflow-hidden px-6 pb-8 pt-6 text-white`}>
                <div
                  className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125"
                  aria-hidden="true"
                />
                <Icon className="relative text-2xl opacity-90" aria-hidden="true" />
                <p className="font-display relative mt-3 text-5xl font-extrabold tabular-nums">
                  <CountUp start={0} end={value} duration={2.5} />
                </p>
              </div>
              <p className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-base-content/60">
                {label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Statistics;

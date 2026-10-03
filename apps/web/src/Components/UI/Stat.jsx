import PropTypes from "prop-types";

/**
 * KPI stat card for console overviews: icon, headline value, label and an
 * optional footnote (trend, share, or secondary metric).
 */
export default function Stat({ icon: Icon, value, label, sub, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  };
  return (
    <div className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone] || tones.brand}`}
        >
          <Icon className="text-xl" aria-hidden="true" />
        </span>
        <p
          className={`font-display truncate font-extrabold tabular-nums ${
            String(value).length > 6 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {value}
        </p>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-base-content/55">
        {label}
      </p>
      {sub && <p className="mt-1 truncate text-xs text-base-content/60">{sub}</p>}
    </div>
  );
}

Stat.propTypes = {
  icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  sub: PropTypes.string,
  tone: PropTypes.oneOf(["brand", "sky", "violet", "amber", "emerald", "rose"]),
};

import PropTypes from "prop-types";

const TONES = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  way: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  returned: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  fallback: "bg-base-200 text-base-content/70",
};

const DOTS = {
  pending: "bg-amber-500",
  way: "bg-sky-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
  returned: "bg-orange-500",
  paid: "bg-emerald-500",
  fallback: "bg-base-content/40",
};

function toneOf(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("pending")) return "pending";
  if (s.includes("way")) return "way";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("return")) return "returned";
  if (s.includes("paid") || s.includes("complet") || s.includes("success")) return "paid";
  return "fallback";
}

/**
 * Status pill with a live dot — one consistent language for parcel, payment
 * and delivery states across every table.
 */
export default function StatusPill({ status, className = "" }) {
  const tone = toneOf(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} aria-hidden="true" />
      {status || "—"}
    </span>
  );
}

StatusPill.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
};

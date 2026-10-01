import PropTypes from "prop-types";

/**
 * Zero-dependency SVG trend line with area fill.
 * Used for cumulative bookings — replaces the hardcoded apex demo series.
 */
export default function TrendLine({ data, height = 220 }) {
  const W = 560;
  const H = height;
  const pad = 12;
  const n = data.length;
  if (!n) return <p className="py-8 text-center text-sm text-base-content/50">No data yet.</p>;

  const max = Math.max(1, ...data.map((d) => d.value));
  const px = (i) => pad + (i * (W - pad * 2)) / Math.max(1, n - 1);
  const py = (v) => H - pad - ((H - pad * 2 - 8) * v) / max;
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.value)}`).join(" ");
  const area = `${line} L${px(n - 1)},${H - pad} L${px(0)},${H - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Trend line ending at ${data[n - 1].value}`}
    >
      <path d={area} className="fill-brand-500/15" />
      <path
        d={line}
        fill="none"
        strokeWidth="2.5"
        className="stroke-brand-500"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.label} cx={px(i)} cy={py(d.value)} r="3" className="fill-brand-600">
          <title>{`${d.label}: ${d.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}

TrendLine.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number.isRequired })
  ).isRequired,
  height: PropTypes.number,
};

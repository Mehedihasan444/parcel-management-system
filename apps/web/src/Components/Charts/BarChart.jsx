import PropTypes from "prop-types";

/**
 * Zero-dependency SVG bar chart. Replaces apexcharts (~580KB) for the
 * simple bookings-per-day visual the admin dashboard needs.
 */
export default function BarChart({ data, height = 220 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 560;
  const H = height;
  const padL = 8;
  const padB = 28;
  const gap = 8;
  const n = Math.max(1, data.length);
  const bw = (W - padL * 2 - gap * (n - 1)) / n;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Bar chart with ${n} bars, maximum ${max}`}
    >
      {data.map((d, i) => {
        const h = Math.max(4, ((H - padB - 16) * d.value) / max);
        const x = padL + i * (bw + gap);
        const y = H - padB - h;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={bw}
              height={h}
              rx={Math.min(6, bw / 3)}
              className="fill-brand-500"
              opacity={0.35 + (0.65 * d.value) / max}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {n <= 14 && (
              <text
                x={x + bw / 2}
                y={H - 10}
                textAnchor="middle"
                className="fill-base-content/50"
                fontSize="10"
              >
                {shortLabel(d.label)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function shortLabel(iso) {
  // "2024-03-15" -> "3/15"
  const parts = String(iso).split("-");
  if (parts.length === 3) return `${Number(parts[1])}/${Number(parts[2])}`;
  return String(iso).slice(0, 8);
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number.isRequired })
  ).isRequired,
  height: PropTypes.number,
};

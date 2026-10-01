import PropTypes from "prop-types";

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <section className="rounded-3xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-base-content/60">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  action: PropTypes.node,
};

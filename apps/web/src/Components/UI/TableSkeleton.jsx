import PropTypes from "prop-types";

/**
 * Loading placeholder for data tables: a card with pulsing rows matching the
 * column count, so the layout does not jump when data arrives.
 */
export default function TableSkeleton({ columns = 4, rows = 5 }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm"
      aria-hidden="true"
    >
      <div className="space-y-3 p-4">
        <div className="skeleton h-8 rounded-xl" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-3">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="skeleton h-10 flex-1 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

TableSkeleton.propTypes = {
  columns: PropTypes.number,
  rows: PropTypes.number,
};

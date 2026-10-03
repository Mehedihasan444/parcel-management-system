import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PropTypes from "prop-types";

/**
 * Numbered pager with a compact window around the current page plus first /
 * last jumps. Renders nothing when there is a single page.
 */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onChange(next);
  };

  const windowed = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
    windowed.push(p);
  }
  const showFirst = windowed[0] > 1;
  const showLast = windowed[windowed.length - 1] < totalPages;

  const btn = (active) => `btn btn-sm ${active ? "btn-primary" : "btn-ghost"}`;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="btn btn-sm btn-ghost"
        aria-label="Previous page"
      >
        <FiChevronLeft aria-hidden="true" /> Prev
      </button>
      {showFirst && (
        <>
          <button type="button" onClick={() => go(1)} className={btn(false)}>
            1
          </button>
          {windowed[0] > 2 && (
            <span className="px-1 text-base-content/40" aria-hidden="true">
              …
            </span>
          )}
        </>
      )}
      {windowed.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          aria-current={p === page ? "page" : undefined}
          className={btn(p === page)}
        >
          {p}
        </button>
      ))}
      {showLast && (
        <>
          {windowed[windowed.length - 1] < totalPages - 1 && (
            <span className="px-1 text-base-content/40" aria-hidden="true">
              …
            </span>
          )}
          <button type="button" onClick={() => go(totalPages)} className={btn(false)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="btn btn-sm btn-ghost"
        aria-label="Next page"
      >
        Next <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

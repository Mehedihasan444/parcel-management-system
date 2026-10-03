import PropTypes from "prop-types";

/**
 * Consistent dashboard + page header: eyebrow, title, supporting copy and an
 * optional right-side action row (buttons, filters).
 */
export default function PageHeader({ eyebrow, title, description, actions, tone = "light" }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              tone === "dark" ? "text-brand-300" : "text-brand-600 dark:text-brand-300"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`font-display mt-1.5 text-2xl font-bold tracking-tight text-balance sm:text-3xl ${
            tone === "dark" ? "text-white" : "text-base-content"
          }`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`mt-1.5 text-sm leading-relaxed ${tone === "dark" ? "text-white/70" : "text-base-content/70"}`}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  tone: PropTypes.oneOf(["light", "dark"]),
};

import PropTypes from "prop-types";

export default function Loading({ label = "Loading…" }) {
  return (
    <div
      className="grid min-h-[40vh] place-items-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-brand-500" aria-hidden="true" />
        <p className="text-sm font-medium text-base-content/60">{label}</p>
      </div>
    </div>
  );
}

Loading.propTypes = {
  label: PropTypes.string,
};

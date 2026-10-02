import PropTypes from "prop-types";

/**
 * Labeled dashboard form field with consistent premium styling.
 * Wraps any input; pass `hint` for helper text under the control.
 */
export default function FormField({ label, htmlFor, hint, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-base-content/55">{hint}</p>}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  htmlFor: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const inputClass =
  "input input-bordered w-full bg-base-100 focus:border-brand-500 focus:outline-none";

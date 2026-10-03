import { FiSearch, FiX } from "react-icons/fi";
import PropTypes from "prop-types";

/**
 * Table toolbar search box with a clear button. Controlled: the parent owns
 * the query state (URL param, local state, wherever it lives).
 */
export default function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <label className="relative block min-w-52 flex-1 sm:max-w-xs">
      <FiSearch
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
        aria-hidden="true"
      />
      <span className="sr-only">{label || placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder}
        className="input input-bordered input-sm w-full pl-9 pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"
        >
          <FiX aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
};

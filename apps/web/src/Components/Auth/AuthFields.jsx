import { useState } from "react";
import PropTypes from "prop-types";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

/** Labeled input with a leading icon. */
export function AuthField({ id, label, icon: Icon, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <label className="relative block">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
          aria-hidden="true"
        />
        <input
          id={id}
          className="input input-bordered w-full bg-base-100 pl-10 focus:border-brand-500 focus:outline-none"
          {...props}
        />
      </label>
    </div>
  );
}

AuthField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

/** Password input with a visibility toggle. */
export function PasswordField({ id = "password", label = "Password", ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <label className="relative block">
        <FiLock
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
          aria-hidden="true"
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          className="input input-bordered w-full bg-base-100 pl-10 pr-11 focus:border-brand-500 focus:outline-none"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="btn btn-ghost btn-xs btn-circle absolute right-2.5 top-1/2 -translate-y-1/2"
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </label>
    </div>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
};

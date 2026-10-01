import { Link } from "react-router-dom";
import { FiPackage, FiArrowRight } from "react-icons/fi";
import PropTypes from "prop-types";

const Error = ({ code = "404", title = "Page not found" }) => {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-16 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
          <FiPackage className="text-2xl" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-base-content/50">
          Error {code}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-base-content/70">
          The link may be broken, or the parcel moved without leaving a forwarding address.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            Back to home <FiArrowRight aria-hidden="true" />
          </Link>
          <Link to="/dashboard/myParcels" className="btn btn-ghost">
            Track parcel
          </Link>
        </div>
      </div>
    </div>
  );
};

Error.propTypes = {
  code: PropTypes.string,
  title: PropTypes.string,
};

export default Error;

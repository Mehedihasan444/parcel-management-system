import { Link, useRouteError } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiHome } from "react-icons/fi";

export default function RouteError() {
  const error = useRouteError();
  const message =
    error?.statusText || error?.message || "Something went wrong loading this page.";

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 py-16 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-error/10 text-error">
          <FiAlertTriangle className="text-2xl" aria-hidden="true" />
        </span>
        <h1 className="font-display mt-5 text-3xl font-bold">Page failed to load</h1>
        <p className="mt-2 text-sm text-base-content/70">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            <FiHome aria-hidden="true" /> Home
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>
            <FiArrowLeft aria-hidden="true" /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}

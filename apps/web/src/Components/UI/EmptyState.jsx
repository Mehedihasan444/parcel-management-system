import PropTypes from "prop-types";
import { FiInbox } from "react-icons/fi";

/**
 * Friendly empty state for tables and lists: icon medallion, title, copy and
 * one optional call to action.
 */
export default function EmptyState({ icon: Icon = FiInbox, title, body, action }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600">
        <Icon className="text-2xl" aria-hidden="true" />
      </span>
      <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-base-content/65">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  action: PropTypes.node,
};

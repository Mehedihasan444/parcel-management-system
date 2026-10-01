import { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Minimal document-title manager — replaces react-helmet-async
 * (which has no React 19 peer release) for the titles this app needs.
 * Restores the previous title on unmount so route changes don't leak.
 */
export default function DocumentTitle({ title }) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
  return null;
}

DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

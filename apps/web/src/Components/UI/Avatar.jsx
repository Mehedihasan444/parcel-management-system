import { useState } from "react";
import PropTypes from "prop-types";

function initialsOf(name, email) {
  const clean = String(name || "").trim();
  if (clean) {
    const parts = clean.split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
    const out = `${first}${last}`.toUpperCase();
    if (out) return out;
  }
  const local = String(email || "")
    .split("@")[0]
    .replace(/[^a-zA-Z]/g, "");
  return (local.slice(0, 2) || "?").toUpperCase();
}

/**
 * Real user photo with an initials fallback — never a fake avatar service.
 * Shows `src` when it loads, and swaps to initials on missing/broken urls
 * (stale Cloudinary/imgbb links included).
 */
export default function Avatar({ src, name, email, className = "h-10 w-10 text-sm" }) {
  // Remembered per-url, so a fixed url retries naturally and a new url is
  // never stuck showing initials because an older one failed.
  const [failed, setFailed] = useState({});
  const broken = Boolean(src && failed[src]);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={`${name || email || "User"} profile photo`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed((prev) => ({ ...prev, [src]: true }))}
        className={`${className} object-cover`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`${name || email || "User"} profile photo`}
      className={`grid shrink-0 place-items-center bg-brand-500/15 font-bold text-brand-700 dark:text-brand-200 ${className}`}
    >
      {initialsOf(name, email)}
    </span>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  className: PropTypes.string,
};

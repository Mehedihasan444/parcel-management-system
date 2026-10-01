import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const THEMES = ["light", "dark"];

function getInitial() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem("rph-theme") || document.documentElement.dataset.theme || "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rph-theme", theme);
  }, [theme]);

  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-circle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {theme === "light" ? <FiMoon className="text-lg" /> : <FiSun className="text-lg" />}
    </button>
  );
}

export { THEMES };

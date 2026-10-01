import PropTypes from "prop-types";

const SectionTitle = ({ heading, subHeading, align = "center", tone = "light" }) => {
  const centered = align === "center";
  const eyebrowColor = tone === "dark" ? "text-brand-300" : "text-brand-600";
  const titleColor = tone === "dark" ? "text-white" : "text-ink-900";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : "text-left"} mb-10`}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowColor}`}
      >
        <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
        {subHeading}
        {centered && <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />}
      </p>
      <h2 className={`font-display mt-3 text-3xl font-bold text-balance sm:text-4xl ${titleColor}`}>
        {heading}
      </h2>
    </div>
  );
};

SectionTitle.propTypes = {
  heading: PropTypes.string.isRequired,
  subHeading: PropTypes.string.isRequired,
  align: PropTypes.oneOf(["center", "left"]),
  tone: PropTypes.oneOf(["light", "dark"]),
};

export default SectionTitle;

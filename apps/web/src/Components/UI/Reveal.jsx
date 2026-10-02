import { motion, useReducedMotion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Scroll-triggered reveal wrapper. Fades + rises content once when it enters
 * the viewport; instant when the user prefers reduced motion.
 */
export default function Reveal({ children, delay = 0, className = "", y = 24 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
  y: PropTypes.number,
};

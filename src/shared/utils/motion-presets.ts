import type { Variants } from 'framer-motion';

/**
 * Editorial stagger: fade phẳng, không overshoot (spec Editorial Print).
 * Caller bọc grid bằng <motion.div variants={staggerContainer} initial="hidden" animate="show">
 * và mỗi item <motion.div variants={staggerItem}>; khi useReducedMotion() → animate="show" tĩnh.
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

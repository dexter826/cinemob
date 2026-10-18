import type { Variants } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING } from '@/constants/animations';

/**
 * Stagger fade phẳng, không overshoot.
 * Caller bọc grid bằng <motion.div variants={staggerContainer} initial="hidden" animate="show">
 * và mỗi item <motion.div variants={staggerItem}>; khi useReducedMotion() → animate="show" tĩnh.
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.medium, ease: MOTION_EASING.enter },
  },
};

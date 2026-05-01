import { Variants } from 'framer-motion';

/** Các hiệu ứng chuyển động chung cho Modal. */
export const MODAL_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

/** Hiệu ứng lớp phủ nền (Overlay). */
export const OVERLAY_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

/** Hiệu ứng chuyển trang (Page transitions). */
export const PAGE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

export const PAGE_TRANSITION = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
} as const;

import type { Transition, Variants } from 'framer-motion';

export const MOTION_DURATION = {
  fast: 0.14,
  standard: 0.2,
  deliberate: 0.28,
} as const;

export const MOTION_EASING = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
} as const;

export const OVERLAY_VARIANTS: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

export const DIALOG_VARIANTS: Variants = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0 },
};

export const getMotionTransition = (reducedMotion: boolean): Transition => ({
  duration: reducedMotion ? 0 : MOTION_DURATION.deliberate,
  ease: MOTION_EASING.enter,
});

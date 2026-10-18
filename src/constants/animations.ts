import type { Transition } from 'framer-motion';

export const MOTION_DURATION = {
  fast: 0.12,
  base: 0.15,
  medium: 0.2,
  slow: 0.25,
  picker: 3.15,
  pickerAudioTail: 1.95,
} as const;

export const MOTION_EASING: Record<
  'standard' | 'enter' | 'exit',
  [number, number, number, number]
> = {
  standard: [0.4, 0, 0.2, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
};

export const getMotionTransition = (
  reducedMotion: boolean,
  duration: number,
  ease: [number, number, number, number],
): Transition => ({
  duration: reducedMotion ? 0 : duration,
  ease,
});

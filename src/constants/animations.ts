import { Variants } from 'framer-motion';

// Modal xuất hiện ngay để tránh nháy do browser phải composite nhiều lớp lớn.
export const MODAL_VARIANTS: Variants = {
  hidden: { opacity: 1, scale: 1, y: 0 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 1, scale: 1, y: 0 }
};

// Lớp phủ cũng không fade để tránh chớp toàn viewport khi mở modal.
export const OVERLAY_VARIANTS: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 1 }
};

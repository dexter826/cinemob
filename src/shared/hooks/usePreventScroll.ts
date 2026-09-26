import { useEffect } from 'react';

// Khóa cuộn trang khi mở modal và giữ nguyên layout.
export const usePreventScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const currentCount = parseInt(document.body.getAttribute('data-modal-count') || '0', 10);
    const newCount = currentCount + 1;
    document.body.setAttribute('data-modal-count', newCount.toString());

    if (newCount === 1) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      document.body.setAttribute('data-modal-overflow', originalOverflow);
      document.body.setAttribute('data-modal-padding-right', originalPaddingRight);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

    return () => {
      const activeCount = parseInt(document.body.getAttribute('data-modal-count') || '0', 10);
      const remainingCount = Math.max(0, activeCount - 1);

      if (remainingCount === 0) {
        document.body.removeAttribute('data-modal-count');
        document.body.style.overflow = document.body.getAttribute('data-modal-overflow') ?? '';
        document.body.style.paddingRight = document.body.getAttribute('data-modal-padding-right') ?? '';
        document.body.removeAttribute('data-modal-overflow');
        document.body.removeAttribute('data-modal-padding-right');
      } else {
        document.body.setAttribute('data-modal-count', remainingCount.toString());
      }
    };
  }, [isOpen]);
};

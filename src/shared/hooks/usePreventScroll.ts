import { useEffect } from 'react';

// Khóa cuộn trang khi mở modal và giữ nguyên layout.
export const usePreventScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const currentCount = parseInt(document.body.getAttribute('data-modal-count') || '0', 10);
    const newCount = currentCount + 1;
    document.body.setAttribute('data-modal-count', newCount.toString());

    if (newCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      const activeCount = parseInt(document.body.getAttribute('data-modal-count') || '0', 10);
      const remainingCount = Math.max(0, activeCount - 1);

      if (remainingCount === 0) {
        document.body.removeAttribute('data-modal-count');
        document.body.style.overflow = '';
      } else {
        document.body.setAttribute('data-modal-count', remainingCount.toString());
      }
    };
  }, [isOpen]);
};

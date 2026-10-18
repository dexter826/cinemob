import { useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';

/**
 * Lưu vị trí scroll vào sessionStorage, CHỈ phục hồi khi điều hướng kiểu POP
 * (Back/Forward từ trang chi tiết về lưới). Bấm nav sang trang khác luôn mở từ đỉnh.
 */
export function useScrollRestore(key: string) {
  const navigationType = useNavigationType();

  useEffect(() => {
    const storageKey = `scroll:${key}`;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(storageKey, String(window.scrollY));
        } catch {
          /* sessionStorage có thể bị chặn (private mode) — bỏ qua */
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    if (navigationType === 'POP') {
      const raf = requestAnimationFrame(() => {
        try {
          const saved = sessionStorage.getItem(storageKey);
          if (saved) window.scrollTo({ top: Number(saved), behavior: 'auto' });
        } catch {}
      });
      return () => {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
      };
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [key, navigationType]);
}

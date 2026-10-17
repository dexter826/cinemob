import { useEffect } from 'react';

/**
 * Lưu vị trí scroll vào sessionStorage và phục hồi khi component mount lại
 * (Back từ /movie/:id về Dashboard phải đứng đúng chỗ — spec §8.7).
 * Lưu throttle bằng rAF; key theo route để không đè nhau giữa các trang.
 */
export function useScrollRestore(key: string) {
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

    const raf = requestAnimationFrame(() => {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) window.scrollTo({ top: Number(saved), behavior: 'auto' });
      } catch {
        /* ignore */
      }
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [key]);
}

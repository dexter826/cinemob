import { useEffect, useRef, useState } from 'react';

interface DelayedSkeletonOptions {
  /** Chờ trước khi hiện để tránh flash khi data về nhanh. */
  delay?: number;
  /** Giữ đủ lâu một khi đã hiện để tránh nhấp nháy. */
  minVisible?: number;
}

/**
 * Cờ hiển thị skeleton: chỉ hiện sau `delay` và giữ tối thiểu `minVisible`.
 * `shouldShow` = vùng đang tải và chưa có data cho context hiện tại.
 */
export function useDelayedSkeleton(
  shouldShow: boolean,
  { delay = 150, minVisible = 300 }: DelayedSkeletonOptions = {},
) {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const minTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (delayTimerRef.current !== null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (minTimerRef.current !== null) {
        window.clearTimeout(minTimerRef.current);
        minTimerRef.current = null;
      }
    };

    if (shouldShow) {
      if (visible) return;
      clearTimers();
      delayTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delay);
    } else {
      clearTimers();
      if (!visible) return;
      const shownAt = shownAtRef.current ?? Date.now();
      const remaining = minVisible - (Date.now() - shownAt);
      if (remaining <= 0) {
        shownAtRef.current = null;
        setVisible(false);
        return;
      }
      minTimerRef.current = window.setTimeout(() => {
        shownAtRef.current = null;
        setVisible(false);
      }, remaining);
    }

    return clearTimers;
  }, [shouldShow, visible, delay, minVisible]);

  return visible;
}

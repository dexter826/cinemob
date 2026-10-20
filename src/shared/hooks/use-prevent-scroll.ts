import { useEffect } from 'react';

const LOCK_COUNT_ATTR = 'data-modal-count';

const ORIGINAL_STATE_ATTRS = {
  bodyOverflow: 'data-modal-overflow',
  bodyPaddingRight: 'data-modal-padding-right',
  htmlOverflow: 'data-modal-html-overflow',
  bodyPosition: 'data-modal-position',
  bodyTop: 'data-modal-top',
  bodyWidth: 'data-modal-width',
  scrollY: 'data-modal-scroll-y',
} as const;

type OriginalStateKey = keyof typeof ORIGINAL_STATE_ATTRS;

const readOriginal = (key: OriginalStateKey) =>
  document.body.getAttribute(ORIGINAL_STATE_ATTRS[key]) ?? '';

const saveOriginal = (key: OriginalStateKey, value: string) => {
  document.body.setAttribute(ORIGINAL_STATE_ATTRS[key], value);
};

const clearOriginal = () => {
  Object.values(ORIGINAL_STATE_ATTRS).forEach((attr) => document.body.removeAttribute(attr));
};

export const usePreventScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const html = document.documentElement;
    const currentCount = parseInt(body.getAttribute(LOCK_COUNT_ATTR) ?? '0', 10);
    const newCount = currentCount + 1;
    body.setAttribute(LOCK_COUNT_ATTR, String(newCount));

    if (newCount === 1) {
      const scrollY = window.scrollY;
      saveOriginal('bodyOverflow', body.style.overflow);
      saveOriginal('bodyPaddingRight', body.style.paddingRight);
      saveOriginal('htmlOverflow', html.style.overflow);
      saveOriginal('bodyPosition', body.style.position);
      saveOriginal('bodyTop', body.style.top);
      saveOriginal('bodyWidth', body.style.width);
      saveOriginal('scrollY', String(scrollY));

      const scrollbarWidth = window.innerWidth - html.clientWidth;
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // index.css đặt overflow-x: clip trên html nên body không còn là scroll container
      // duy nhất; iOS Safari cũng bỏ qua overflow: hidden nên phải ghim body.
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
    }

    return () => {
      const activeCount = parseInt(body.getAttribute(LOCK_COUNT_ATTR) ?? '0', 10);
      const remainingCount = Math.max(0, activeCount - 1);

      if (remainingCount === 0) {
        const scrollY = parseInt(readOriginal('scrollY') || '0', 10);
        body.removeAttribute(LOCK_COUNT_ATTR);
        html.style.overflow = readOriginal('htmlOverflow');
        body.style.overflow = readOriginal('bodyOverflow');
        body.style.paddingRight = readOriginal('bodyPaddingRight');
        body.style.position = readOriginal('bodyPosition');
        body.style.top = readOriginal('bodyTop');
        body.style.width = readOriginal('bodyWidth');
        clearOriginal();
        window.scrollTo(0, scrollY);
      } else {
        body.setAttribute(LOCK_COUNT_ATTR, String(remainingCount));
      }
    };
  }, [isOpen]);
};

import React from 'react';

const trapStack: Array<symbol> = [];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface FocusTrapOptions {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  onEscape: () => void;
}

function getFocusable(container: HTMLElement): Array<HTMLElement> {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

export function useFocusTrap({ active, containerRef, initialFocusRef, onEscape }: FocusTrapOptions) {
  const tokenRef = React.useRef<symbol | null>(null);
  const savedFocusRef = React.useRef<HTMLElement | null>(null);
  const onEscapeRef = React.useRef(onEscape);
  onEscapeRef.current = onEscape;

  React.useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const token = Symbol('focus-trap');
    tokenRef.current = token;
    trapStack.push(token);
    savedFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusTarget = () => {
      const initial = initialFocusRef?.current;
      if (initial && container.contains(initial) && !initial.hasAttribute('disabled')) {
        initial.focus();
        return;
      }
      const focusable = getFocusable(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    };
    focusTarget();

    const isTopmost = () => trapStack[trapStack.length - 1] === tokenRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost()) return;
      const current = containerRef.current;
      if (!current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = trapStack.indexOf(token);
      if (index !== -1) trapStack.splice(index, 1);
      const saved = savedFocusRef.current;
      if (saved && saved.isConnected) saved.focus();
      tokenRef.current = null;
    };
  }, [active, containerRef, initialFocusRef]);
}

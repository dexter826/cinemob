import React from 'react';
import { createPortal } from 'react-dom';
import {
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  shift,
  size,
  useFloating,
  type Middleware,
} from '@floating-ui/react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';
import { useFocusTrap } from '@/shared/hooks/use-focus-trap';
import { classNames } from '@/shared/utils/class-names';

interface FloatingPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  id?: string;
  ariaLabel?: string;
  className?: string;
  align?: 'start' | 'end';
  matchTriggerWidth?: boolean;
  offset?: number;
  children: React.ReactNode;
}

function FloatingPanel({
  open,
  onClose,
  anchorRef,
  panelRef,
  id,
  ariaLabel,
  className = '',
  align = 'start',
  matchTriggerWidth = false,
  offset = 4,
  children,
}: FloatingPanelProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const reducedMotion = useReducedMotion() ?? false;
  const panelMotion = getPanelMotion(reducedMotion);

  const middleware: Array<Middleware> = [offsetMiddleware(offset), flip(), shift({ padding: 8 })];
  if (matchTriggerWidth) {
    middleware.push(
      size({
        apply({ rects, elements }) {
          elements.floating.style.width = `${rects.reference.width}px`;
        },
      }),
    );
  }

  const { refs, floatingStyles, update } = useFloating({
    strategy: 'fixed',
    placement: align === 'end' ? 'bottom-end' : 'bottom-start',
    middleware,
  });

  React.useLayoutEffect(() => {
    refs.setReference(anchorRef.current);
  });

  React.useLayoutEffect(() => {
    if (!open) return undefined;
    const anchor = anchorRef.current;
    const floating = refs.floating.current;
    if (!anchor || !floating) return undefined;
    return autoUpdate(anchor, floating, update, {
      ancestorScroll: true,
      ancestorResize: true,
    });
  }, [open, anchorRef, refs, update]);

  React.useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (containerRef.current?.contains(target)) return;
      onCloseRef.current();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, anchorRef]);

  useFocusTrap({
    active: open,
    containerRef,
    autoFocus: false,
    onEscape: () => onCloseRef.current(),
  });

  const setContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (panelRef) panelRef.current = node;
  };

  return createPortal(
    <div ref={refs.setFloating} style={floatingStyles} className="z-60">
      <AnimatePresence>
        {open && (
          <motion.div
            key="floating-panel"
            ref={setContainerRef}
            id={id}
            tabIndex={-1}
            role={ariaLabel ? 'dialog' : undefined}
            aria-label={ariaLabel}
            {...panelMotion}
            className={classNames('bg-surface-elevated border border-border', className)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export default FloatingPanel;

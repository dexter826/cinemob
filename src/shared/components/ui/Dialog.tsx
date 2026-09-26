import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DIALOG_VARIANTS, OVERLAY_VARIANTS, getMotionTransition } from '@/constants/animations';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import { classNames } from '@/shared/utils/classNames';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  presentation?: 'dialog' | 'sheet' | 'fullscreen-mobile';
  size?: DialogSize;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  closeOnOverlay?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
};

const getPresentationClasses = (presentation: NonNullable<DialogProps['presentation']>, size?: DialogSize) => {
  const chosenSize = size ? sizeClasses[size] : null;

  switch (presentation) {
    case 'dialog':
      return classNames('m-auto w-full max-h-[90vh]', chosenSize || 'max-w-lg');
    case 'sheet':
      return classNames('mt-auto w-full sm:m-auto sm:max-h-[90vh]', chosenSize || 'sm:max-w-lg');
    case 'fullscreen-mobile':
      return classNames('m-0 w-full h-full sm:m-auto sm:h-auto sm:w-full sm:max-h-[90vh]', chosenSize || 'sm:max-w-2xl');
    default:
      return '';
  }
};

export function Dialog({
  open,
  onClose,
  titleId,
  descriptionId,
  presentation = 'dialog',
  size,
  initialFocusRef,
  closeOnOverlay = true,
  children,
  className = '',
}: DialogProps) {
  const dialogRef = React.useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  usePreventScroll(open);
  useFocusTrap({ active: open, containerRef: dialogRef, initialFocusRef, onEscape: onClose });

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="dialog-overlay"
          role="presentation"
          className="fixed inset-0 z-50 flex flex-col bg-black/60 p-0 sm:p-4"
          variants={OVERLAY_VARIANTS}
          initial="closed"
          animate="open"
          exit="closed"
          transition={getMotionTransition(reducedMotion)}
          onClick={(event) => {
            if (closeOnOverlay && event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            ref={dialogRef as React.RefObject<HTMLElement>}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className={classNames(
              'flex flex-col overflow-hidden bg-surface-elevated text-text-primary shadow-elevated',
              'rounded-none sm:rounded-dialog',
              getPresentationClasses(presentation, size),
              className
            )}
            variants={DIALOG_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
            transition={getMotionTransition(reducedMotion)}
          >
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DialogHeader({ titleId, title, descriptionId, description, onClose }: {
  titleId: string;
  title: string;
  descriptionId?: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base sm:text-lg font-bold tracking-tight font-display truncate">{title}</h2>
          {description && (
            <p id={descriptionId} className="text-xs sm:text-sm text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="inline-flex w-9 h-9 items-center justify-center rounded-control text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shrink-0"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function DialogBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames('flex-1 overflow-y-auto px-4 py-4 sm:px-6', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={classNames(
        'shrink-0 border-t border-border bg-surface-elevated px-4 py-3 sm:px-6 sm:py-4',
        'pb-[calc(0.75rem+env(safe-area-inset-bottom))]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default Dialog;

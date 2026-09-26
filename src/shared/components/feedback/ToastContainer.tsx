import { useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION } from '@/constants/animations';
import useToastStore from '../../stores/toastStore';
import { IconButton } from '../ui/IconButton';

const toastTransition = { duration: MOTION_DURATION.standard, ease: 'easeOut' as const };

function ToastIcon({ type }: { type: string }) {
  const iconClass = 'mr-3 shrink-0';
  if (type === 'success') return <CheckCircle size={18} className={`${iconClass} text-success`} aria-hidden="true" />;
  if (type === 'error') return <AlertCircle size={18} className={`${iconClass} text-danger`} aria-hidden="true" />;
  if (type === 'warning') return <AlertTriangle size={18} className={`${iconClass} text-warning`} aria-hidden="true" />;
  return <Info size={18} className={`${iconClass} text-info`} aria-hidden="true" />;
}

function ToastList({ types, role, ariaLive }: { types: Array<string>; role: string; ariaLive: 'polite' | 'assertive' }) {
  const { toasts, removeToast } = useToastStore();
  const reducedMotion = useReducedMotion() ?? false;
  const items = toasts.filter((t) => types.includes(t.type));
  if (items.length === 0) return null;
  return (
    <div role={role} aria-live={ariaLive} className="flex flex-col gap-3 items-center w-full">
      <AnimatePresence mode="popLayout">
        {items.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reducedMotion}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, transition: { duration: MOTION_DURATION.fast } }}
            transition={toastTransition}
            aria-atomic="true"
            className="flex items-center p-3.5 sm:p-4 rounded-card shadow-elevated border border-border bg-surface-elevated text-text-primary pointer-events-auto w-full"
          >
            <ToastIcon type={toast.type} />
            <span className="text-xs sm:text-sm font-semibold flex-1 tracking-tight mr-4 leading-tight">
              {toast.message}
            </span>
            <IconButton label="Đóng thông báo" size="sm" onClick={() => removeToast(toast.id)}>
              <X size={14} aria-hidden="true" />
            </IconButton>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Tiered toast announcements. Store API (`showToast`) unchanged. */
function ToastContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-3 items-center pointer-events-none w-full max-w-[90vw] sm:max-w-md"
    >
      <ToastList types={['success', 'info']} role="status" ariaLive="polite" />
      <ToastList types={['warning', 'error']} role="alert" ariaLive="assertive" />
    </div>
  );
}

export default ToastContainer;

import React from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useToastStore from '../../stores/toastStore';

/** Container hiển thị các thông báo Toast toàn cục với hiệu ứng mượt mà. */
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-3 items-center pointer-events-none w-full max-w-[90vw] sm:max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`
              flex items-center p-3.5 sm:p-4 rounded-2xl shadow-premium border backdrop-blur-xl pointer-events-auto w-full
              ${
                toast.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
                toast.type === 'error' ? 'bg-error/10 border-error/20 text-error' :
                toast.type === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
                'bg-info/10 border-info/20 text-info'
              }
            `}
          >
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircle size={18} className="mr-3" />}
              {toast.type === 'error' && <AlertCircle size={18} className="mr-3" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="mr-3" />}
              {toast.type === 'info' && <Info size={18} className="mr-3" />}
            </div>
            
            <span className="text-xs sm:text-sm font-bold flex-1 tracking-tight mr-4 leading-tight">
              {toast.message}
            </span>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer shrink-0"
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
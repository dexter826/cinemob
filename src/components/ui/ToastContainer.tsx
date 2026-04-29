import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import useToastStore from '../../stores/toastStore';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-2xl shadow-premium border backdrop-blur-xl animate-slide-down transition-all ${
            toast.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
            toast.type === 'error' ? 'bg-error/10 border-error/20 text-error' :
            'bg-info/10 border-info/20 text-info'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={18} className="mr-3" />}
          {toast.type === 'error' && <AlertCircle size={18} className="mr-3" />}
          {toast.type === 'info' && <Info size={18} className="mr-3" />}
          <span className="text-sm font-bold mr-8 tracking-tight">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
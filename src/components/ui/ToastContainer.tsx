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
          className={`flex items-center p-4 rounded-xl shadow-lg border backdrop-blur-md animate-slide-down transition-all ${
            toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={20} className="mr-3" />}
          {toast.type === 'error' && <AlertCircle size={20} className="mr-3" />}
          {toast.type === 'info' && <Info size={20} className="mr-3" />}
          <span className="text-sm font-medium mr-8">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:bg-white/10 rounded-full p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
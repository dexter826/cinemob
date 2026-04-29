import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import useAlertStore from '../../stores/alertStore';

const AlertContainer: React.FC = () => {
  const { alert, hideAlert } = useAlertStore();

  if (!alert) return null;

  const handleConfirm = () => {
    if (alert.onConfirm) alert.onConfirm();
    hideAlert();
  };

  const handleCancel = () => {
    if (alert.onCancel) alert.onCancel();
    hideAlert();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-border-default transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${alert.type === 'danger' ? 'bg-error/10 text-error' :
              alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                'bg-info/10 text-info'
              }`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-text-main tracking-tight">{alert.title}</h3>
          </div>

          <p className="text-text-muted mb-6 leading-relaxed opacity-90">
            {alert.message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-sm cursor-pointer"
            >
              {alert.cancelText || 'Hủy'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-premium hover:shadow-premium-hover flex items-center gap-2 cursor-pointer ${alert.type === 'danger' ? 'bg-error' :
                'bg-primary'
                }`}
            >
              {alert.confirmText || 'Đồng ý'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertContainer;
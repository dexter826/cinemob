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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${alert.type === 'danger' ? 'bg-red-500/20 text-red-500' :
              alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-blue-500/20 text-blue-500'
              }`}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-text-main">{alert.title}</h3>
          </div>

          <p className="text-text-muted mb-6 leading-relaxed">
            {alert.message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-text-muted hover:bg-white/5 transition-colors font-medium cursor-pointer"
            >
              {alert.cancelText || 'Hủy'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 cursor-pointer ${alert.type === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                'bg-primary hover:bg-primary-dark'
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
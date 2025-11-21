import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert(options);
  }, []);

  const handleConfirm = () => {
    if (alert?.onConfirm) alert.onConfirm();
    setAlert(null);
  };

  const handleCancel = () => {
    if (alert?.onCancel) alert.onCancel();
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${
                  alert.type === 'danger' ? 'bg-red-500/20 text-red-500' : 
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
                  className="px-4 py-2 rounded-lg text-text-muted hover:bg-white/5 transition-colors font-medium"
                >
                  {alert.cancelText || 'Hủy'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                    alert.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                    'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {alert.confirmText || 'Đồng ý'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

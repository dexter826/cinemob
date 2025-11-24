import { create } from 'zustand';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertState {
  alert: AlertOptions | null;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  alert: null,
  showAlert: (options) => set({ alert: options }),
  hideAlert: () => set({ alert: null }),
}));

export default useAlertStore;
import { create } from 'zustand';
import { ToastType } from '@/types';

export interface ToastAction {
  label: string;
  onAction: () => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
  removeToast: (id: number) => void;
}

// Quản lý thông báo toast toàn cục.
let toastSeq = 0;
const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000,
    action?: ToastAction,
  ) => {
    toastSeq = (toastSeq + 1) % 1000;
    const id = Date.now() * 1000 + toastSeq;
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration, action }] }));

    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id: number) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export default useToastStore;

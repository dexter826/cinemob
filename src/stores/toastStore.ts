import { create } from 'zustand';
import { ToastType } from '../types';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: number) => void;
}

// Quản lý thông báo toast toàn cục.
const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id: number) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));

export default useToastStore;
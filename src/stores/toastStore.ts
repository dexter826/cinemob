import { create } from 'zustand';
import { ToastType } from '../types';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id: number) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));

export default useToastStore;
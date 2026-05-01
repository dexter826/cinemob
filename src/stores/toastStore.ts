import { create } from 'zustand';
import { ToastType } from '../types';

/** Định nghĩa cấu trúc một tin nhắn Toast. */
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  /** Hiển thị thông báo Toast. */
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  /** Gỡ bỏ thông báo Toast. */
  removeToast: (id: number) => void;
}

/** Store quản lý trạng thái các thông báo Toast toàn cục. */
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
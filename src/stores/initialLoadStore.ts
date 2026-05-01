import { create } from 'zustand';

interface InitialLoadStore {
  isInitialLoadComplete: boolean;
  isPageLoading: boolean;
  markInitialLoadComplete: () => void;
  setPageLoading: (loading: boolean) => void;
}

// Quản lý trạng thái tải dữ liệu lần đầu.
const useInitialLoadStore = create<InitialLoadStore>((set) => ({
  isInitialLoadComplete: false,
  isPageLoading: false,
  markInitialLoadComplete: () => set({ isInitialLoadComplete: true }),
  setPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
}));

export default useInitialLoadStore;

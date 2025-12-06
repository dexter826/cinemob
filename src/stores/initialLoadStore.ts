import { create } from 'zustand';

interface InitialLoadStore {
  isInitialLoadComplete: boolean;
  isPageLoading: boolean; // Track page-level loading
  markInitialLoadComplete: () => void;
  setPageLoading: (loading: boolean) => void;
}

const useInitialLoadStore = create<InitialLoadStore>((set) => ({
  isInitialLoadComplete: false,
  isPageLoading: false,
  markInitialLoadComplete: () => set({ isInitialLoadComplete: true }),
  setPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
}));

export default useInitialLoadStore;

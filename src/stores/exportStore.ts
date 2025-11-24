import { create } from 'zustand';
import { Movie } from '../types';

interface ExportState {
  isExportModalOpen: boolean;
  movies: Movie[];
  setIsExportModalOpen: (open: boolean) => void;
  setMovies: (movies: Movie[]) => void;
}

const useExportStore = create<ExportState>((set) => ({
  isExportModalOpen: false,
  movies: [],
  setIsExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setMovies: (movies) => set({ movies }),
}));

export default useExportStore;
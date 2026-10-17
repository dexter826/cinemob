import { create } from 'zustand';
import { Movie, TMDBMovieResult } from '@/types';

interface AddMovieInitialData {
  tmdbId?: number;
  movie?: TMDBMovieResult;
  movieToEdit?: Movie;
  mediaType?: 'movie' | 'tv';
  onMovieAdded?: (tmdbId: number | string) => void;
}

interface AddMovieState {
  isOpen: boolean;
  initialData: AddMovieInitialData | null;
  openAddModal: (data?: AddMovieInitialData) => void;
  closeAddModal: () => void;
}

// Quản lý modal thêm/sửa phim.
const useAddMovieStore = create<AddMovieState>((set) => ({
  isOpen: false,
  initialData: null,
  openAddModal: (data?: AddMovieInitialData) => set({ initialData: data ?? null, isOpen: true }),
  closeAddModal: () => set({ isOpen: false, initialData: null }),
}));

export default useAddMovieStore;

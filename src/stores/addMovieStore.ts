import { create } from 'zustand';
import { Movie, TMDBMovieResult } from '../types';

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

const useAddMovieStore = create<AddMovieState>((set) => ({
  isOpen: false,
  initialData: null,
  openAddModal: (data = null) => set({ initialData: data, isOpen: true }),
  closeAddModal: () => set({ isOpen: false, initialData: null }),
}));

export default useAddMovieStore;
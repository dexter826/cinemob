import { create } from 'zustand';
import { Movie } from '../types';

interface MovieDetailState {
    isOpen: boolean;
    movie: Movie | null;
    openDetailModal: (movie: Movie) => void;
    closeDetailModal: () => void;
}

const useMovieDetailStore = create<MovieDetailState>((set) => ({
    isOpen: false,
    movie: null,
    openDetailModal: (movie) => set({ movie, isOpen: true }),
    closeDetailModal: () => set({ isOpen: false, movie: null }),
}));

export default useMovieDetailStore;

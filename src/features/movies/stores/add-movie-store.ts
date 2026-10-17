import { auth } from '@/shared/lib/firebase';
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
  ownerUid: string | null;
  generation: number;
  initialData: AddMovieInitialData | null;
  openAddModal: (data?: AddMovieInitialData) => void;
  closeAddModal: () => void;
}

// Quản lý modal thêm/sửa phim.
const useAddMovieStore = create<AddMovieState>((set) => ({
  isOpen: false,
  ownerUid: null,
  generation: 0,
  initialData: null,
  openAddModal: (data?: AddMovieInitialData) => {
    const ownerUid = auth.currentUser?.uid;
    if (!ownerUid) return;
    set((state) => ({
      initialData: data ?? null,
      isOpen: true,
      ownerUid,
      generation: state.generation + 1,
    }));
  },
  closeAddModal: () =>
    set((state) => ({
      isOpen: false,
      initialData: null,
      ownerUid: null,
      generation: state.generation + 1,
    })),
}));

export default useAddMovieStore;

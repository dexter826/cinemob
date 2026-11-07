import { auth } from '@/shared/lib/firebase';
import { create } from 'zustand';
import { Movie } from '@/types';

/** Đích đến của hộp "Đánh dấu đã xem": phim đã trong thư viện, hoặc kết quả TMDB chưa lưu. */
export type MarkWatchedTarget =
  | { kind: 'library'; movie: Movie }
  | {
      kind: 'tmdb';
      id: number | string;
      title: string;
      poster_path: string;
      media_type: 'movie' | 'tv';
      release_date?: string;
    };

interface MarkWatchedState {
  isOpen: boolean;
  ownerUid: string | null;
  target: MarkWatchedTarget | null;
  openMarkWatched: (target: MarkWatchedTarget) => void;
  closeMarkWatched: () => void;
}

const useMarkWatchedStore = create<MarkWatchedState>((set) => ({
  isOpen: false,
  ownerUid: null,
  target: null,
  openMarkWatched: (target) => {
    const ownerUid = auth.currentUser?.uid;
    if (!ownerUid) return;
    set({ target, isOpen: true, ownerUid });
  },
  closeMarkWatched: () => set({ isOpen: false, target: null, ownerUid: null }),
}));

export default useMarkWatchedStore;

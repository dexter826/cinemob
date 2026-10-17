import { create } from 'zustand';
import { Album, Movie } from '@/types';

interface AlbumState {
  albums: Album[];
  loading: boolean;
  /** Poster chồng thẻ album (tối đa 3 phim mỗi album), tính một lần trong use-app-init. */
  albumCoverMovies: Record<string, Movie[]>;
  setAlbums: (albums: Album[]) => void;
  setLoading: (loading: boolean) => void;
  setAlbumCoverMovies: (covers: Record<string, Movie[]>) => void;
}

// Quản lý danh sách album và ảnh bìa.
const useAlbumStore = create<AlbumState>((set) => ({
  albums: [],
  loading: true,
  albumCoverMovies: {},
  setAlbums: (albums) => set({ albums }),
  setLoading: (loading) => set({ loading }),
  setAlbumCoverMovies: (covers) => set({ albumCoverMovies: covers }),
}));

export default useAlbumStore;

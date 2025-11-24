import { create } from 'zustand';
import { Album, Movie } from '../types';

interface AlbumState {
  albums: Album[];
  loading: boolean;
  albumCoverMovies: Record<string, Movie | null>;
  setAlbums: (albums: Album[]) => void;
  setLoading: (loading: boolean) => void;
  setAlbumCoverMovies: (covers: Record<string, Movie | null>) => void;
}

const useAlbumStore = create<AlbumState>((set) => ({
  albums: [],
  loading: true,
  albumCoverMovies: {},
  setAlbums: (albums) => set({ albums }),
  setLoading: (loading) => set({ loading }),
  setAlbumCoverMovies: (covers) => set({ albumCoverMovies: covers }),
}));

export default useAlbumStore;
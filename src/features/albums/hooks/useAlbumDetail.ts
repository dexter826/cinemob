import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Album, Movie } from '@/types';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import { MESSAGES } from '@/constants/messages';
import { subscribeToAlbum, updateAlbum } from '../services/albumService';
import { filterAvailableAlbumMovies, paginateItems } from '../utils/albumSelectors';

const ITEMS_PER_PAGE = 10;

export function useAlbumDetail(albumId?: string) {
  const { user } = useAuth();
  const { movies } = useMovieStore();
  const { showToast } = useToastStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [managingMovies, setManagingMovies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!albumId || !user) return;
    setLoading(true);
    const unsubscribe = subscribeToAlbum(user.uid, albumId, data => {
      setAlbum(data);
      if (data) setName(data.name);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [albumId, user]);

  const watchedMovies = useMemo(
    () => movies.filter(movie => (movie.status || 'history') === 'history'),
    [movies],
  );

  const albumMovies = useMemo(() => {
    if (!album) return [];
    const ids = new Set(album.movieDocIds || []);
    return watchedMovies.filter(movie => movie.docId && ids.has(movie.docId));
  }, [album, watchedMovies]);

  const availableMovies = useMemo(
    () => filterAvailableAlbumMovies(watchedMovies, album?.movieDocIds || [], ''),
    [album, watchedMovies],
  );
  const filteredAvailableMovies = useMemo(
    () => filterAvailableAlbumMovies(watchedMovies, album?.movieDocIds || [], searchQuery),
    [album, searchQuery, watchedMovies],
  );
  const paginatedMovies = useMemo(
    () => paginateItems(filteredAvailableMovies, currentPage, ITEMS_PER_PAGE),
    [currentPage, filteredAvailableMovies],
  );
  const totalPages = Math.ceil(filteredAvailableMovies.length / ITEMS_PER_PAGE);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const handleSaveInfo = async (event: FormEvent) => {
    event.preventDefault();
    if (!album?.docId) return;
    if (!name.trim()) {
      showToast(MESSAGES.ALBUM.NAME_REQUIRED, 'error');
      return;
    }
    try {
      setSaving(true);
      await updateAlbum(album.docId, { name: name.trim() });
      showToast(MESSAGES.ALBUM.UPDATE_SUCCESS, 'success');
      setEditing(false);
    } catch {
      showToast(MESSAGES.ALBUM.UPDATE_ERROR, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = async (movie: Movie) => {
    if (!album?.docId || !movie.docId) return;
    if ((movie.status || 'history') !== 'history') {
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
      return;
    }
    try {
      const newIds = Array.from(new Set([...(album.movieDocIds || []), movie.docId]));
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.ADD_MOVIE_SUCCESS, 'success');
    } catch {
      showToast(MESSAGES.ALBUM.ADD_MOVIE_ERROR, 'error');
    }
  };

  const handleRemoveMovie = async (movie: Movie) => {
    if (!album?.docId || !movie.docId) return;
    try {
      const newIds = (album.movieDocIds || []).filter(id => id !== movie.docId);
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(MESSAGES.ALBUM.REMOVE_MOVIE_SUCCESS, 'info');
    } catch {
      showToast(MESSAGES.ALBUM.REMOVE_MOVIE_ERROR, 'error');
    }
  };

  return {
    album,
    loading,
    editing,
    setEditing,
    name,
    setName,
    saving,
    managingMovies,
    setManagingMovies,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    albumMovies,
    availableMovies,
    filteredAvailableMovies,
    paginatedMovies,
    totalPages,
    handleSaveInfo,
    handleAddMovie,
    handleRemoveMovie,
  };
}

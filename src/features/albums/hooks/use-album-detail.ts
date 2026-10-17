import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Album, Movie } from '@/types';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import useToastStore from '@/shared/stores/toast-store';
import { MESSAGES } from '@/constants/messages';
import {
  subscribeToAlbum,
  updateAlbum,
  addMovieToAlbum,
  removeMovieFromAlbum,
} from '../services/album-service';
import { filterAvailableAlbumMovies, paginateItems } from '../utils/album-selectors';
import { getMainTitle } from '@/features/movies/utils/movie-utils';

const ITEMS_PER_PAGE = 10;
const UNDO_REMOVE_MS = 7000;

export function useAlbumDetail(albumId?: string) {
  const { user } = useAuth();
  const { movies, loading: moviesLoading, error: moviesError } = useMovieStore();
  const { showToast } = useToastStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [loadedScope, setLoadedScope] = useState('');
  const scope = (user?.uid ?? '') + ':' + (albumId ?? '');
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const pending = useRef(new Map<string, { remove: boolean; written: boolean }>());
  const latestAlbum = useRef<Album | null>(null);
  const [pendingMovieIds, setPendingMovieIds] = useState<ReadonlySet<string>>(new Set());
  const reconcile = () => {
    for (const [id, operation] of pending.current) {
      if (
        operation.written &&
        latestAlbum.current &&
        latestAlbum.current.movieDocIds.includes(id) !== operation.remove
      )
        pending.current.delete(id);
    }
    setPendingMovieIds(new Set(pending.current.keys()));
  };
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [managingMovies, setManagingMovies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    pending.current.clear();
    setPendingMovieIds(new Set());
    latestAlbum.current = null;
    setAlbum(null);
    setError(null);
    setLoading(true);
    setLoadedScope('');
    if (!albumId || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const unsubscribe = subscribeToAlbum(
      user.uid,
      albumId,
      (data) => {
        if (cancelled) return;
        latestAlbum.current = data;
        setAlbum(data);
        setLoadedScope(scope);
        if (data) setName(data.name);
        setLoading(false);
        reconcile();
      },
      () => {
        if (cancelled) return;
        setLoadedScope(scope);
        setError('Không tải được album.');
        setLoading(false);
        pending.current.clear();
        setPendingMovieIds(new Set());
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [albumId, user?.uid, scope, retryNonce]);

  const watchedMovies = useMemo(
    () => movies.filter((movie) => (movie.status || 'history') === 'history'),
    [movies],
  );

  const albumMovies = useMemo(() => {
    if (!album) return [];
    const ids = new Set(album.movieDocIds || []);
    return watchedMovies.filter((movie) => movie.docId && ids.has(movie.docId));
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

  const changeMovie = async (movie: Movie, remove: boolean) => {
    if (
      !album?.docId ||
      !movie.docId ||
      moviesLoading ||
      moviesError ||
      error ||
      currentScope.current !== scope ||
      pending.current.has(movie.docId)
    )
      return;
    if (!remove && (movie.status || 'history') !== 'history') {
      showToast(MESSAGES.ALBUM.ONLY_WATCHED, 'error');
      return;
    }
    const id = movie.docId;
    const albumDocId = album.docId;
    const operation = { remove, written: false };
    pending.current.set(id, operation);
    reconcile();
    try {
      await (remove ? removeMovieFromAlbum(albumDocId, id) : addMovieToAlbum(albumDocId, id));
      if (currentScope.current !== scope || pending.current.get(id) !== operation) return;
      operation.written = true;
      reconcile();
      if (remove)
        showToast(`Đã bỏ "${getMainTitle(movie)}" khỏi album`, 'info', UNDO_REMOVE_MS, {
          label: 'Hoàn tác',
          onAction: () => {
            if (currentScope.current !== scope) return;
            addMovieToAlbum(albumDocId, id).catch(() =>
              showToast('Không thể hoàn tác, vui lòng thử lại', 'error'),
            );
          },
        });
      else showToast(MESSAGES.ALBUM.ADD_MOVIE_SUCCESS, 'success');
    } catch {
      if (currentScope.current !== scope || pending.current.get(id) !== operation) return;
      pending.current.delete(id);
      reconcile();
      showToast(
        remove ? MESSAGES.ALBUM.REMOVE_MOVIE_ERROR : MESSAGES.ALBUM.ADD_MOVIE_ERROR,
        'error',
      );
    }
  };
  const handleAddMovie = (movie: Movie) => changeMovie(movie, false);
  const handleRemoveMovie = (movie: Movie) => changeMovie(movie, true);

  return {
    album: loadedScope === scope ? album : null,
    loading: loading || (loadedScope !== scope && !error),
    error,
    retry: () => setRetryNonce((n) => n + 1),
    moviesLoading,
    moviesError,
    pendingMovieIds,
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

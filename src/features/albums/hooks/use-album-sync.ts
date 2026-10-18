import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { addAlbum, syncMovieAlbums } from '../services/album-service';
import useAlbumStore from '../stores/album-store';
import { Movie } from '@/types';
import { MESSAGES } from '@/constants/messages';

interface AlbumSyncProps {
  user: User | null;
  movieToEdit?: Movie;
  isOpen: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useAlbumSync = ({ user, movieToEdit, isOpen, showToast }: AlbumSyncProps) => {
  const { albums, loading, error, activeUid, retry } = useAlbumStore();
  const uid = user?.uid;
  const scope = `${uid ?? ''}:${movieToEdit?.docId ?? 'new'}`;
  const [selectionScope, setSelectionScope] = useState<string | null>(null);
  const sourceReady = !!uid && activeUid === uid && !loading && !error;
  const ready = sourceReady && selectionScope === scope;
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setShowCreateAlbum(false);
      setNewAlbumName('');
      syncedRef.current = null;
      setSelectionScope(null);
      return;
    }
    if (!sourceReady || syncedRef.current === scope) return;
    syncedRef.current = scope;
    setSelectionScope(scope);

    const movieDocId = movieToEdit?.docId;
    if (!movieDocId) {
      setSelectedAlbumIds([]);
      return;
    }
    setSelectedAlbumIds(
      albums
        .filter((album) => album.movieDocIds?.includes(movieDocId))
        .map((album) => album.docId || ''),
    );
  }, [isOpen, movieToEdit, albums, sourceReady, scope]);

  const creatingRef = useRef(false);
  // Ref-guard chống double-submit trong cùng một tick render.
  const handleCreateAlbum = async () => {
    if (!ready || creatingRef.current || !newAlbumName.trim() || !user) return;
    creatingRef.current = true;
    try {
      setCreatingAlbum(true);
      const newAlbumId = await addAlbum({
        uid: user.uid,
        name: newAlbumName.trim(),
        movieDocIds: [],
      });
      showToast(MESSAGES.ALBUM.CREATE_SUCCESS(newAlbumName), 'success');
      setSelectedAlbumIds((prev) => [...prev, newAlbumId]);
      setNewAlbumName('');
      setShowCreateAlbum(false);
    } catch (error) {
      showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
    } finally {
      creatingRef.current = false;
      setCreatingAlbum(false);
    }
  };

  const syncAlbums = async (movieDocId: string) => {
    const source = useAlbumStore.getState();
    if (!ready || source.loading || source.error || source.activeUid !== uid)
      throw new Error('Album data is not ready');
    const previousAlbumIds = source.albums
      .filter((album) => album.movieDocIds?.includes(movieDocId))
      .map((album) => album.docId)
      .filter((id): id is string => Boolean(id));

    await syncMovieAlbums(movieDocId, previousAlbumIds, selectedAlbumIds);
  };

  return {
    ready,
    loading: loading || (!selectionScope && !error),
    error,
    retry,
    selectedAlbumIds,
    setSelectedAlbumIds,
    showCreateAlbum,
    setShowCreateAlbum,
    newAlbumName,
    setNewAlbumName,
    creatingAlbum,
    handleCreateAlbum,
    syncAlbums,
    albums,
  };
};

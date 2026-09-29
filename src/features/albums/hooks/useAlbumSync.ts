import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { addAlbum, syncMovieAlbums } from '../services/albumService';
import useAlbumStore from '../stores/albumStore';
import { Movie } from '@/types';
import { MESSAGES } from '@/constants/messages';

interface AlbumSyncProps {
  user: User | null;
  movieToEdit?: Movie;
  isOpen: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
}

// Quản lý việc thêm phim vào Album.
export const useAlbumSync = ({ user, movieToEdit, isOpen, showToast }: AlbumSyncProps) => {
  const { albums } = useAlbumStore();
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setShowCreateAlbum(false);
      setNewAlbumName('');
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;

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
  }, [isOpen, movieToEdit, albums]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !user) return;
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
      setCreatingAlbum(false);
    }
  };

  const syncAlbums = async (movieDocId: string) => {
    const previousAlbumIds = albums
      .filter((album) => album.movieDocIds?.includes(movieDocId))
      .map((album) => album.docId)
      .filter((id): id is string => Boolean(id));

    await syncMovieAlbums(movieDocId, previousAlbumIds, selectedAlbumIds);
  };

  return {
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

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { addAlbum, updateAlbum } from '../services/albumService';
import useAlbumStore from '../stores/albumStore';
import { Movie } from '../types';
import { MESSAGES } from '../constants/messages';

interface AlbumSyncProps {
    user: User | null;
    movieToEdit?: Movie;
    isOpen: boolean;
    showToast: (message: string, type: 'success' | 'error') => void;
}

/** Hook quản lý việc thêm phim vào các Album/Bộ sưu tập. */
export const useAlbumSync = ({ user, movieToEdit, isOpen, showToast }: AlbumSyncProps) => {
    const { albums } = useAlbumStore();
    const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
    const [showCreateAlbum, setShowCreateAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState('');
    const [creatingAlbum, setCreatingAlbum] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowCreateAlbum(false);
            setNewAlbumName('');
            return;
        }

        if (movieToEdit && albums.length > 0) {
            const movieDocId = movieToEdit.docId;
            if (movieDocId) {
                const albumsContainingMovie = albums
                    .filter(album => album.movieDocIds?.includes(movieDocId))
                    .map(album => album.docId || '');
                setSelectedAlbumIds(albumsContainingMovie);
            }
        } else if (!movieToEdit) {
            setSelectedAlbumIds([]);
        }
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
            setSelectedAlbumIds(prev => [...prev, newAlbumId]);
            setNewAlbumName('');
            setShowCreateAlbum(false);
        } catch (error) {
            showToast(MESSAGES.ALBUM.CREATE_ERROR, 'error');
        } finally {
            setCreatingAlbum(false);
        }
    };

    const syncAlbums = async (movieDocId: string) => {
        const previousAlbums = albums.filter(album => album.movieDocIds?.includes(movieDocId));
        
        // Remove from albums not selected anymore
        for (const album of previousAlbums) {
            if (album.docId && !selectedAlbumIds.includes(album.docId)) {
                await updateAlbum(album.docId, { 
                    movieDocIds: album.movieDocIds?.filter(id => id !== movieDocId) 
                });
            }
        }
        
        // Add to newly selected albums
        for (const albumId of selectedAlbumIds) {
            const album = albums.find(a => a.docId === albumId);
            if (album && album.docId && !album.movieDocIds?.includes(movieDocId)) {
                await updateAlbum(album.docId, { 
                    movieDocIds: [...(album.movieDocIds || []), movieDocId] 
                });
            }
        }
    };

    return {
        selectedAlbumIds, setSelectedAlbumIds,
        showCreateAlbum, setShowCreateAlbum,
        newAlbumName, setNewAlbumName,
        creatingAlbum,
        handleCreateAlbum,
        syncAlbums,
        albums
    };
};

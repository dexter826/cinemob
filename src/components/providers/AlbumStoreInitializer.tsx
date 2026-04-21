import React, { useEffect, useRef } from 'react';
import { Album, Movie } from '../../types';
import { subscribeToAlbums } from '../../services/albumService';
import { useAuth } from './AuthProvider';
import useAlbumStore from '../../stores/albumStore';
import useMovieStore from '../../stores/movieStore';

const AlbumStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const { albums, loading, setAlbums, setLoading, setAlbumCoverMovies } = useAlbumStore();
  const { movies: allMovies, initialized: moviesInitialized } = useMovieStore();

  const coverMovieIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      setAlbums([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAlbums(user.uid, (data: Album[]) => {
      setAlbums(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, setAlbums, setLoading]);

  useEffect(() => {
    if (loading || !moviesInitialized) return;

    const updates: Record<string, Movie | null> = {};
    let hasUpdates = false;

    albums.forEach(album => {
      const albumId = album.docId;
      if (!albumId) return;

      if (!album.movieDocIds || album.movieDocIds.length === 0) {
        updates[albumId] = null;
        hasUpdates = true;
        return;
      }

      let selectedMovieId = coverMovieIdsRef.current[albumId];

      if (!selectedMovieId || !album.movieDocIds.includes(selectedMovieId)) {
        const randomIndex = Math.floor(Math.random() * album.movieDocIds.length);
        selectedMovieId = album.movieDocIds[randomIndex];
        coverMovieIdsRef.current[albumId] = selectedMovieId;
      }

      const movieData = allMovies.find(m => m.docId === selectedMovieId);
      if (movieData) {
        updates[albumId] = movieData;
        hasUpdates = true;
      } else {
        updates[albumId] = null;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setAlbumCoverMovies(updates);
    }
  }, [albums, loading, moviesInitialized, allMovies, setAlbumCoverMovies]);

  return null;
};

export default AlbumStoreInitializer;
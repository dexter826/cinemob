import { useEffect, useRef } from 'react';
import { Album, Movie } from '../../types';
import { subscribeToAlbums } from '../../services/albumService';
import { useAuth } from './AuthProvider';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import useAlbumStore from '../../stores/albumStore';

const AlbumStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const { albums, loading, setAlbums, setLoading, setAlbumCoverMovies } = useAlbumStore();

  // Store the selected cover movie ID for each album to keep it stable during the session
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

  // Logic to pick random covers and fetch their data
  useEffect(() => {
    const loadAlbumCovers = async () => {
      if (loading) return;

      const db = getFirestore();
      const moviesCol = collection(db, 'movies');
      const updates: Record<string, Movie | null> = {};
      let hasUpdates = false;

      // Determine which cover ID to use for each album
      const newCoverIds: Record<string, string> = {};

      albums.forEach(album => {
        if (!album.docId || !album.movieDocIds || album.movieDocIds.length === 0) {
          // No movies, no cover
          if (albums.find(a => a.docId === album.docId)?.movieDocIds?.length === 0) {
            updates[album.docId] = null;
            hasUpdates = true;
          }
          return;
        }

        const albumId = album.docId;
        let selectedMovieId = coverMovieIdsRef.current[albumId];

        // If no cover selected yet, or the selected cover is no longer in the album
        if (!selectedMovieId || !album.movieDocIds.includes(selectedMovieId)) {
          // Pick a random movie from the album
          const randomIndex = Math.floor(Math.random() * album.movieDocIds.length);
          selectedMovieId = album.movieDocIds[randomIndex];
          coverMovieIdsRef.current[albumId] = selectedMovieId;
        }

        newCoverIds[albumId] = selectedMovieId;
      });

      // Fetch movie data for the selected covers if not already loaded or if changed
      await Promise.all(
        Object.entries(newCoverIds).map(async ([albumId, movieId]) => {
          const currentCover = albums.find(a => a.docId === albumId)?.movieDocIds?.includes(movieId) ? null : null; // Simplified check
          // For now, always fetch if not cached
          try {
            const movieRef = doc(moviesCol, movieId);
            const snapshot = await getDoc(movieRef);
            if (snapshot.exists()) {
              const data = snapshot.data() as any;
              updates[albumId] = {
                docId: snapshot.id,
                uid: data.uid,
                id: data.id,
                title: data.title,
                poster_path: data.poster_path,
                runtime: data.runtime,
                seasons: data.seasons || 0,
                watched_at: data.watched_at,
                source: data.source,
                media_type: data.media_type || 'movie',
                status: data.status || 'history',
                rating: data.rating || 0,
                review: data.review || '',
                tagline: data.tagline || '',
                genres: data.genres || '',
                release_date: data.release_date || '',
                country: data.country || '',
                content: data.content || '',
              } as Movie;
              hasUpdates = true;
            } else {
              updates[albumId] = null;
              hasUpdates = true;
            }
          } catch (error) {
            console.error(`Error loading cover for album ${albumId}:`, error);
            updates[albumId] = null;
            hasUpdates = true;
          }
        })
      );

      if (hasUpdates) {
        setAlbumCoverMovies(updates);
      }
    };

    loadAlbumCovers();
  }, [albums, loading, setAlbumCoverMovies]);

  return null; // This component doesn't render anything
};

export default AlbumStoreInitializer;
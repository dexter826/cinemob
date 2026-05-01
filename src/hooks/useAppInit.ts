import { useEffect, useRef } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import useMovieStore from '../stores/movieStore';
import useInitialLoadStore from '../stores/initialLoadStore';
import useAlbumStore from '../stores/albumStore';
import useRecommendationsStore from '../stores/recommendationsStore';
import useReleaseCalendarStore from '../stores/releaseCalendarStore';
import { subscribeToAlbums } from '../services/albumService';
import { Album, Movie } from '../types';

// Khởi tạo ứng dụng sau khi đăng nhập.
export const useAppInit = () => {
  const { user } = useAuth();
  
  const { initialize: initMovies, cleanup: cleanupMovies, initialized: moviesInitialized, movies: allMovies, loading: moviesLoading } = useMovieStore();
  const { markInitialLoadComplete } = useInitialLoadStore();

  const { albums, loading: albumsLoading, setAlbums, setLoading: setAlbumsLoading, setAlbumCoverMovies } = useAlbumStore();
  const coverMovieIdsRef = useRef<Record<string, string>>({});

  const {
    setAiRecommendations,
    setTrendingMovies,
    setHistoryMovies,
    initializeForUser: initRecs,
    refreshRecommendations,
    historyMovies
  } = useRecommendationsStore();

  const {
    setMovies: setCalendarMovies,
    setLoading: setCalendarLoading,
    setHasFetchedInitial: setCalFetchedInitial,
    fetchUpcomingEpisodes,
    hasFetchedInitial: calFetchedInitial,
  } = useReleaseCalendarStore();

  useEffect(() => {
    if (user) {
      initMovies(user.uid);
    } else {
      cleanupMovies();
    }
  }, [user, initMovies, cleanupMovies]);

  useEffect(() => {
    if (moviesInitialized) {
      markInitialLoadComplete();
    }
  }, [moviesInitialized, markInitialLoadComplete]);

  useEffect(() => {
    if (!user) {
      setAlbums([]);
      setAlbumsLoading(false);
      return;
    }

    const unsubscribe = subscribeToAlbums(user.uid, (data: Album[]) => {
      setAlbums(data);
      setAlbumsLoading(false);
    });

    return () => unsubscribe();
  }, [user, setAlbums, setAlbumsLoading]);

  useEffect(() => {
    if (albumsLoading || !moviesInitialized) return;

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
  }, [albums, albumsLoading, moviesInitialized, allMovies, setAlbumCoverMovies]);

  useEffect(() => {
    if (!user) {
      setAiRecommendations([]);
      setTrendingMovies([]);
      setHistoryMovies([]);
      return;
    }

    initRecs(user.uid);
    setHistoryMovies(allMovies);
  }, [user, allMovies, setAiRecommendations, setTrendingMovies, setHistoryMovies, initRecs]);

  useEffect(() => {
    setCalendarMovies(allMovies);
    setCalendarLoading(moviesLoading);
  }, [allMovies, moviesLoading, setCalendarMovies, setCalendarLoading]);

  useEffect(() => {
    if (user && !calFetchedInitial && allMovies.length > 0) {
      fetchUpcomingEpisodes(user.uid, allMovies);
      setCalFetchedInitial(true);
    }
  }, [user, calFetchedInitial, allMovies, fetchUpcomingEpisodes, setCalFetchedInitial]);
};

import { useEffect, useRef } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useInitialLoadStore from '@/shared/stores/initialLoadStore';
import useToastStore from '@/shared/stores/toastStore';
import useAlbumStore from '@/features/albums/stores/albumStore';
import useRecommendationsStore from '@/features/movies/stores/recommendationsStore';
import useReleaseCalendarStore from '@/features/calendar/stores/releaseCalendarStore';
import { subscribeToAlbums } from '@/features/albums/services/albumService';
import { syncPublicShareIfEnabled } from '@/features/share/services/shareService';
import { Album, Movie } from '@/types';

// Khởi tạo ứng dụng sau khi đăng nhập.
export const useAppInit = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  
  const { initialize: initMovies, cleanup: cleanupMovies, initialized: moviesInitialized, movies: allMovies, loading: moviesLoading } = useMovieStore();
  const { markInitialLoadComplete } = useInitialLoadStore();
  const { showToast } = useToastStore();

  const { albums, loading: albumsLoading, setAlbums, setLoading: setAlbumsLoading, setAlbumCoverMovies } = useAlbumStore();
  const coverMovieIdsRef = useRef<Record<string, string>>({});

  const {
    setHistoryMovies,
    reset: resetRecommendations,
    initializeForUser: initRecs,
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
    if (!userId) {
      resetRecommendations();
      return;
    }

    void initRecs(userId);
  }, [userId, initRecs, resetRecommendations]);

  useEffect(() => {
    if (!userId) return;
    const prevIds = historyMovies.map(m => m.docId ?? m.id).join('|');
    const nextIds = allMovies.map(m => m.docId ?? m.id).join('|');
    if (prevIds !== nextIds) setHistoryMovies(allMovies);
  }, [userId, allMovies, historyMovies, setHistoryMovies]);

  useEffect(() => {
    setCalendarMovies(allMovies);
    setCalendarLoading(moviesLoading);
  }, [allMovies, moviesLoading, setCalendarMovies, setCalendarLoading]);

  useEffect(() => {
    if (!user || moviesLoading || !moviesInitialized) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void syncPublicShareIfEnabled(
        user.uid,
        { displayName: user.displayName || 'CineMOB User', photoURL: user.photoURL || '' },
        allMovies,
      ).catch((error) => {
        if (cancelled) return;
        console.error('Public share sync error:', error);
        showToast('Không thể tự cập nhật danh sách chia sẻ', 'error');
      });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [allMovies, moviesInitialized, moviesLoading, showToast, user]);

  const movieCount = allMovies.length;

  useEffect(() => {
    if (!user || movieCount === 0) return;
    fetchUpcomingEpisodes(user.uid, allMovies);
    if (!calFetchedInitial) setCalFetchedInitial(true);
  }, [user, movieCount, allMovies, calFetchedInitial, fetchUpcomingEpisodes, setCalFetchedInitial]);
};

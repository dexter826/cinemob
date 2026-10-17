import { useEffect } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import useInitialLoadStore from '@/shared/stores/initial-load-store';
import useToastStore from '@/shared/stores/toast-store';
import useAlbumStore from '@/features/albums/stores/album-store';
import useRecommendationsStore from '@/features/movies/stores/recommendations-store';
import useReleaseCalendarStore from '@/features/calendar/stores/release-calendar-store';
import { syncMemberProfile } from '@/features/profile/services/member-profile-service';
import { clearPublicProfileCache } from '@/features/profile/hooks/use-user-search';
import { Movie } from '@/types';

// Khởi tạo ứng dụng sau khi đăng nhập.
export const useAppInit = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  const {
    initialize: initMovies,
    cleanup: cleanupMovies,
    initialized: moviesInitialized,
    movies: allMovies,
    loading: moviesLoading,
  } = useMovieStore();
  const { markInitialLoadComplete } = useInitialLoadStore();
  const { showToast } = useToastStore();

  const {
    albums,
    loading: albumsLoading,
    initialize: initAlbums,
    cleanup: cleanupAlbums,
    setAlbumCoverMovies,
  } = useAlbumStore();

  const { reset: resetRecommendations, setActiveUser } = useRecommendationsStore();

  const { setMovies: setCalendarMovies, setLoading: setCalendarLoading } =
    useReleaseCalendarStore();

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
    if (userId) initAlbums(userId);
    else cleanupAlbums();
    return cleanupAlbums;
  }, [userId, initAlbums, cleanupAlbums]);

  useEffect(() => {
    if (albumsLoading || !moviesInitialized) return;

    const updates: Record<string, Movie[]> = {};
    let hasUpdates = false;

    albums.forEach((album) => {
      const albumId = album.docId;
      if (!albumId) return;

      // Bìa album = tối đa 3 phim đầu tiên theo thứ tự trong album.
      const covers = (album.movieDocIds || [])
        .map((docId) => allMovies.find((m) => m.docId === docId))
        .filter((movie): movie is Movie => movie !== undefined)
        .slice(0, 3);

      updates[albumId] = covers;
      hasUpdates = true;
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

    setActiveUser(userId);
  }, [userId, setActiveUser, resetRecommendations]);

  useEffect(() => {
    const currentMovies = useMovieStore.getState();
    setCalendarMovies(currentMovies.movies);
    setCalendarLoading(currentMovies.loading);
  }, [allMovies, moviesLoading, setCalendarMovies, setCalendarLoading]);

  useEffect(() => {
    if (!user || moviesLoading || !moviesInitialized) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void syncMemberProfile(
        user.uid,
        {
          displayName: user.displayName || 'CineMOB User',
          photoURL: user.photoURL || '',
          email: user.email || '',
        },
        allMovies,
      )
        .then((changed) => {
          if (changed) clearPublicProfileCache();
        })
        .catch((error) => {
          if (cancelled) return;
          console.error('Member profile sync error:', error);
          showToast('Không thể tự cập nhật hồ sơ thành viên', 'error');
        });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [allMovies, moviesInitialized, moviesLoading, showToast, user]);
};

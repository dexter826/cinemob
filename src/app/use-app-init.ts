import { useEffect } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import useToastStore from '@/shared/stores/toast-store';
import useAlbumStore from '@/features/albums/stores/album-store';
import useReleaseCalendarStore from '@/features/calendar/stores/release-calendar-store';
import {
  clearMemberProfileCache,
  syncMemberProfile,
} from '@/features/profile/services/member-profile-service';
import { FALLBACK_DISPLAY_NAME } from '@/features/profile/services/profile-service';
import { Movie } from '@/types';

export const useAppInit = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  const initMovies = useMovieStore((state) => state.initialize);
  const cleanupMovies = useMovieStore((state) => state.cleanup);
  const moviesInitialized = useMovieStore((state) => state.initialized);
  const allMovies = useMovieStore((state) => state.movies);
  const moviesLoading = useMovieStore((state) => state.loading);
  const showToast = useToastStore((state) => state.showToast);

  const albums = useAlbumStore((state) => state.albums);
  const albumsLoading = useAlbumStore((state) => state.loading);
  const initAlbums = useAlbumStore((state) => state.initialize);
  const cleanupAlbums = useAlbumStore((state) => state.cleanup);
  const setAlbumCoverMovies = useAlbumStore((state) => state.setAlbumCoverMovies);

  const setCalendarMovies = useReleaseCalendarStore((state) => state.setMovies);
  const setCalendarLoading = useReleaseCalendarStore((state) => state.setLoading);

  useEffect(() => {
    if (userId) {
      initMovies(userId);
    } else {
      cleanupMovies();
    }
  }, [userId, initMovies, cleanupMovies]);

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
        .filter((movie) => (movie.status || 'history') === 'history')
        .slice(0, 3);

      updates[albumId] = covers;
      hasUpdates = true;
    });

    if (hasUpdates) {
      setAlbumCoverMovies(updates);
    }
  }, [albums, albumsLoading, moviesInitialized, allMovies, setAlbumCoverMovies]);

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
          displayName: user.displayName || FALLBACK_DISPLAY_NAME,
          photoURL: user.photoURL || '',
          email: user.email || '',
        },
        allMovies,
      )
        .then((changed) => {
          if (changed) clearMemberProfileCache(user.uid);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error('Member profile sync error:', error);
          showToast('Không cập nhật được hồ sơ thành viên. Thử lại.', 'error');
        });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [allMovies, moviesInitialized, moviesLoading, showToast, user]);
};

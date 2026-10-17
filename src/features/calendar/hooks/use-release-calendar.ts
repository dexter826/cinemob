import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieDetailStore from '@/features/movies/stores/movie-detail-store';
import useMovieStore from '@/features/movies/stores/movie-store';
import useReleaseCalendarStore from '../stores/release-calendar-store';
import useAlertStore from '@/shared/stores/alert-store';
import useToastStore from '@/shared/stores/toast-store';
import {
  isPushUsable,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
} from '../services/push-notification-service';
import { UpcomingEpisode } from '@/types';

const formatDateParam = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const parseDateParam = (value: string | null): Date | null => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  // Chặn rollover kiểu 2026-02-30 lăn sang tháng sau.
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : null;
};

// Quản lý lịch phát sóng và thông báo đẩy.
export const useReleaseCalendar = () => {
  const { user } = useAuth();
  const userId = user?.uid;
  const { openDetailModal } = useMovieDetailStore();
  const {
    movies,
    monthEpisodes: storedEpisodes,
    monthKey: loadedMonthKey,
    userId: loadedUserId,
    loading,
    loadingEpisodes: fetchingEpisodes,
    episodesError: storedError,
    fetchMonthEpisodes,
    cancelMonthRequest,
    initializeForUser,
  } = useReleaseCalendarStore();
  const { showAlert } = useAlertStore();
  const { showToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const monthParam = searchParams.get('month');
  const dateParam = searchParams.get('date');
  const currentDate = useMemo(
    () => parseDateParam(monthParam ? `${monthParam}-01` : null) ?? new Date(),
    [monthParam],
  );
  const monthKey = formatDateParam(currentDate).slice(0, 7);
  const selectedDate = useMemo(() => {
    const date = parseDateParam(dateParam);
    return date && formatDateParam(date).startsWith(monthKey) ? date : null;
  }, [dateParam, monthKey]);
  const matchesScope = loadedMonthKey === monthKey && loadedUserId === userId;
  const monthEpisodes = useMemo(
    () => (matchesScope ? storedEpisodes : []),
    [matchesScope, storedEpisodes],
  );
  const loadingEpisodes = fetchingEpisodes || (!loading && !!userId && !matchesScope);
  const episodesError = matchesScope ? storedError : null;

  useEffect(() => {
    initializeForUser(userId ?? '');
    if (!userId || loading) return;
    const movieState = useMovieStore.getState();
    if (movieState.activeUid !== userId || movieState.loading) return;
    void fetchMonthEpisodes(userId, movies, monthKey);
    return cancelMonthRequest;
  }, [
    userId,
    loading,
    movies,
    monthKey,
    fetchMonthEpisodes,
    cancelMonthRequest,
    initializeForUser,
  ]);

  const retryEpisodes = () => {
    if (userId) void fetchMonthEpisodes(userId, movies, monthKey);
  };

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    const checkPushStatus = async () => {
      const usable = isPushUsable();
      setPushSupported(usable);

      if (usable) {
        setNotificationPermission(getNotificationPermission());
        const subscribed = await isSubscribedToPush();
        setPushSubscribed(subscribed);
      }
    };
    checkPushStatus();
  }, []);

  const handlePushToggle = async () => {
    if (!pushSupported) {
      showAlert({
        title: 'Thông báo',
        message:
          'Tính năng thông báo đẩy chỉ khả dụng trên mobile khi ứng dụng được cài đặt dưới dạng PWA (Thêm vào Màn hình chính)',
        type: 'info',
        onConfirm: () => {},
      });
      return;
    }

    setPushLoading(true);
    try {
      if (pushSubscribed) {
        await unsubscribeFromPushNotifications();
        setPushSubscribed(false);
        showToast('Đã tắt thông báo', 'success');
      } else {
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          setPushSubscribed(true);
          showToast(
            'Đã bật thông báo! Bạn sẽ nhận được thông báo mỗi sáng 8:00 khi có tập phim mới.',
            'success',
          );
        }
      }
      setNotificationPermission(getNotificationPermission());
    } catch (error) {
      console.error('Push notification error:', error);
      let errorMessage = 'Có lỗi xảy ra khi thiết lập thông báo';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setPushLoading(false);
    }
  };

  const tvSeries = useMemo(() => {
    return movies.filter((m) => m.media_type === 'tv' && m.source === 'tmdb');
  }, [movies]);

  const mutateParams = useCallback(
    (mutate: (params: URLSearchParams) => void, options?: { replace?: boolean }) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.delete('view');
        mutate(params);
        return params;
      }, options);
    },
    [setSearchParams],
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const projected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (direction === 'prev' ? -1 : 1),
      1,
    );
    mutateParams((params) => {
      params.set(
        'month',
        `${projected.getFullYear()}-${String(projected.getMonth() + 1).padStart(2, '0')}`,
      );
      params.delete('date');
    });
  };

  const goToToday = () => {
    const today = new Date();
    mutateParams((params) => {
      params.set('month', formatDateParam(today).slice(0, 7));
      params.set('date', formatDateParam(today));
    });
  };

  const setSelectedDate = (date: Date | null) => {
    mutateParams((params) => {
      if (date) params.set('date', formatDateParam(date));
      else params.delete('date');
    });
  };

  const getEpisodesForDate = useCallback(
    (date: Date) => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return monthEpisodes.filter((ep) => ep.episode.air_date === dateStr);
    },
    [monthEpisodes],
  );

  const displayedEpisodes = useMemo(() => {
    if (selectedDate) {
      return getEpisodesForDate(selectedDate);
    }

    return monthEpisodes;
  }, [selectedDate, monthEpisodes, getEpisodesForDate]);

  const episodesByDate = useMemo(() => {
    const grouped: { [key: string]: UpcomingEpisode[] } = {};
    displayedEpisodes.forEach((ep) => {
      if (!grouped[ep.episode.air_date]) {
        grouped[ep.episode.air_date] = [];
      }
      grouped[ep.episode.air_date].push(ep);
    });
    return grouped;
  }, [displayedEpisodes]);

  const handleSeriesClick = (episode: UpcomingEpisode) => {
    const movie = movies.find((m) => Number(m.id) === episode.seriesId);
    if (movie) {
      openDetailModal(movie);
    }
  };

  return {
    movies,
    monthEpisodes,
    loading,
    loadingEpisodes,
    episodesError,
    retryEpisodes,
    tvSeries,
    currentDate,
    selectedDate,
    setSelectedDate,
    pushSupported,
    pushSubscribed,
    pushLoading,
    notificationPermission,
    handlePushToggle,
    navigateMonth,
    goToToday,
    getEpisodesForDate,
    displayedEpisodes,
    episodesByDate,
    handleSeriesClick,
  };
};

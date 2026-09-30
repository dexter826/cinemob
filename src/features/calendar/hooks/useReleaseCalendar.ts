import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import useReleaseCalendarStore from '../stores/releaseCalendarStore';
import useAlertStore from '@/shared/stores/alertStore';
import useToastStore from '@/shared/stores/toastStore';
import {
  isPushUsable,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
} from '../services/pushNotificationService';
import { UpcomingEpisode } from '@/types';

const formatDateParam = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const parseDateParam = (value: string | null): Date | null => {
  if (!value) return null;
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
  const { openDetailModal } = useMovieDetailStore();
  const { movies, upcomingEpisodes, loading, loadingEpisodes } = useReleaseCalendarStore();
  const { showAlert } = useAlertStore();
  const { showToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo từ URL để chia sẻ được đúng tháng, ngày và chế độ xem.
  const [currentDate, setCurrentDate] = useState<Date>(
    () =>
      parseDateParam(searchParams.get('month') ? `${searchParams.get('month')}-01` : null) ??
      new Date(),
  );
  const [selectedDate, setSelectedDateState] = useState<Date | null>(() =>
    parseDateParam(searchParams.get('date')),
  );
  const [viewMode, setViewModeState] = useState<'calendar' | 'list'>(() =>
    searchParams.get('view') === 'list' ? 'list' : 'calendar',
  );

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
        mutate(params);
        return params;
      }, options);
    },
    [setSearchParams],
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const projected = new Date(currentDate);
    projected.setMonth(projected.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
    mutateParams((params) => {
      params.set(
        'month',
        `${projected.getFullYear()}-${String(projected.getMonth() + 1).padStart(2, '0')}`,
      );
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateState(today);
    mutateParams((params) => {
      params.delete('month');
      params.set('date', formatDateParam(today));
    });
  };

  const setSelectedDate = (date: Date | null) => {
    setSelectedDateState(date);
    mutateParams((params) => {
      if (date) params.set('date', formatDateParam(date));
      else params.delete('date');
    });
  };

  const setViewMode = (mode: 'calendar' | 'list') => {
    setViewModeState(mode);
    mutateParams((params) => {
      if (mode === 'list') params.set('view', mode);
      else params.delete('view');
    });
  };

  const getEpisodesForDate = useCallback(
    (date: Date) => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return upcomingEpisodes.filter((ep) => ep.episode.air_date === dateStr);
    },
    [upcomingEpisodes],
  );

  const displayedEpisodes = useMemo(() => {
    if (selectedDate) {
      return getEpisodesForDate(selectedDate);
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    return upcomingEpisodes.filter((ep) => {
      const airDate = new Date(ep.episode.air_date);
      return airDate >= now && airDate <= thirtyDaysLater;
    });
  }, [selectedDate, upcomingEpisodes, getEpisodesForDate]);

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
    upcomingEpisodes,
    loading,
    loadingEpisodes,
    tvSeries,
    currentDate,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
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

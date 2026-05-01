import { useState, useEffect, useMemo } from 'react';
import useMovieDetailStore from '../stores/movieDetailStore';
import useReleaseCalendarStore from '../stores/releaseCalendarStore';
import useAlertStore from '../stores/alertStore';
import useToastStore from '../stores/toastStore';
import {
  isPushUsable,
  getNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush
} from '../services/pushNotificationService';
import { UpcomingEpisode } from '../types';

// Quản lý lịch phát sóng và thông báo đẩy.
export const useReleaseCalendar = () => {
  const { openDetailModal } = useMovieDetailStore();
  const {
    movies,
    upcomingEpisodes,
    loading,
    loadingEpisodes
  } = useReleaseCalendarStore();
  const { showAlert } = useAlertStore();
  const { showToast } = useToastStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

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
        message: 'Tính năng thông báo đẩy chỉ khả dụng trên mobile khi ứng dụng được cài đặt dưới dạng PWA (Thêm vào Màn hình chính)',
        type: 'info',
        onConfirm: () => {}
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
          showToast('Đã bật thông báo! Bạn sẽ nhận được thông báo mỗi sáng 8:00 khi có tập phim mới.', 'success');
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
    return movies.filter(m => m.media_type === 'tv' && m.source === 'tmdb');
  }, [movies]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEpisodesForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return upcomingEpisodes.filter(ep => ep.episode.air_date === dateStr);
  };

  const displayedEpisodes = useMemo(() => {
    if (selectedDate) {
      return getEpisodesForDate(selectedDate);
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    return upcomingEpisodes.filter(ep => {
      const airDate = new Date(ep.episode.air_date);
      return airDate >= now && airDate <= thirtyDaysLater;
    });
  }, [selectedDate, upcomingEpisodes]);

  const episodesByDate = useMemo(() => {
    const grouped: { [key: string]: UpcomingEpisode[] } = {};
    displayedEpisodes.forEach(ep => {
      if (!grouped[ep.episode.air_date]) {
        grouped[ep.episode.air_date] = [];
      }
      grouped[ep.episode.air_date].push(ep);
    });
    return grouped;
  }, [displayedEpisodes]);

  const handleSeriesClick = (episode: UpcomingEpisode) => {
    const movie = movies.find(m => Number(m.id) === episode.seriesId);
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
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
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
    handleSeriesClick
  };
};

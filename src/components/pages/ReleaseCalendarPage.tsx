import React, { useState, useMemo } from 'react';
import { getTVShowNextEpisode, getTVShowUpcomingEpisodes, getMovieDetailsWithLanguage } from '../../services/tmdbService';
import { Movie, UpcomingEpisode, TMDBEpisode } from '../../types';
import { Calendar, ChevronLeft, ChevronRight, Tv, Clock, Film, CalendarDays, Bell, Info } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Loading from '../ui/Loading';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';
import useMovieDetailStore from '../../stores/movieDetailStore';
import useReleaseCalendarStore from '../../stores/releaseCalendarStore';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const ReleaseCalendarPage: React.FC = () => {
  const { openDetailModal } = useMovieDetailStore();
  const {
    movies,
    upcomingEpisodes,
    loading,
    loadingEpisodes
  } = useReleaseCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Get all TV series from user's collection (history + watchlist)
  const tvSeries = useMemo(() => {
    return movies.filter(m =>
      m.media_type === 'tv' &&
      m.source === 'tmdb'
    );
  }, [movies]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

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

  // Get episodes for a specific date
  const getEpisodesForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return upcomingEpisodes.filter(ep => ep.episode.air_date === dateStr);
  };

  // Get episodes for selected date or all upcoming
  const displayedEpisodes = useMemo(() => {
    if (selectedDate) {
      return getEpisodesForDate(selectedDate);
    }
    return upcomingEpisodes;
  }, [selectedDate, upcomingEpisodes]);

  // Check if a date has episodes
  const hasEpisodes = (date: Date) => {
    return getEpisodesForDate(date).length > 0;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group episodes by date for list view
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

  // Handle click on series card to open detail modal
  const handleSeriesClick = (episode: UpcomingEpisode) => {
    const movie = movies.find(m => Number(m.id) === episode.seriesId);
    if (movie) {
      openDetailModal(movie);
    }
  };

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 md:h-24"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const episodes = getEpisodesForDate(date);
      const hasEp = episodes.length > 0;
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            h-12 md:h-24 p-1 border border-black/5 dark:border-white/5 cursor-pointer transition-all
            hover:bg-primary/10 relative
            ${today ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
            ${selected ? 'bg-primary/20' : ''}
            ${hasEp ? 'font-semibold' : ''}
          `}
        >
          <div className={`text-xs md:text-sm ${today ? 'text-primary font-bold' : ''}`}>
            {day}
          </div>
          {hasEp && (
            <div className="hidden md:block mt-1 space-y-0.5 overflow-hidden max-h-16">
              {episodes.slice(0, 2).map((ep, idx) => (
                <div 
                  key={idx} 
                  className="text-[10px] bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                  title={`${ep.seriesNameVi || ep.seriesName} - S${ep.episode.season_number}E${ep.episode.episode_number}`}
                >
                  {ep.seriesNameVi || ep.seriesName}
                </div>
              ))}
              {episodes.length > 2 && (
                <div className="text-[10px] text-text-secondary">+{episodes.length - 2} khác</div>
              )}
            </div>
          )}
          {hasEp && (
            <div className="md:hidden absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5">
                {episodes.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loading />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main flex items-center gap-2">
                <CalendarDays className="text-primary" size={28} />
                Lịch phát sóng
              </h1>
              <p className="text-text-secondary mt-1">
                Theo dõi các tập mới của series bạn đang xem
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'calendar' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface border border-black/5 dark:border-white/5 text-text-main hover:bg-primary/10'
                }`}
              >
                <Calendar size={18} />
                <span className="hidden md:inline">Lịch</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface border border-black/5 dark:border-white/5 text-text-main hover:bg-primary/10'
                }`}
              >
                <Film size={18} />
                <span className="hidden md:inline">Danh sách</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Tv size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-main">{tvSeries.length}</p>
                  <p className="text-sm text-text-secondary">Series trong bộ sưu tập</p>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Bell size={20} className="text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-main">{upcomingEpisodes.length}</p>
                  <p className="text-sm text-text-secondary">Tập sắp chiếu</p>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-main">
                    {getEpisodesForDate(new Date()).length}
                  </p>
                  <p className="text-sm text-text-secondary">Hôm nay</p>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-main">
                    {upcomingEpisodes.filter(ep => {
                      const airDate = new Date(ep.episode.air_date);
                      const weekFromNow = new Date();
                      weekFromNow.setDate(weekFromNow.getDate() + 7);
                      return airDate <= weekFromNow;
                    }).length}
                  </p>
                  <p className="text-sm text-text-secondary">Tuần này</p>
                </div>
              </div>
            </div>
          </div>

          {tvSeries.length === 0 ? (
            <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Tv size={48} className="text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-text-main mb-2">
                Chưa có series nào để theo dõi
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Thêm các series TV vào danh sách xem hoặc đang xem để theo dõi lịch phát sóng các tập mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <div className="lg:col-span-2 bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-text-main">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <button
                        onClick={goToToday}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Hôm nay
                      </button>
                    </div>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  {loadingEpisodes ? (
                    <div className="grid grid-cols-7">
                      {Array.from({ length: 35 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="h-12 md:h-24 p-1 border border-black/5 dark:border-white/5 animate-pulse bg-black/5 dark:bg-white/5"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-7">
                      {renderCalendar()}
                    </div>
                  )}
                </div>
              )}

              {/* Episodes List */}
              <div className={viewMode === 'calendar' ? 'lg:col-span-1' : 'lg:col-span-3'}>
                <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-main flex items-center gap-2">
                      <Bell size={18} className="text-primary" />
                      {selectedDate 
                        ? `Tập phát sóng ngày ${selectedDate.toLocaleDateString('vi-VN')}`
                        : 'Tập sắp phát sóng'
                      }
                    </h3>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-xs text-primary hover:underline"
                      >
                        Xem tất cả
                      </button>
                    )}
                  </div>

                  {loadingEpisodes ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-background rounded-lg animate-pulse">
                          <div className="w-12 h-16 bg-black/10 dark:bg-white/10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4" />
                            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/4" />
                            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayedEpisodes.length === 0 ? (
                    <div className="text-center py-8">
                      <Info size={32} className="mx-auto text-text-secondary mb-2" />
                      <p className="text-text-secondary">
                        {selectedDate 
                          ? 'Không có tập nào phát sóng ngày này'
                          : 'Không có tập nào sắp phát sóng'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {Object.entries(episodesByDate).map(([date, episodes]) => (
                        <div key={date}>
                          <div className="sticky top-0 bg-surface py-2 z-10">
                            <h4 className="text-sm font-medium text-primary">
                              {formatDate(date)}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {episodes.map((ep, idx) => (
                              <div
                                key={`${ep.seriesId}-${ep.episode.id}-${idx}`}
                                onClick={() => handleSeriesClick(ep)}
                                className="flex gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                              >
                                <img
                                  src={ep.posterPath 
                                    ? `${TMDB_IMAGE_BASE_URL}${ep.posterPath}`
                                    : PLACEHOLDER_IMAGE
                                  }
                                  alt={ep.seriesName}
                                  className="w-12 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-text-main truncate">
                                    {ep.seriesNameVi || ep.seriesName}
                                  </h5>
                                  <p className="text-sm text-primary">
                                    S{ep.episode.season_number}E{ep.episode.episode_number}
                                  </p>
                                  <p className="text-xs text-text-secondary truncate mt-1">
                                    {ep.episode.name}
                                  </p>
                                  {ep.episode.runtime && (
                                    <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                      <Clock size={12} />
                                      {ep.episode.runtime} phút
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
};

export default ReleaseCalendarPage;

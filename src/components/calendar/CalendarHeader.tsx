import React from 'react';
import { CalendarDays, Bell, BellOff, BellRing, Calendar, List } from 'lucide-react';

interface CalendarHeaderProps {
  handlePushToggle: () => void;
  pushLoading: boolean;
  pushSubscribed: boolean;
  notificationPermission: NotificationPermission;
  viewMode: 'calendar' | 'list';
  setViewMode: (mode: 'calendar' | 'list') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  handlePushToggle,
  pushLoading,
  pushSubscribed,
  notificationPermission,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main flex items-center gap-2 sm:gap-3 tracking-tight">
          <CalendarDays className="text-primary" size={32} />
          Lịch phát sóng
        </h1>
        <p className="text-text-muted mt-1.5 sm:mt-2 text-base sm:text-lg opacity-80 leading-snug">
          Theo dõi các tập phim mới nhất của series bạn quan tâm
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* View Mode Toggle - Mobile only or all? Let's make it for all but more visible on mobile */}
        <div className="bg-surface border border-border-default p-1 rounded-2xl flex items-center shadow-premium">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-xs ${
              viewMode === 'calendar' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Lịch</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-xs ${
              viewMode === 'list' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <List size={16} />
            <span className="hidden sm:inline">Danh sách</span>
          </button>
        </div>

        <button
          onClick={handlePushToggle}
          disabled={pushLoading}
          title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
          className={`flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-2.5 font-bold text-xs sm:text-sm shadow-premium hover:scale-[1.02] active:scale-[0.98] ${
            pushSubscribed
              ? 'bg-success text-white shadow-lg shadow-success/20'
              : notificationPermission === 'denied'
              ? 'bg-error/10 text-error border border-error/20 cursor-not-allowed'
              : 'bg-surface border border-border-default text-text-main hover:bg-primary/5 hover:border-primary/30'
          } ${pushLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {pushLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : pushSubscribed ? (
            <BellRing size={18} />
          ) : notificationPermission === 'denied' ? (
            <BellOff size={18} />
          ) : (
            <Bell size={18} />
          )}
          <span>
            {pushLoading
              ? 'Đang xử lý...'
              : pushSubscribed
              ? 'Đã bật thông báo'
              : notificationPermission === 'denied'
              ? 'Thông báo bị chặn'
              : 'Nhận thông báo mới'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;

import React from 'react';
import { CalendarDays, Bell, BellOff, BellRing } from 'lucide-react';

interface CalendarHeaderProps {
  handlePushToggle: () => void;
  pushLoading: boolean;
  pushSubscribed: boolean;
  notificationPermission: NotificationPermission;
}

/** Header của trang lịch phát sóng, chứa các nút chuyển chế độ và thông báo. */
const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  handlePushToggle,
  pushLoading,
  pushSubscribed,
  notificationPermission
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-main flex items-center gap-3 tracking-tight">
          <CalendarDays className="text-primary" size={32} />
          Lịch phát sóng
        </h1>
        <p className="text-text-muted mt-2 text-lg opacity-80">
          Theo dõi các tập phim mới nhất của series bạn quan tâm
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePushToggle}
          disabled={pushLoading}
          title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
          className={`px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 font-bold text-sm shadow-premium hover:scale-[1.02] active:scale-[0.98] ${
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

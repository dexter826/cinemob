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
          onClick={handlePushToggle}
          disabled={pushLoading}
          title={pushSubscribed ? 'Tắt thông báo' : 'Bật thông báo tập phim mới'}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            pushSubscribed
              ? 'bg-green-500 text-white hover:bg-green-600'
              : notificationPermission === 'denied'
              ? 'bg-red-500/20 text-red-500 cursor-not-allowed'
              : 'bg-surface border border-black/5 dark:border-white/5 text-text-main hover:bg-primary/10'
          } ${pushLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {pushLoading ? (
            <div className="w-[18px] h-[18px] border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : pushSubscribed ? (
            <BellRing size={18} />
          ) : notificationPermission === 'denied' ? (
            <BellOff size={18} />
          ) : (
            <Bell size={18} />
          )}
          <span className="hidden md:inline">
            {pushLoading
              ? 'Đang xử lý...'
              : pushSubscribed
              ? 'Đang bật'
              : notificationPermission === 'denied'
              ? 'Bị chặn'
              : 'Thông báo'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;

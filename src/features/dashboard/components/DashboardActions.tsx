import React from 'react';
import { Search, Plus, Link2, Link2Off, Copy, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShare } from '@/features/share/hooks/useShare';

interface DashboardActionsProps {
  onOpenAddModal: () => void;
}

/** Hiển thị các nút hành động chính (Tìm kiếm và Thêm thủ công) + chia sẻ công khai. */
const DashboardActions: React.FC<DashboardActionsProps> = ({ onOpenAddModal }) => {
  const navigate = useNavigate();
  const { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, refreshSnapshot, copyLink } = useShare();
  const busy = loading || syncing;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <button
          onClick={() => navigate('/search')}
          className="w-full bg-linear-to-br from-primary/90 to-primary hover:to-primary/90 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-xl shadow-primary/20 cursor-pointer border border-white/10"
        >
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left">Thêm vào bộ sưu tập</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-left tracking-tight">Ghi lại phim</h3>
          </div>
          <div className="bg-white/10 p-3 sm:p-3.5 rounded-2xl transition-colors duration-300 backdrop-blur-md border border-white/10">
            <Search size={24} className="text-white sm:w-7 sm:h-7" />
          </div>
        </button>

        <button
          onClick={onOpenAddModal}
          className="w-full bg-surface border border-border-default hover:border-primary/50 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-premium hover:shadow-premium-hover cursor-pointer"
        >
          <div>
            <p className="text-text-muted text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left opacity-60">Không tìm thấy phim?</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-text-main text-left tracking-tight">Thêm thủ công</h3>
          </div>
          <div className="bg-black/5 dark:bg-white/5 p-3 sm:p-3.5 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300 border border-border-default">
            <Plus size={24} className="text-text-main group-hover:text-primary transition-colors sm:w-7 sm:h-7" />
          </div>
        </button>
      </div>

      <div className="w-full bg-surface border border-border-default p-5 sm:p-6 rounded-3xl shadow-premium">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-border-default">
              {isEnabled ? <Link2 size={22} className="text-primary" /> : <Link2Off size={22} className="text-text-muted" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-text-main text-left tracking-tight">Chia sẻ công khai</h3>
              <p className="text-text-muted text-xs sm:text-sm text-left">
                {loading ? 'Đang tải trạng thái...' : isEnabled ? 'Mọi người có link đều xem được tủ phim' : 'Bật để chia sẻ tủ phim qua link'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${isEnabled ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' : 'text-text-muted border-border-default bg-black/5 dark:bg-white/5'}`}>
            {isEnabled ? 'Đang bật' : 'Đang tắt'}
          </span>
        </div>

        {isEnabled && (
          <div className="mt-4 flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-3 py-2">
            <p className="flex-1 truncate text-xs sm:text-sm text-text-main text-left">{shareUrl}</p>
            <button
              onClick={copyLink}
              disabled={busy}
              aria-label="Copy link chia sẻ"
              className="p-2 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy size={18} />
            </button>
          </div>
        )}

        {lastUpdated && (
          <p className="mt-3 text-[11px] sm:text-xs text-text-muted text-left">Cập nhật: {lastUpdated.toLocaleString('vi-VN')}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={toggleShare}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnabled ? <Link2Off size={16} /> : <Link2 size={16} />}
            {isEnabled ? 'Tắt chia sẻ' : 'Bật chia sẻ'}
          </button>
          <button
            onClick={copyLink}
            disabled={busy || !isEnabled}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border-default text-sm font-semibold text-text-main hover:border-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy size={16} />
            Copy link
          </button>
          <button
            onClick={refreshSnapshot}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border-default text-sm font-semibold text-text-main hover:border-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Đang cập nhật...' : 'Cập nhật link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardActions;

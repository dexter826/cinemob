import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardActionsProps {
  onOpenAddModal: () => void;
}

/** Hiển thị các nút hành động chính (Tìm kiếm và Thêm thủ công) */
const DashboardActions: React.FC<DashboardActionsProps> = ({ onOpenAddModal }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <button
        onClick={() => navigate('/search')}
        aria-label="Tìm kiếm và ghi lại phim vào bộ sưu tập"
        className="w-full bg-linear-to-br from-primary/90 to-primary hover:to-primary/95 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-md cursor-pointer border border-white/10 active:scale-[0.99]"
      >
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-left tracking-tight mb-1 font-display">Ghi lại phim</h3>
          <p className="text-white/80 text-xs sm:text-sm font-medium text-left">Khám phá và thêm vào bộ sưu tập</p>
        </div>
        <div className="bg-white/20 p-3 sm:p-3.5 rounded-2xl transition-colors duration-300 border border-white/15 shadow-sm">
          <Search size={24} className="text-white sm:w-7 sm:h-7" />
        </div>
      </button>

      <button
        onClick={onOpenAddModal}
        aria-label="Thêm phim thủ công"
        className="w-full bg-surface border border-border-default hover:border-primary/50 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-colors shadow-premium hover:shadow-premium-hover cursor-pointer active:scale-[0.99]"
      >
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-text-main text-left tracking-tight mb-1 font-display">Thêm thủ công</h3>
          <p className="text-text-muted text-xs sm:text-sm font-medium text-left">Tạo mục phim tùy chỉnh nếu không tìm thấy</p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 p-3 sm:p-3.5 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300 border border-border-default shadow-sm">
          <Plus size={24} className="text-text-main group-hover:text-primary transition-colors sm:w-7 sm:h-7" />
        </div>
      </button>
    </div>
  );
};

export default DashboardActions;


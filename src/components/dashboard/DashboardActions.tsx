import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardActionsProps {
  onOpenAddModal: () => void;
}

/** Hiển thị các nút hành động chính (Tìm kiếm và Thêm thủ công). */
const DashboardActions: React.FC<DashboardActionsProps> = ({ onOpenAddModal }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <button
        onClick={() => navigate('/search')}
        className="w-full bg-linear-to-br from-primary/90 to-primary hover:to-primary/90 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-all shadow-xl shadow-primary/20 cursor-pointer border border-white/10"
      >
        <div>
          <p className="text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left">Thêm vào bộ sưu tập</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-left tracking-tight">Ghi lại phim</h3>
        </div>
        <div className="bg-white/10 p-3 sm:p-3.5 rounded-2xl transition-all duration-300 backdrop-blur-md border border-white/10">
          <Search size={24} className="text-white sm:w-7 sm:h-7" />
        </div>
      </button>

      <button
        onClick={onOpenAddModal}
        className="w-full bg-surface border border-border-default hover:border-primary/50 p-5 sm:p-6 rounded-3xl flex items-center justify-between group transition-all shadow-premium hover:shadow-premium-hover cursor-pointer"
      >
        <div>
          <p className="text-text-muted text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 text-left opacity-60">Không tìm thấy phim?</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-text-main text-left tracking-tight">Thêm thủ công</h3>
        </div>
        <div className="bg-black/5 dark:bg-white/5 p-3 sm:p-3.5 rounded-2xl group-hover:bg-primary/10 transition-all duration-300 border border-border-default">
          <Plus size={24} className="text-text-main group-hover:text-primary transition-colors sm:w-7 sm:h-7" />
        </div>
      </button>
    </div>
  );
};

export default DashboardActions;

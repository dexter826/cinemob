import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardActionsProps {
  onOpenAddModal: () => void;
}

/** Primary discovery action + secondary manual-add action. Usable at 320 px. */
function DashboardActions({ onOpenAddModal }: DashboardActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <button
        onClick={() => navigate('/search')}
        aria-label="Tìm phim, khám phá và thêm vào bộ sưu tập"
        className="w-full bg-primary hover:bg-primary-hover p-5 sm:p-6 rounded-card flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-on-primary text-left tracking-tight mb-1 font-display">Tìm phim</h3>
          <p className="text-on-primary/80 text-xs sm:text-sm font-medium text-left">Khám phá và thêm vào bộ sưu tập</p>
        </div>
        <Search size={24} className="text-on-primary shrink-0 sm:w-7 sm:h-7" aria-hidden="true" />
      </button>

      <button
        onClick={onOpenAddModal}
        aria-label="Thêm thủ công, tạo mục phim tùy chỉnh"
        className="w-full bg-surface border border-border hover:border-primary/50 p-5 sm:p-6 rounded-card flex items-center justify-between transition-colors cursor-pointer"
      >
        <div className="min-w-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-text-primary text-left tracking-tight mb-1 font-display">Thêm thủ công</h3>
          <p className="text-text-secondary text-xs sm:text-sm font-medium text-left">Tạo mục phim tùy chỉnh nếu không tìm thấy</p>
        </div>
        <Plus size={24} className="text-text-primary shrink-0 sm:w-7 sm:h-7" aria-hidden="true" />
      </button>
    </div>
  );
}

export default DashboardActions;

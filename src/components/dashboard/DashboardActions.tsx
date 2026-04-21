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
        className="w-full bg-linear-to-br from-primary/80 to-primary hover:to-primary/90 p-6 rounded-2xl flex items-center justify-between group transition-all shadow-lg shadow-primary/20 cursor-pointer"
      >
        <div>
          <p className="text-white/90 text-sm font-medium mb-1 text-left">Thêm vào bộ sưu tập</p>
          <h3 className="text-2xl font-bold text-white text-left">Ghi lại phim</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-xl group-hover:rotate-90 transition-transform duration-300">
          <Search size={24} className="text-white" />
        </div>
      </button>

      <button
        onClick={onOpenAddModal}
        className="w-full bg-surface border border-black/5 dark:border-white/10 hover:border-primary/50 p-6 rounded-2xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md cursor-pointer"
      >
        <div>
          <p className="text-text-muted text-sm font-medium mb-1 text-left">Không tìm thấy phim?</p>
          <h3 className="text-2xl font-bold text-text-main text-left">Thêm thủ công</h3>
        </div>
        <div className="bg-black/5 dark:bg-white/10 p-3 rounded-xl group-hover:bg-primary/10 group-hover:rotate-90 transition-all duration-300">
          <Plus size={24} className="text-text-main group-hover:text-primary transition-colors" />
        </div>
      </button>
    </div>
  );
};

export default DashboardActions;

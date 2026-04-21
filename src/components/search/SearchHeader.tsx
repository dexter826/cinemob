import React from 'react';
import { ArrowLeft, Film, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchHeaderProps {
  searchTab: 'movies' | 'people';
  hasDiscoverMovies: boolean;
  onTabChange: (tab: 'movies' | 'people') => void;
}

/** Hiển thị tiêu đề và thanh chuyển đổi tab tìm kiếm. */
const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  searchTab, 
  hasDiscoverMovies,
  onTabChange 
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          {searchTab === 'movies'
            ? (hasDiscoverMovies ? "Duyệt tất cả phim" : "Tìm kiếm phim")
            : "Tìm kiếm người"}
        </h1>
      </div>

      <div className="flex gap-2 bg-surface border border-black/10 dark:border-white/10 rounded-xl p-1">
        <button
          onClick={() => onTabChange('movies')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
            searchTab === 'movies'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Film size={18} />
          <span>Phim</span>
        </button>
        <button
          onClick={() => onTabChange('people')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
            searchTab === 'people'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          <User size={18} />
          <span>Người</span>
        </button>
      </div>
    </div>
  );
};

export default SearchHeader;

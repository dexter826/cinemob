import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchHeaderProps {
  hasDiscoverMovies: boolean;
}

/** Hiển thị tiêu đề trang tìm kiếm. */
const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  hasDiscoverMovies,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">
          {hasDiscoverMovies ? "Duyệt tất cả phim" : "Tìm kiếm phim"}
        </h1>
      </div>
    </div>
  );
};


export default SearchHeader;

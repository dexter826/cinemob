import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  const handleInputBlur = () => {
    const page = parseInt(inputValue, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      setInputValue(currentPage.toString());
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 hover:border-primary/30 transition-all shadow-sm cursor-pointer"
      >
        <ArrowDown size={20} className="rotate-90" />
      </button>

      {/* Desktop Pagination */}
      <div className="hidden md:flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          const isActive = currentPage === page;
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          if (!showPage) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span key={page} className="px-1 text-text-muted select-none">
                  •••
                </span>
              );
            }
            return null;
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`min-w-10 h-10 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-surface border border-black/10 dark:border-white/10 text-text-main hover:bg-black/5 dark:hover:bg-white/5 hover:border-primary/30'
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Mobile Pagination with Input */}
      <div className="md:hidden flex items-center gap-2">
        <span className="text-sm text-text-muted">Trang</span>
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-12 h-8 px-2 text-center bg-surface border border-black/10 dark:border-white/10 rounded-lg text-sm text-text-main focus:outline-none focus:border-primary/50"
          />
          <span className="text-sm text-text-muted">/ {totalPages}</span>
        </form>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 hover:border-primary/30 transition-all shadow-sm cursor-pointer"
      >
        <ArrowDown size={20} className="-rotate-90" />
      </button>
    </div>
  );
};

export default Pagination;
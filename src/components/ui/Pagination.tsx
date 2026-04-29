import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  // Update input value when currentPage changes
  React.useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

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
        className="p-2.5 rounded-xl bg-surface border border-border-default text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all shadow-premium cursor-pointer"
      >
        <ArrowDown size={18} className="rotate-90" />
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
                <span key={page} className="px-1 text-text-muted select-none opacity-50">
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
              className={`min-w-10 h-10 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-surface border border-border-default text-text-main hover:bg-primary/5 hover:border-primary/30'
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Mobile Pagination with Input */}
      <div className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-default rounded-xl shadow-premium">
        <span className="text-xs font-medium text-text-muted">Trang</span>
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-10 h-7 text-center bg-black/5 dark:bg-white/5 border-none rounded-lg text-xs font-bold text-text-main focus:ring-1 focus:ring-primary/50 outline-none"
          />
          <span className="text-xs font-bold text-text-muted opacity-50">/ {totalPages}</span>
        </form>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl bg-surface border border-border-default text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-all shadow-premium cursor-pointer"
      >
        <ArrowDown size={18} className="-rotate-90" />
      </button>
    </div>
  );
};

export default Pagination;
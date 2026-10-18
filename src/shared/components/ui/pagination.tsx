import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const prefersReducedMotion = useReducedMotion() ?? false;

  React.useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2 pt-6">
      <button
        type="button"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="p-2.5 rounded-control bg-surface border border-border text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <div className="hidden md:flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = currentPage === page;
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          if (!showPage) {
            if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span
                  key={page}
                  aria-hidden="true"
                  className="px-1 text-text-secondary select-none opacity-50"
                >
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
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Trang ${page}`}
              className={`min-w-10 h-10 px-3 rounded-control text-sm font-bold tabular-nums transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface border border-border text-text-primary hover:bg-primary/5 hover:border-primary/30'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <div className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-control">
        <span className="text-xs font-medium text-text-secondary">Trang</span>
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-label="Số trang muốn chuyển đến"
            autoComplete="off"
            className="w-10 h-7 text-center border-none rounded-lg text-xs font-bold text-text-primary focus-visible:ring-1 focus-visible:ring-primary/50"
          />
          <span className="text-xs font-bold text-text-secondary opacity-50 tabular-nums">
            / {totalPages}
          </span>
        </form>
      </div>

      <button
        type="button"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        className="p-2.5 rounded-control bg-surface border border-border text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;

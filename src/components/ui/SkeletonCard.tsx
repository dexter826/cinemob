import React from 'react';

/** Khung xương hiển thị khi đang tải thẻ phim. */
const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-surface rounded-2xl overflow-hidden border border-border-default shadow-premium h-full animate-pulse">
      {/* Poster Image Area */}
      <div className="aspect-2/3 w-full bg-black/5 dark:bg-white/5" />

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 space-y-3">
        <div className="space-y-2">
          {/* Title line 1 */}
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-3/4" />
          {/* Title line 2 (Subtitle) */}
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/2" />
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-2 border-t border-border-default flex items-center justify-between">
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/3" />
          <div className="h-4 w-4 bg-black/5 dark:bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

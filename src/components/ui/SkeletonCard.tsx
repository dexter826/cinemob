import React from 'react';
import { motion } from 'framer-motion';

/** Component hiển thị khung xương (shimmer) của MovieCard khi đang tải. */
const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-surface rounded-2xl overflow-hidden border border-border-default shadow-premium h-full">
      {/* Poster Image Area */}
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1 space-y-3">
        <div className="space-y-2">
          {/* Title line 1 */}
          <div className="h-4 bg-black/5 dark:bg-white/5 rounded-md w-3/4 overflow-hidden relative">
             <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
          </div>
          {/* Title line 2 (Subtitle) */}
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/2 overflow-hidden relative">
             <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-2 border-t border-border-default flex items-center justify-between">
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/3 overflow-hidden relative">
             <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
          </div>
          <div className="h-4 w-4 bg-black/5 dark:bg-white/5 rounded-md overflow-hidden relative">
             <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

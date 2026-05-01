import React from 'react';
import { motion } from 'framer-motion';

interface StatusToggleProps {
  status: 'history' | 'watchlist';
  setStatus: (status: 'history' | 'watchlist') => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ status, setStatus }) => {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-border-default relative flex">
      <button
        type="button"
        onClick={() => setStatus('history')}
        className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors duration-300 uppercase tracking-widest ${
          status === 'history' ? 'text-white' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <span>Đã xem</span>
        {status === 'history' && (
          <motion.div
            layoutId="activeStatus"
            className="absolute inset-0 bg-primary rounded-xl z-[-1] shadow-lg shadow-primary/30"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
      </button>
      <button
        type="button"
        onClick={() => setStatus('watchlist')}
        className={`flex-1 relative z-10 py-2.5 text-xs font-bold transition-colors duration-300 uppercase tracking-widest ${
          status === 'watchlist' ? 'text-white' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <span>Sẽ xem</span>
        {status === 'watchlist' && (
          <motion.div
            layoutId="activeStatus"
            className="absolute inset-0 bg-primary rounded-xl z-[-1] shadow-lg shadow-primary/30"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
      </button>
    </div>
  );
};

export default StatusToggle;

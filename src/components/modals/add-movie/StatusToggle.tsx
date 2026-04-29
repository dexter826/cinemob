import React from 'react';

interface StatusToggleProps {
  status: 'history' | 'watchlist';
  setStatus: (status: 'history' | 'watchlist') => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ status, setStatus }) => {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl flex border border-border-default gap-1">
      <button
        type="button"
        onClick={() => setStatus('history')}
        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-widest ${
          status === 'history'
            ? 'bg-surface shadow-premium text-primary border border-border-default'
            : 'text-text-muted hover:text-text-main hover:bg-surface/50'
        }`}
      >
        Đã xem
      </button>
      <button
        type="button"
        onClick={() => setStatus('watchlist')}
        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-widest ${
          status === 'watchlist'
            ? 'bg-surface shadow-premium text-primary border border-border-default'
            : 'text-text-muted hover:text-text-main hover:bg-surface/50'
        }`}
      >
        Sẽ xem
      </button>
    </div>
  );
};

export default StatusToggle;

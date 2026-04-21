import React from 'react';

interface StatusToggleProps {
  status: 'history' | 'watchlist';
  setStatus: (status: 'history' | 'watchlist') => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ status, setStatus }) => {
  return (
    <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex">
      <button
        type="button"
        onClick={() => setStatus('history')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          status === 'history'
            ? 'bg-surface shadow-sm text-primary'
            : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        Đã xem
      </button>
      <button
        type="button"
        onClick={() => setStatus('watchlist')}
        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          status === 'watchlist'
            ? 'bg-surface shadow-sm text-primary'
            : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        Sẽ xem
      </button>
    </div>
  );
};

export default StatusToggle;

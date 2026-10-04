import { useRef } from 'react';

interface StatusToggleProps {
  status: 'history' | 'watchlist';
  setStatus: (status: 'history' | 'watchlist') => void;
}

function StatusToggle({ status, setStatus }: StatusToggleProps) {
  const historyRef = useRef<HTMLButtonElement>(null);
  const watchlistRef = useRef<HTMLButtonElement>(null);

  const moveTo = (target: 'history' | 'watchlist') => {
    setStatus(target);
    (target === 'history' ? historyRef : watchlistRef).current?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Trạng thái phim"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          moveTo(status === 'history' ? 'watchlist' : 'history');
        }
      }}
      className="bg-black/5 dark:bg-white/5 p-1 rounded-card border border-border relative flex"
    >
      <button
        type="button"
        role="radio"
        aria-checked={status === 'history'}
        tabIndex={status === 'history' ? 0 : -1}
        ref={historyRef}
        onClick={() => setStatus('history')}
        className={`flex-1 py-2.5 text-xs font-bold transition-colors rounded-control cursor-pointer ${
          status === 'history'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Đã xem
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={status === 'watchlist'}
        tabIndex={status === 'watchlist' ? 0 : -1}
        ref={watchlistRef}
        onClick={() => setStatus('watchlist')}
        className={`flex-1 py-2.5 text-xs font-bold transition-colors rounded-control cursor-pointer ${
          status === 'watchlist'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Sẽ xem
      </button>
    </div>
  );
}

export default StatusToggle;

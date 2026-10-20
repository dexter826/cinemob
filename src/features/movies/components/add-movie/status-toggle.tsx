import { useRef } from 'react';
import { MOVIE_STATUS_LABEL } from '@/constants/movie-status';
import { MovieStatus } from '@/types';

interface StatusToggleProps {
  status: MovieStatus;
  setStatus: (status: MovieStatus) => void;
}

const radioClass = (isActive: boolean) =>
  `flex-1 py-2.5 text-body-sm font-bold transition-colors rounded-control cursor-pointer ${
    isActive ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
  }`;

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
          moveTo(status === 'watchlist' ? 'history' : 'watchlist');
        }
      }}
      className="p-1 rounded-card border border-border relative flex"
    >
      <button
        type="button"
        role="radio"
        aria-checked={status === 'history'}
        tabIndex={status === 'history' ? 0 : -1}
        ref={historyRef}
        onClick={() => setStatus('history')}
        className={radioClass(status === 'history')}
      >
        {MOVIE_STATUS_LABEL.history}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={status === 'watchlist'}
        tabIndex={status === 'watchlist' ? 0 : -1}
        ref={watchlistRef}
        onClick={() => setStatus('watchlist')}
        className={radioClass(status === 'watchlist')}
      >
        {MOVIE_STATUS_LABEL.watchlist}
      </button>
      {status === 'dropped' && (
        <button
          type="button"
          role="radio"
          aria-checked="true"
          aria-disabled="true"
          tabIndex={0}
          className="flex-1 py-2.5 text-body-sm font-bold rounded-control bg-surface-elevated border border-border text-text-secondary cursor-not-allowed"
        >
          {MOVIE_STATUS_LABEL.dropped}
        </button>
      )}
    </div>
  );
}

export default StatusToggle;

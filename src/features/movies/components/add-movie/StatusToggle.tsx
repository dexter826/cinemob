interface StatusToggleProps {
  status: 'history' | 'watchlist';
  setStatus: (status: 'history' | 'watchlist') => void;
}

function StatusToggle({ status, setStatus }: StatusToggleProps) {
  return (
    <div role="radiogroup" aria-label="Trạng thái phim" className="bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-border relative flex">
      <button
        type="button"
        role="radio"
        aria-checked={status === 'history'}
        onClick={() => setStatus('history')}
        className={`flex-1 py-2.5 text-xs font-bold transition-colors rounded-xl cursor-pointer ${
          status === 'history' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Đã xem
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={status === 'watchlist'}
        onClick={() => setStatus('watchlist')}
        className={`flex-1 py-2.5 text-xs font-bold transition-colors rounded-xl cursor-pointer ${
          status === 'watchlist' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        Sẽ xem
      </button>
    </div>
  );
}

export default StatusToggle;

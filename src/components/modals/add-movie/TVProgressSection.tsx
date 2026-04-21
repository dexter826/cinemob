import React from 'react';
import { Tv } from 'lucide-react';

interface TVProgressSectionProps {
  isCompleted: boolean;
  setIsCompleted: (completed: boolean) => void;
  currentSeason: number;
  setCurrentSeason: (season: number) => void;
  currentEpisode: number;
  setCurrentEpisode: (episode: number) => void;
  totalEpisodes: number;
  episodesPerSeason: Record<number, number>;
  maxSeasons: number;
}

const TVProgressSection: React.FC<TVProgressSectionProps> = ({
  isCompleted,
  setIsCompleted,
  currentSeason,
  setCurrentSeason,
  currentEpisode,
  setCurrentEpisode,
  totalEpisodes,
  episodesPerSeason,
  maxSeasons
}) => {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Tv size={16} /> Tiến độ xem
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="completed-checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary accent-primary"
          />
          <label htmlFor="completed-checkbox" className="text-sm text-text-main cursor-pointer select-none">
            Đã xem hết
          </label>
        </div>
      </div>

      {!isCompleted && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted">Season</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentSeason(Math.max(1, currentSeason - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center font-medium text-text-main">{currentSeason}</div>
              <button
                type="button"
                onClick={() => setCurrentSeason(Math.min(maxSeasons || 1, currentSeason + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted">Episode</label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentEpisode(Math.max(0, currentEpisode - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center font-medium text-text-main">{currentEpisode}</div>
              <button
                type="button"
                onClick={() => {
                  const maxEpisodes = episodesPerSeason[currentSeason] || 999;
                  setCurrentEpisode(Math.min(maxEpisodes, currentEpisode + 1));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {totalEpisodes > 0 && !isCompleted && (
        <div className="text-xs text-text-muted text-center pt-2 border-t border-primary/10">
          Tổng: {totalEpisodes} tập • Mùa này: {episodesPerSeason[currentSeason] || '?'} tập
        </div>
      )}
    </div>
  );
};

export default TVProgressSection;

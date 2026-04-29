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
    <div className="bg-primary/5 border border-primary/20 rounded-[24px] p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <Tv size={14} /> Tiến độ xem
        </h3>
        <label className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="peer appearance-none w-5 h-5 rounded-lg border-2 border-primary/30 checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform duration-300 pointer-events-none">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
              </svg>
            </div>
          </div>
          <span className="text-xs font-bold text-text-main group-hover:text-primary transition-colors">
            Hoàn thành bộ phim
          </span>
        </label>
      </div>

      {!isCompleted && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Mùa (Season)</label>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setCurrentSeason(Math.max(1, currentSeason - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border-default shadow-sm text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-sm text-text-main">{currentSeason}</div>
              <button
                type="button"
                onClick={() => setCurrentSeason(Math.min(maxSeasons || 1, currentSeason + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border-default shadow-sm text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 opacity-60">Tập (Episode)</label>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setCurrentEpisode(Math.max(0, currentEpisode - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border-default shadow-sm text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all font-bold"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-sm text-text-main">{currentEpisode}</div>
              <button
                type="button"
                onClick={() => {
                  const maxEpisodes = episodesPerSeason[currentSeason] || 999;
                  setCurrentEpisode(Math.min(maxEpisodes, currentEpisode + 1));
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border-default shadow-sm text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {totalEpisodes > 0 && !isCompleted && (
        <div className="text-[10px] font-bold text-primary/60 text-center pt-4 border-t border-primary/20 uppercase tracking-[0.2em]">
          Tổng {totalEpisodes} tập • Mùa {currentSeason}: {episodesPerSeason[currentSeason] || '?'} tập
        </div>
      )}
    </div>
  );
};

export default TVProgressSection;

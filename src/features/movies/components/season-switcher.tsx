import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dropdown } from '@/shared/components/ui';
import { buildMoviePath } from '../utils/movie-utils';
import { getTVShowSeasons } from '@/features/search/services/tmdb';

interface SeasonSwitcherProps {
  seriesId: string | number;
  currentSeason: number;
  seasonCount: number;
}

function SeasonSwitcher({ seriesId, currentSeason, seasonCount }: SeasonSwitcherProps) {
  const navigate = useNavigate();
  const [tmdbSeasonNumbers, setTmdbSeasonNumbers] = useState<number[] | null>(null);

  useEffect(() => {
    const tvId = Number(seriesId);
    if (!Number.isFinite(tvId)) return;
    let cancelled = false;
    getTVShowSeasons(tvId)
      .then((seasons) => {
        if (!cancelled && seasons && seasons.length > 0) {
          setTmdbSeasonNumbers(seasons.map((s) => s.season_number));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  const seasonNumbers =
    tmdbSeasonNumbers ?? Array.from({ length: Math.max(seasonCount, 0) }, (_, i) => i + 1);

  if (seasonNumbers.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Link
        to={buildMoviePath(seriesId, 'tv')}
        className="text-body-sm font-bold text-text-secondary hover:text-primary hover:underline underline-offset-2 transition-colors whitespace-nowrap"
      >
        Tất cả mùa
      </Link>
      <Dropdown
        aria-label="Chọn mùa"
        className="w-28 shrink-0"
        options={seasonNumbers.map((n) => ({ value: n, label: `Mùa ${n}` }))}
        value={currentSeason}
        onChange={(value) => navigate(buildMoviePath(seriesId, 'tv', Number(value)))}
      />
    </div>
  );
}

export default SeasonSwitcher;

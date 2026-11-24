import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { getMovieDetails, getTVSeasonDetails } from '@/features/search/services/tmdb';
import useAddMovieStore from '../stores/add-movie-store';
import { buildMoviePath } from '../utils/movie-utils';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { TMDBMovieDetail, TMDBMovieResult } from '@/types';
import { IconButton } from '@/shared/components/ui/icon-button';
import Button from '@/shared/components/ui/button';
import ErrorState from '@/shared/components/ui/error-state';
import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { useGoBackOrHome } from '@/shared/hooks/use-go-back';

function SeasonPreview({ seriesId, season }: { seriesId: string; season: number }) {
  const openAddModal = useAddMovieStore((state) => state.openAddModal);
  const goBackOrHome = useGoBackOrHome();
  const tvId = Number(seriesId);
  const [retryNonce, setRetryNonce] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    details: TMDBMovieDetail | null;
    seasonInfo: { episode_count: number; poster_path: string | null } | null;
    error: boolean;
  }>({ loading: true, details: null, seasonInfo: null, error: false });

  useEffect(() => {
    if (!Number.isFinite(tvId)) {
      setState({ loading: false, details: null, seasonInfo: null, error: true });
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setState({ loading: true, details: null, seasonInfo: null, error: false });
    Promise.all([
      getMovieDetails(tvId, 'tv', controller.signal),
      getTVSeasonDetails(tvId, season, controller.signal),
    ])
      .then(([details, seasonInfo]) => {
        if (!cancelled) setState({ loading: false, details, seasonInfo, error: !details });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, details: null, seasonInfo: null, error: true });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [tvId, season, retryNonce]);

  const details = state.details;
  const title = details?.name || details?.title || 'Không rõ tiêu đề';
  const posterUrl = state.seasonInfo?.poster_path
    ? getTMDBImageUrl(state.seasonInfo.poster_path, 'w780')
    : details?.poster_path
      ? getTMDBImageUrl(details.poster_path, 'w780')
      : PLACEHOLDER_IMAGE;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-5 pb-10">
      <div className="flex items-center justify-between pb-4 md:pb-5">
        <IconButton label="Quay lại trang trước" onClick={goBackOrHome} variant="secondary">
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        </IconButton>
        <Link
          to={buildMoviePath(seriesId, 'tv')}
          className="text-body-sm font-bold text-text-secondary hover:text-primary hover:underline underline-offset-2 transition-colors"
        >
          Tất cả mùa
        </Link>
      </div>

      {state.loading ? (
        <>
          <LoadingStatus>Đang tải thông tin Mùa {season}…</LoadingStatus>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <Skeleton className="w-full max-w-[240px] md:w-[280px] aspect-2/3 rounded-poster self-center md:self-start" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </>
      ) : state.error ? (
        <ErrorState
          title="Không tải được thông tin mùa"
          description="TMDB không phản hồi cho mùa này."
          retry={{ label: 'Thử lại', onClick: () => setRetryNonce((n) => n + 1) }}
        />
      ) : (
        <article className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="w-full max-w-[240px] md:w-[280px] shrink-0 self-center md:self-start">
            <img
              src={posterUrl}
              alt={`${title} - Mùa ${season}`}
              width={280}
              height={420}
              className="w-full rounded-poster border border-border"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-display-xl leading-[1.02] text-text-primary">{title}</h1>
            <p className="mt-2 text-body text-text-secondary">
              Mùa {season}
              {state.seasonInfo && state.seasonInfo.episode_count > 0
                ? ` · ${state.seasonInfo.episode_count} tập`
                : ' · Chưa có tập'}
            </p>
            <div className="mt-8">
              <Button
                leadingIcon={<Plus size={16} strokeWidth={1.5} aria-hidden="true" />}
                onClick={() => {
                  const movieResult: TMDBMovieResult = {
                    id: tvId,
                    title: details?.title,
                    name: details?.name,
                    poster_path: details?.poster_path ?? null,
                    release_date: details?.release_date,
                    first_air_date: details?.first_air_date,
                    media_type: 'tv',
                  };
                  openAddModal({
                    movie: movieResult,
                    mediaType: 'tv',
                    initialSeason: season,
                  });
                }}
              >
                Thêm Mùa {season}
              </Button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default SeasonPreview;

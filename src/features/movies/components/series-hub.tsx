import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Tv } from 'lucide-react';
import { getMovieDetails, getEffectiveSeasons } from '@/features/search/services/tmdb';
import useMovieStore from '../stores/movie-store';
import useAddMovieStore from '../stores/add-movie-store';
import {
  buildMoviePath,
  getMainTitle,
  getSeasonParam,
  getSeriesInfo,
  getTranslatedGenres,
} from '../utils/movie-utils';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { TMDBMovieDetail, TMDBMovieResult } from '@/types';
import { IconButton } from '@/shared/components/ui/icon-button';
import Button from '@/shared/components/ui/button';
import { Chip } from '@/shared/components/ui';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import PosterCard from './poster-card';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { useGoBackOrHome } from '@/shared/hooks/use-go-back';

function SeriesHub({ seriesId }: { seriesId: string }) {
  const { movies } = useMovieStore();
  const openAddModal = useAddMovieStore((state) => state.openAddModal);
  const goBackOrHome = useGoBackOrHome();
  const navigate = useNavigate();
  const tvId = Number(seriesId);
  const [retryNonce, setRetryNonce] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    details: TMDBMovieDetail | null;
    error: boolean;
  }>({ loading: true, details: null, error: false });

  useEffect(() => {
    if (!Number.isFinite(tvId)) {
      setState({ loading: false, details: null, error: true });
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setState({ loading: true, details: null, error: false });
    getMovieDetails(tvId, 'tv', controller.signal)
      .then((details) => {
        if (!cancelled) setState({ loading: false, details, error: !details });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, details: null, error: true });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [tvId, retryNonce]);

  const docs = useMemo(
    () => movies.filter((m) => String(m.id) === seriesId && m.media_type === 'tv'),
    [movies, seriesId],
  );
  const seriesInfo = getSeriesInfo(movies, seriesId, 'tv');
  const effectiveSeasons = getEffectiveSeasons(state.details?.seasons);
  const seasonCount = effectiveSeasons.length || seriesInfo?.totalSeasons || 0;
  const seasonNumbers =
    effectiveSeasons.length > 0
      ? effectiveSeasons.map((s) => s.season_number)
      : Array.from({ length: seasonCount }, (_, i) => i + 1);
  const details = state.details;
  const tmdbFailed = state.error || !details;
  const title =
    (docs[0] ? getMainTitle(docs[0]) : '') || details?.name || details?.title || 'Không rõ tiêu đề';
  const headerPosterPath = details?.poster_path ?? docs[0]?.poster_path ?? null;
  const posterUrl = headerPosterPath
    ? getTMDBImageUrl(headerPosterPath, 'w780')
    : PLACEHOLDER_IMAGE;
  const genres = details?.genres?.map((g) => g.name).join(', ') || docs[0]?.genres || '';
  const overview = details?.overview || docs[0]?.content || '';
  const year = (
    details?.first_air_date ||
    details?.release_date ||
    docs[0]?.release_date ||
    ''
  ).split('-')[0];

  const addSeason = (season: number) => {
    const movieResult: TMDBMovieResult = {
      id: tvId,
      title: details?.title ?? docs[0]?.title,
      name: details?.name,
      poster_path: details?.poster_path ?? docs[0]?.poster_path ?? null,
      release_date: details?.release_date,
      first_air_date: details?.first_air_date ?? docs[0]?.release_date,
      media_type: 'tv',
    };
    openAddModal({ movie: movieResult, mediaType: 'tv', initialSeason: season });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-5 pb-10">
      <div className="flex items-center justify-between pb-4 md:pb-5">
        <IconButton label="Quay lại trang trước" onClick={goBackOrHome} variant="secondary">
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        </IconButton>
      </div>

      {state.loading ? (
        <>
          <LoadingStatus>Đang tải thông tin series…</LoadingStatus>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <Skeleton className="w-full max-w-[240px] md:w-[280px] aspect-2/3 rounded-poster self-center md:self-start" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </>
      ) : tmdbFailed && docs.length === 0 ? (
        <ErrorState
          title="Không tải được thông tin series"
          description="Không tìm thấy series trong Thư viện và TMDB cũng không phản hồi."
          retry={{ label: 'Thử lại', onClick: () => setRetryNonce((n) => n + 1) }}
        />
      ) : (
        <>
          {tmdbFailed && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-3">
              <p className="text-body-sm text-text-secondary">
                TMDB không phản hồi — đang hiển thị theo dữ liệu trong Thư viện.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setRetryNonce((n) => n + 1)}>
                Thử lại
              </Button>
            </div>
          )}
          <article className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="w-full max-w-[240px] md:w-[280px] shrink-0 self-center md:self-start">
              <img
                src={posterUrl}
                alt={title}
                width={280}
                height={420}
                className="w-full rounded-poster border border-border"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-display-xl leading-[1.02] text-text-primary">{title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-label-caps normal-case text-text-secondary tabular-nums">
                {year && <span>{year}</span>}
                {seasonCount > 0 && <span>{seasonCount} mùa</span>}
                {genres && (
                  <span className="border-l border-border pl-3 normal-case tracking-normal font-medium">
                    {getTranslatedGenres(genres)}
                  </span>
                )}
              </div>
              {overview && (
                <p className="mt-6 text-body leading-[1.7] text-text-primary/90 max-w-[65ch]">
                  {overview}
                </p>
              )}
              {seriesInfo?.nextMissingSeason != null && (
                <div className="mt-8">
                  <Button
                    leadingIcon={<Plus size={16} strokeWidth={1.5} aria-hidden="true" />}
                    onClick={() => addSeason(seriesInfo.nextMissingSeason!)}
                  >
                    Thêm Mùa {seriesInfo.nextMissingSeason}
                  </Button>
                </div>
              )}
            </div>
          </article>

          <section aria-labelledby="series-seasons-title" className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 id="series-seasons-title" className="text-title-md text-primary font-bold">
                Các mùa
              </h2>
              {seriesInfo && seriesInfo.badge && <Chip tone="muted">{seriesInfo.badge}</Chip>}
            </div>
            {seasonNumbers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {seasonNumbers.map((n) => {
                  const doc = docs.find((d) => getSeasonParam(d) === n);
                  const seasonMeta = effectiveSeasons.find((s) => s.season_number === n);
                  return (
                    <PosterCard
                      key={n}
                      title={title}
                      posterPath={doc?.poster_path || seasonMeta?.poster_path || headerPosterPath}
                      mediaType="tv"
                      status={doc ? doc.status || 'history' : null}
                      seasonLabel={`Mùa ${n}`}
                      meta={seasonMeta ? `${seasonMeta.episode_count} tập` : undefined}
                      onClick={() =>
                        doc ? navigate(buildMoviePath(seriesId, 'tv', n)) : addSeason(n)
                      }
                      ariaLabel={doc ? undefined : `Thêm Mùa ${n} của “${title}” vào Thư viện`}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Tv}
                title="Chưa có thông tin các mùa"
                description="TMDB chưa trả về danh sách mùa có tập cho series này."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default SeriesHub;

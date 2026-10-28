import ErrorState from '@/shared/components/ui/error-state';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CircleSlash,
  FolderPlus,
  Pencil,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import useMovieStore from '../stores/movie-store';
import useAddMovieStore from '../stores/add-movie-store';
import AlbumSelectorModal from '@/features/albums/components/album-selector-modal';
import { useMovieDetail } from '../hooks/use-movie-detail';
import { useDeleteMovie } from '../hooks/use-delete-movie';
import { useDropMovie } from '../hooks/use-drop-movie';
import {
  getMainTitle,
  getSubTitle,
  getTranslatedGenres,
  getSeasonWatchedDates,
} from '../utils/movie-utils';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { MOVIE_STATUS_LABEL } from '@/constants/movie-status';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { formatDateAny } from '@/shared/utils/date-format';
import { IconButton } from '@/shared/components/ui/icon-button';
import { SectionHeader, Chip } from '@/shared/components/ui';
import Button from '@/shared/components/ui/button';
import EmptyState from '@/shared/components/ui/empty-state';
import Skeleton from '@/shared/components/ui/skeleton';
import LoadingStatus from '@/shared/components/ui/loading-status';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';

function MovieDetailSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col md:flex-row gap-6 md:gap-10 pb-10">
      <div className="w-full max-w-[240px] md:w-[280px] shrink-0 self-center md:self-start">
        <Skeleton className="aspect-2/3 w-full rounded-poster" />
        <Skeleton className="mt-3 h-3 w-40" />
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="mt-7 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

function MovieCreditsSkeleton() {
  return (
    <div aria-busy="true" className="mt-7 border-t border-border">
      {[0, 1].map((index) => (
        <div key={index} className="flex gap-4 sm:gap-8 py-3 border-b border-border-default">
          <Skeleton className="mt-1 h-3 w-20 sm:w-24 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    movies,
    loading: collectionLoading,
    error: collectionError,
    retry: retryCollection,
  } = useMovieStore();
  const { openAddModal } = useAddMovieStore();
  const handleDelete = useDeleteMovie();
  const { dropMovie, resumeMovie, isPending } = useDropMovie();
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);

  const typeParam = searchParams.get('type');
  const movie = useMemo(() => {
    const wantedType = typeParam === 'tv' ? 'tv' : typeParam === 'movie' ? 'movie' : null;
    return movies.find(
      (m) => String(m.id) === id && (!wantedType || (m.media_type ?? 'movie') === wantedType),
    );
  }, [movies, id, typeParam]);
  const { loading: extrasLoading, credits, videos } = useMovieDetail(movie ?? null);
  const showDetailSkeleton = useDelayedSkeleton(!movie && collectionLoading);
  const showExtrasSkeleton = useDelayedSkeleton(extrasLoading && !credits);

  const mainTitle = movie ? getMainTitle(movie) : '';
  const subTitle = movie ? getSubTitle(movie) : '';
  const overview = movie?.content || movie?.review || 'Chưa có mô tả.';
  const posterUrl =
    movie?.source === 'tmdb'
      ? getTMDBImageUrl(movie.poster_path, 'w780')
      : movie?.poster_path || PLACEHOLDER_IMAGE;
  const canAddToAlbum = !!movie && (movie.status || 'history') === 'history' && !!movie.docId;
  const isDropped = movie?.status === 'dropped';
  const isWatching =
    !!movie &&
    (movie.status || 'history') === 'history' &&
    movie.media_type === 'tv' &&
    !!movie.progress &&
    !movie.progress.is_completed;
  const trailerKey = videos[0]?.key ?? '';
  // Chỉ tin key YouTube đúng định dạng để không tạo link hỏng.
  const hasValidTrailer = /^[A-Za-z0-9_-]{6,20}$/.test(trailerKey);

  const handleDeleteMovie = () => {
    if (!movie?.docId) return;
    handleDelete(movie.docId);
    navigate('/');
  };

  if (collectionError)
    return (
      <ErrorState
        title="Không tải được bộ sưu tập"
        description="Vui lòng thử lại để xem thông tin phim."
        retry={{ label: 'Thử lại', onClick: retryCollection }}
      />
    );

  if (!movie) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-5">
        <div className="flex items-center justify-between pb-4 md:pb-5">
          <IconButton label="Quay lại trang trước" onClick={() => navigate(-1)} variant="secondary">
            <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
        </div>
        {collectionLoading ? (
          <>
            <LoadingStatus>Đang tải thông tin phim…</LoadingStatus>
            {showDetailSkeleton && <MovieDetailSkeleton />}
          </>
        ) : (
          <div className="py-10">
            <EmptyState
              icon={ArrowLeft}
              title="Không tìm thấy phim trong bộ sưu tập"
              description="Phim này chưa có trong bộ sưu tập của bạn hoặc đã bị xóa."
              action={{ label: 'Về Thư viện', onClick: () => navigate('/') }}
            />
          </div>
        )}
      </div>
    );
  }

  const primaryAction =
    movie.status === 'watchlist' ? (
      hasValidTrailer ? (
        <Button
          leadingIcon={<Play size={16} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />}
          onClick={() =>
            window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank', 'noopener')
          }
        >
          Xem trailer
        </Button>
      ) : (
        <Button
          disabled
          leadingIcon={<Play size={16} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />}
        >
          Không có trailer
        </Button>
      )
    ) : isDropped ? (
      <Button
        leadingIcon={<Play size={16} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />}
        loading={isPending}
        onClick={() => void resumeMovie(movie)}
      >
        Xem tiếp
      </Button>
    ) : (
      <Button
        leadingIcon={<FolderPlus size={16} strokeWidth={1.5} aria-hidden="true" />}
        disabled={!canAddToAlbum}
        onClick={() => setShowAlbumSelector(true)}
      >
        Thêm vào album
      </Button>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-5">
      <div className="flex items-center justify-between pb-4 md:pb-5">
        <IconButton label="Quay lại trang trước" onClick={() => navigate(-1)} variant="secondary">
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        </IconButton>
      </div>

      <article
        aria-busy={collectionLoading}
        className="pb-10 flex flex-col md:flex-row gap-6 md:gap-10"
      >
        <div className="w-full max-w-[240px] md:w-[280px] shrink-0 self-center md:self-start">
          <img
            src={posterUrl}
            alt={mainTitle}
            width={280}
            height={420}
            className="w-full rounded-poster border border-border"
          />
          {movie.status !== 'watchlist' && (
            <p className="mt-3 text-micro-caps normal-case text-text-secondary flex items-center gap-1.5 tabular-nums">
              <Calendar size={12} strokeWidth={1.5} aria-hidden="true" />
              Đã xem: {formatDateAny(movie.watched_at)}
            </p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-display-xl leading-[1.02] text-text-primary">{mainTitle}</h1>
            {isDropped && <Chip tone="muted">{MOVIE_STATUS_LABEL.dropped}</Chip>}
          </div>
          {subTitle && subTitle !== mainTitle && (
            <p className="text-text-secondary text-body mt-2">{subTitle}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-label-caps normal-case text-text-secondary tabular-nums">
            {movie.release_date && <span>{new Date(movie.release_date).getFullYear()}</span>}
            {movie.media_type === 'tv'
              ? !!movie.seasons && movie.seasons > 0 && <span>{movie.seasons} mùa</span>
              : !!movie.runtime && movie.runtime > 0 && <span>{movie.runtime} phút</span>}
            {movie.genres && (
              <span className="border-l border-border pl-3 normal-case tracking-normal font-medium">
                {getTranslatedGenres(movie.genres)}
              </span>
            )}
          </div>

          {!!movie.rating && movie.rating > 0 && (
            <p className="mt-4 flex items-baseline gap-2">
              <Star
                size={18}
                strokeWidth={1.5}
                className="fill-primary text-primary self-center"
                aria-hidden="true"
              />
              <span className="text-display-lg text-primary tabular-nums">
                {movie.rating.toFixed(1)}
              </span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {primaryAction}

            {isWatching && (
              <Button
                variant="secondary"
                leadingIcon={<CircleSlash size={14} strokeWidth={1.5} aria-hidden="true" />}
                loading={isPending}
                onClick={() => void dropMovie(movie)}
              >
                Bỏ dở
              </Button>
            )}

            <Button
              variant="secondary"
              leadingIcon={<Pencil size={14} strokeWidth={1.5} aria-hidden="true" />}
              onClick={() => openAddModal({ movieToEdit: movie })}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="text-danger hover:bg-danger/10"
              leadingIcon={<Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />}
              onClick={handleDeleteMovie}
            >
              Xóa
            </Button>
          </div>

          {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
            <div className="mt-7 border border-border rounded-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2.5">
                <SectionHeader>Tiến độ xem</SectionHeader>
                {movie.progress.is_completed && <Chip tone="success">Đã xem</Chip>}
              </div>
              <p className="text-display-md text-text-primary tabular-nums">
                {movie.progress.is_completed
                  ? 'Đã xem hết'
                  : `S${movie.progress.current_season}E${movie.progress.current_episode}`}
                {!movie.progress.is_completed && movie.total_episodes && (
                  <span className="text-body-sm text-text-secondary ml-2">
                    ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                  </span>
                )}
              </p>
              <div className="mt-3 h-0.5 bg-border-default" role="presentation">
                <div
                  className="h-full w-full bg-primary origin-left transition-transform duration-250 ease-out"
                  style={{
                    transform: `scaleX(${Math.min(
                      1,
                      movie.progress.is_completed
                        ? 1
                        : (movie.progress.watched_episodes ?? 0) / (movie.total_episodes || 1),
                    )})`,
                  }}
                />
              </div>
              {getSeasonWatchedDates(movie).length >= 2 && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-micro-caps normal-case text-text-secondary tabular-nums">
                  {getSeasonWatchedDates(movie).map(({ season, date }) => (
                    <span key={season}>
                      Phần {season}:{' '}
                      {date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-7">
            <SectionHeader className="">Nội dung</SectionHeader>
            <p className="mt-2.5 text-body leading-[1.7] text-text-primary/90 max-w-[65ch]">
              {overview}
            </p>
          </div>

          {movie.review && (
            <div className="mt-6 border-l-2 border-primary pl-4">
              <SectionHeader className="flex items-center gap-1.5">
                <Star
                  size={12}
                  strokeWidth={1.5}
                  className="fill-primary text-primary"
                  aria-hidden="true"
                />
                Đánh giá của bạn
              </SectionHeader>
              <p className="mt-2 text-body leading-[1.7] text-text-primary/90 max-w-[65ch]">
                {movie.review}
              </p>
            </div>
          )}

          <LoadingStatus>{extrasLoading ? 'Đang tải dàn diễn viên…' : ''}</LoadingStatus>
          {credits ? (
            <div aria-busy={extrasLoading} className="mt-7 border-t border-border">
              {credits.crew?.some((c) => c.job === 'Director') && (
                <div className="flex gap-4 sm:gap-8 py-3 border-b border-border-default">
                  <span className="w-20 sm:w-24 shrink-0 text-label-caps text-text-secondary pt-0.5">
                    Đạo diễn
                  </span>
                  <p className="text-body text-text-primary">
                    {credits.crew
                      .filter((c) => c.job === 'Director')
                      .map((d) => d.name)
                      .join(', ')}
                  </p>
                </div>
              )}
              {credits.cast && credits.cast.length > 0 && (
                <div className="flex gap-4 sm:gap-8 py-3 border-b border-border-default">
                  <span className="w-20 sm:w-24 shrink-0 text-label-caps text-text-secondary pt-0.5">
                    Diễn viên
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-body">
                    {credits.cast.slice(0, 8).map((actor) => (
                      <Link
                        key={actor.id}
                        to={`/person/${actor.id}`}
                        className="text-text-secondary hover:text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {actor.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : extrasLoading ? (
            showExtrasSkeleton ? (
              <MovieCreditsSkeleton />
            ) : null
          ) : null}
        </div>
      </article>

      <AlbumSelectorModal
        isOpen={showAlbumSelector}
        onClose={() => setShowAlbumSelector(false)}
        movie={movie}
      />
    </div>
  );
}

export default MovieDetailPage;

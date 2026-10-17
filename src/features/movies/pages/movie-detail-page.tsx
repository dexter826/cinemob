import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,

  FolderPlus,
  Pencil,
  Play,
  Star,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import useMovieStore from '../stores/movie-store';
import useAddMovieStore from '../stores/add-movie-store';
import useAlertStore from '@/shared/stores/alert-store';
import AlbumSelectorModal from '@/features/albums/components/album-selector-modal';
import { useMovieDetail } from '../hooks/use-movie-detail';
import { useDeleteMovie } from '../hooks/use-delete-movie';
import {
  getMainTitle,
  getSubTitle,
  getTranslatedGenres,
  getSeasonWatchedDates,
} from '../utils/movie-utils';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { formatDateAny } from '@/shared/utils/date-format';
import { IconButton } from '@/shared/components/ui/icon-button';
import { SectionHeader, Chip } from '@/shared/components/ui';
import Button from '@/shared/components/ui/button';
import EmptyState from '@/shared/components/ui/empty-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';

/** Trang chi tiết phim /movie/:id — thay cho MovieDetailModal (IA đã duyệt). */
function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { movies, loading: collectionLoading } = useMovieStore();
  const { openAddModal } = useAddMovieStore();
  const { showAlert } = useAlertStore();
  const handleDelete = useDeleteMovie();
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);

  const movie = useMemo(
    () => movies.find((m) => String(m.id) === id),
    [movies, id],
  );
  const { loading: extrasLoading, credits, videos } = useMovieDetail(movie ?? null);

  const mainTitle = movie ? getMainTitle(movie) : '';
  const subTitle = movie ? getSubTitle(movie) : '';
  const overview = movie?.content || movie?.review || 'Chưa có mô tả.';
  const posterUrl =
    movie?.source === 'tmdb'
      ? getTMDBImageUrl(movie.poster_path, 'w780')
      : movie?.poster_path || PLACEHOLDER_IMAGE;
  const canAddToAlbum =
    !!movie && (movie.status || 'history') === 'history' && !!movie.docId;
  const trailerKey = videos[0]?.key ?? '';
  // Chỉ tin key YouTube đúng định dạng để không tạo link hỏng.
  const hasValidTrailer = /^[A-Za-z0-9_-]{6,20}$/.test(trailerKey);

  const confirmDelete = () => {
    if (!movie?.docId) return;
    showAlert({
      title: 'Xóa phim',
      message: `Bạn có chắc chắn muốn xóa "${mainTitle}" khỏi bộ sưu tập?`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: () => {
        handleDelete(movie.docId as string);
        navigate('/');
      },
    });
  };

  if (!movie) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-0 py-10">
        {collectionLoading ? (
          <SkeletonCard />
        ) : (
          <EmptyState
            icon={ArrowLeft}
            title="Không tìm thấy phim trong bộ sưu tập"
            description="Phim này chưa có trong bộ sưu tập của bạn hoặc đã bị xóa."
            action={{ label: 'Về Thư viện', onClick: () => navigate('/') }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      {/* Thanh trên: Back + URL (IA: trang riêng, share được) */}
      <div className="flex items-center justify-between py-4">
        <IconButton label="Quay lại trang trước" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} aria-hidden="true" />
        </IconButton>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary tabular-nums">
          /movie/{id}
        </span>
      </div>

      <article className="pb-10 flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Poster */}
        <div className="w-full max-w-[240px] md:w-[280px] shrink-0 self-center md:self-start">
          <img
            src={posterUrl}
            alt={mainTitle}
            width={280}
            height={420}
            className="w-full rounded-poster border border-border"
          />
          {movie.status !== 'watchlist' && (
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary flex items-center gap-1.5 tabular-nums">
              <Calendar size={12} aria-hidden="true" />
              Đã xem: {formatDateAny(movie.watched_at)}
            </p>
          )}
        </div>

        {/* Thông tin */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display uppercase tracking-wide leading-[1.02] text-3xl sm:text-4xl md:text-5xl text-text-primary">
            {mainTitle}
          </h1>
          {subTitle && movie.title_vi !== mainTitle && (
            <p className="text-text-secondary text-base sm:text-lg mt-2">{subTitle}</p>
          )}

          {/* Meta caps */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary tabular-nums">
            {movie.release_date && (
              <span>{new Date(movie.release_date).getFullYear()}</span>
            )}
            {movie.media_type === 'tv'
              ? !!movie.seasons && movie.seasons > 0 && <span>{movie.seasons} mùa</span>
              : !!movie.runtime && movie.runtime > 0 && <span>{movie.runtime} phút</span>}
            {movie.genres && (
              <span className="border-l border-border pl-3 normal-case tracking-normal font-medium">
                {getTranslatedGenres(movie.genres)}
              </span>
            )}
          </div>

          {/* Điểm */}
          {!!movie.rating && movie.rating > 0 && (
            <p className="mt-4 flex items-baseline gap-2">
              <Star size={18} className="fill-primary text-primary self-center" aria-hidden="true" />
              <span className="font-display text-3xl text-primary tabular-nums">
                {movie.rating.toFixed(1)}
              </span>
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {movie.status === 'watchlist' ? (
              hasValidTrailer ? (
                <Button
                  leadingIcon={<Play size={16} fill="currentColor" aria-hidden="true" />}
                  onClick={() =>
                    window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank', 'noopener')
                  }
                >
                  Xem trailer
                </Button>
              ) : (
                <Button disabled leadingIcon={<Play size={16} aria-hidden="true" />}>
                  Không có trailer
                </Button>
              )
            ) : (
              <>
                <Button
                  leadingIcon={<FolderPlus size={16} aria-hidden="true" />}
                  disabled={!canAddToAlbum}
                  onClick={() => setShowAlbumSelector(true)}
                >
                  Thêm vào Album
                </Button>
                <Button
                  variant="secondary"
                  leadingIcon={<Pencil size={14} aria-hidden="true" />}
                  onClick={() => openAddModal({ movieToEdit: movie })}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="ghost"
                  className="text-danger hover:bg-danger/10"
                  leadingIcon={<Trash2 size={14} aria-hidden="true" />}
                  onClick={confirmDelete}
                >
                  Xóa
                </Button>
              </>
            )}
          </div>

          {/* TV progress */}
          {movie.media_type === 'tv' && movie.progress && movie.status !== 'watchlist' && (
            <div className="mt-7 border border-border rounded-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2.5">
                <SectionHeader>Tiến độ xem</SectionHeader>
                {movie.progress.is_completed && (
                  <Chip tone="success">Hoàn thành</Chip>
                )}
              </div>
              <p className="font-display text-xl text-text-primary tabular-nums">
                {movie.progress.is_completed
                  ? 'Đã xem hết'
                  : `S${movie.progress.current_season}E${movie.progress.current_episode}`}
                {!movie.progress.is_completed && movie.total_episodes && (
                  <span className="font-sans font-medium text-xs text-text-secondary ml-2">
                    ({movie.progress.watched_episodes}/{movie.total_episodes} tập)
                  </span>
                )}
              </p>
              <div className="mt-3 h-0.5 bg-border-default" role="presentation">
                <div
                  className="h-full bg-primary transition-[width] duration-700 ease-out"
                  style={{
                    width: `${Math.round(
                      (movie.progress.is_completed
                        ? 1
                        : (movie.progress.watched_episodes ?? 0) / (movie.total_episodes || 1)) * 100,
                    )}%`,
                  }}
                />
              </div>
              {getSeasonWatchedDates(movie).length >= 2 && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary tabular-nums">
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

          {/* Nội dung */}
          <div className="mt-7">
            <SectionHeader className="">Nội dung</SectionHeader>
            <p className="mt-2.5 text-sm md:text-[15px] leading-[1.7] text-text-primary/90 max-w-[65ch]">
              {overview}
            </p>
          </div>

          {/* Đánh giá của bạn */}
          {movie.review && (
            <div className="mt-6 border-l-2 border-primary pl-4">
              <SectionHeader className="flex items-center gap-1.5">
                <Star size={12} className="fill-primary text-primary" aria-hidden="true" />
                Đánh giá của bạn
              </SectionHeader>
              <p className="mt-2 text-sm leading-[1.7] text-text-primary/90 max-w-[65ch]">
                {movie.review}
              </p>
            </div>
          )}

          {/* Đạo diễn + diễn viên */}
          {extrasLoading ? (
            <SectionHeader className="mt-7">Đang tải dàn diễn viên…</SectionHeader>
          ) : (
            credits && (
              <div className="mt-7 space-y-5">
                {credits.crew?.some((c) => c.job === 'Director') && (
                  <div>
                    <SectionHeader className="flex items-center gap-1.5">
                      <User size={12} aria-hidden="true" />
                      Đạo diễn
                    </SectionHeader>
                    <p className="mt-1.5 text-sm text-text-primary">
                      {credits.crew
                        .filter((c) => c.job === 'Director')
                        .map((d) => d.name)
                        .join(', ')}
                    </p>
                  </div>
                )}
                {credits.cast && credits.cast.length > 0 && (
                  <div>
                    <SectionHeader className="flex items-center gap-1.5">
                      <Users size={12} aria-hidden="true" />
                      Diễn viên
                    </SectionHeader>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {credits.cast.slice(0, 8).map((actor) => (
                        <Link
                          key={actor.id}
                          to={`/person/${actor.id}`}
                          className="border border-border rounded-control px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                          {actor.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
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

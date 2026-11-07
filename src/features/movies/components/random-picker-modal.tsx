import ErrorState from '@/shared/components/ui/error-state';
import { Dice5, Volume2, VolumeX } from 'lucide-react';
import type { Movie, TMDBMovieResult } from '@/types';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { useRandomPicker, type PoolMovie, type PoolType } from '../hooks/use-random-picker';
import Skeleton from '@/shared/components/ui/skeleton';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import EmptyState from '@/shared/components/ui/empty-state';
import { Dialog, DialogBody } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { IconButton } from '@/shared/components/ui/icon-button';
import { PickerWheel } from './random-picker/picker-wheel';
import ConfettiBurst from '@/shared/components/feedback/confetti-burst';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

const getPoolPoster = (movie: PoolMovie | undefined, poolType: PoolType): string => {
  if (!movie) return PLACEHOLDER_IMAGE;
  if (poolType === 'watchlist') {
    const watchlistMovie = movie as Movie;
    return watchlistMovie.source === 'tmdb'
      ? getTMDBImageUrl(watchlistMovie.poster_path)
      : watchlistMovie.poster_path || PLACEHOLDER_IMAGE;
  }
  return getTMDBImageUrl((movie as TMDBMovieResult).poster_path);
};

const getWheelMovie = (
  pool: PoolMovie[],
  currentIndex: number | null,
  offset: number,
): PoolMovie | undefined => {
  if (pool.length === 0 || currentIndex === null) return undefined;
  return pool[(currentIndex + offset + pool.length) % pool.length];
};

function RandomPickerModal({ isOpen, onClose, onExited }: RandomPickerModalProps) {
  const {
    activePool,
    poolType,
    currentIndex,
    isLoadingPool,
    poolError,
    retryPool,
    isShuffling,
    hasResult,
    reducedMotion,
    isMuted,
    toggleMuted,
    switchPool,
    handleRespin,
    handleWatchNow,
  } = useRandomPicker({ isOpen, onClose });
  const hasPool = activePool.length > 0;
  const currentItem = hasPool && currentIndex !== null ? activePool[currentIndex] : null;
  const title = currentItem
    ? poolType === 'watchlist'
      ? (currentItem as Movie).title
      : (currentItem as TMDBMovieResult).title || (currentItem as TMDBMovieResult).name || ''
    : '';
  const showConfetti = hasResult && !reducedMotion;
  const showSkeleton = useDelayedSkeleton(isLoadingPool && !hasPool);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="random-picker-title"
      descriptionId="random-picker-description"
      presentation="dialog"
      onExitComplete={onExited}
    >
      <DialogBody className="relative">
        <div className="relative flex flex-col gap-4">
          {showConfetti && <ConfettiBurst />}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <div
                aria-hidden="true"
                className="flex items-center justify-center text-primary shrink-0"
              >
                <Dice5 size={18} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 id="random-picker-title" className="text-title-md text-text-primary">
                  Không biết xem gì?
                </h2>
                <p id="random-picker-description" className="text-body-sm text-text-secondary">
                  Để CineMOB chọn ngẫu nhiên cho bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!reducedMotion && hasPool && (
                <IconButton
                  label={isMuted ? 'Bật âm thanh quay số' : 'Tắt âm thanh quay số'}
                  onClick={toggleMuted}
                  variant="ghost"
                >
                  {isMuted ? (
                    <VolumeX size={18} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Volume2 size={18} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </IconButton>
              )}
              <IconButton
                label="Đóng hộp thoại chọn phim ngẫu nhiên"
                onClick={onClose}
                variant="ghost"
              >
                <span aria-hidden="true" className="text-title-md leading-none">
                  ×
                </span>
              </IconButton>
            </div>
          </div>

          <div className="relative z-10">
            {!isLoadingPool && (
              <div
                className="mb-4 flex items-center justify-center gap-2"
                role="group"
                aria-label="Chọn nguồn quay ngẫu nhiên"
              >
                {(
                  [
                    { key: 'watchlist', label: 'Sẽ xem' },
                    { key: 'trending', label: 'Thịnh hành' },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={isShuffling}
                    onClick={() => void switchPool(key)}
                    aria-pressed={poolType === key}
                    className={`px-4 py-1.5 rounded-full text-body-sm font-bold border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-ring focus-visible:outline-none ${
                      poolType === key
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {isLoadingPool && !hasPool ? (
              showSkeleton ? (
                <div aria-busy="true" className="py-10">
                  <div className="flex items-center justify-center gap-3">
                    <Skeleton className="h-40 w-28 rounded-poster" />
                    <Skeleton className="h-56 w-40 rounded-poster" />
                    <Skeleton className="h-40 w-28 rounded-poster" />
                  </div>
                  <Skeleton className="mx-auto mt-6 h-5 w-48" />
                </div>
              ) : null
            ) : poolError && !hasPool ? (
              <ErrorState
                title={poolError}
                description="Vui lòng thử tải lại."
                retry={{ label: 'Thử lại', onClick: retryPool }}
                compact
              />
            ) : !hasPool ? (
              <EmptyState
                icon={Dice5}
                title="Không tìm thấy phim"
                description="Danh sách Sẽ xem đang trống và không thể tải phim thịnh hành."
                action={{ label: 'Thử lại', onClick: retryPool }}
                compact
              />
            ) : (
              <PickerWheel
                leftSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, -1), poolType)}
                centerSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 0), poolType)}
                rightSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 1), poolType)}
                poolLabel={
                  poolType === 'watchlist' ? 'Từ danh sách Sẽ xem của bạn' : 'Phim thịnh hành'
                }
                title={title}
                isShuffling={isShuffling}
                showTitle={!isShuffling && currentIndex !== null}
                hasResult={hasResult}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 relative z-10">
            <Button
              variant="secondary"
              onClick={handleRespin}
              disabled={!hasPool || isLoadingPool || isShuffling}
              leadingIcon={<Dice5 size={18} strokeWidth={1.5} aria-hidden="true" />}
              className="flex-1"
            >
              Chọn lại
            </Button>
            <Button
              variant="primary"
              onClick={handleWatchNow}
              disabled={!hasPool || isLoadingPool || currentIndex === null || isShuffling}
              className="flex-1"
            >
              {poolType === 'trending' ? 'Thêm vào thư viện' : 'Xem ngay'}
            </Button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default RandomPickerModal;

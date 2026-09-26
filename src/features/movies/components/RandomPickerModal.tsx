import Lottie from 'lottie-react';
import { Dice5 } from 'lucide-react';
import type { Movie, TMDBMovieResult } from '@/types';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '../utils/movieUtils';
import { useRandomPicker, type PoolMovie, type PoolType } from '../hooks/useRandomPicker';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { PickerWheel } from './random-picker/PickerWheel';

interface RandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getPoolPoster = (movie: PoolMovie | undefined, poolType: PoolType): string => {
  if (!movie) return PLACEHOLDER_IMAGE;
  if (poolType === 'watchlist') {
    const watchlistMovie = movie as Movie;
    return watchlistMovie.source === 'tmdb' ? getTMDBImageUrl(watchlistMovie.poster_path) : watchlistMovie.poster_path || PLACEHOLDER_IMAGE;
  }
  return getTMDBImageUrl((movie as TMDBMovieResult).poster_path);
};

const getWheelMovie = (pool: PoolMovie[], currentIndex: number | null, offset: number): PoolMovie | undefined => {
  if (pool.length === 0 || currentIndex === null) return undefined;
  return pool[(currentIndex + offset + pool.length) % pool.length];
};

function RandomPickerModal({ isOpen, onClose }: RandomPickerModalProps) {
  const {
    activePool, poolType, currentIndex, isLoadingPool, isShuffling, hasResult,
    confettiData, reducedMotion, handleRespin, handleWatchNow,
  } = useRandomPicker({ isOpen, onClose });
  const hasPool = activePool.length > 0;
  const currentItem = hasPool && currentIndex !== null ? activePool[currentIndex] : null;
  const title = currentItem
    ? poolType === 'watchlist' ? (currentItem as Movie).title : (currentItem as TMDBMovieResult).title || (currentItem as TMDBMovieResult).name || ''
    : '';
  const showConfetti = hasResult && !reducedMotion && confettiData !== null;

  return (
    <Dialog open={isOpen} onClose={onClose} titleId="random-picker-title" descriptionId="random-picker-description" presentation="dialog">
      <div className="relative flex flex-col gap-4 p-6">
        {showConfetti && <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90"><Lottie animationData={confettiData} loop={false} /></div>}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div aria-hidden="true" className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Dice5 size={18} /></div>
            <div className="min-w-0">
              <h2 id="random-picker-title" className="text-lg font-semibold text-text-primary">Không biết xem gì?</h2>
              <p id="random-picker-description" className="text-xs text-text-secondary">Để CineMOB chọn ngẫu nhiên cho bạn</p>
            </div>
          </div>
          <IconButton label="Đóng chọn phim ngẫu nhiên" onClick={onClose} variant="ghost"><span aria-hidden="true" className="text-lg leading-none">×</span></IconButton>
        </div>

        <div className="relative z-10">
          {isLoadingPool && <div className="py-10"><Loading fullScreen={false} text="Đang chuẩn bị danh sách đề xuất…" /></div>}
          {!isLoadingPool && !hasPool && <EmptyState icon={Dice5} title="Không tìm thấy phim" description="Hiện chưa có phim trong watchlist và không lấy được danh sách thịnh hành để quay ngẫu nhiên." compact />}
          {!isLoadingPool && hasPool && <PickerWheel
            leftSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, -1), poolType)}
            centerSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 0), poolType)}
            rightSrc={getPoolPoster(getWheelMovie(activePool, currentIndex, 1), poolType)}
            poolLabel={poolType === 'watchlist' ? 'Từ Watchlist của bạn' : 'Phim thịnh hành'}
            title={title}
            isShuffling={isShuffling}
            showTitle={!isShuffling && currentIndex !== null}
            hasResult={hasResult}
          />}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 relative z-10">
          <Button variant="secondary" onClick={handleRespin} disabled={!hasPool || isLoadingPool || isShuffling} leadingIcon={<Dice5 size={18} aria-hidden="true" />} className="flex-1">Quay lại</Button>
          <Button variant="primary" onClick={handleWatchNow} disabled={!hasPool || isLoadingPool || currentIndex === null || isShuffling} className="flex-1">Xem ngay</Button>
        </div>
      </div>
    </Dialog>
  );
}

export default RandomPickerModal;

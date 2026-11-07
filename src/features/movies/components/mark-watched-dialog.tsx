import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMarkWatchedStore from '../stores/mark-watched-store';
import useToastStore from '@/shared/stores/toast-store';
import { addMovie, updateMovie } from '../services/movie-service';
import { getMovieDetails } from '@/features/search/services/tmdb';
import { translateCountries } from '@/constants/countries';
import { MESSAGES } from '@/constants/messages';
import { getMainTitle, getSubTitle } from '../utils/movie-utils';
import { formatDateInput, formatTimeInput } from '../utils/movie-form-utils';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { Dialog, DialogBody, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import RatingSection from './add-movie/rating-section';
import DatePicker from '@/shared/components/ui/date-picker';
import TimePicker from '@/shared/components/ui/time-picker';
import { Movie } from '@/types';

function MarkWatchedDialog() {
  const { user } = useAuth();
  const { isOpen, target, ownerUid, closeMarkWatched } = useMarkWatchedStore();
  const { showToast } = useToastStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [date, setDate] = useState(() => formatDateInput(new Date()));
  const [time, setTime] = useState(() => formatTimeInput(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const ratingRef = useRef<HTMLDivElement>(null);

  const movie: Movie | null = target?.kind === 'library' ? target.movie : null;
  const mediaType = target?.kind === 'tmdb' ? target.media_type : (movie?.media_type ?? 'movie');
  const title = target
    ? target.kind === 'library'
      ? getMainTitle(target.movie)
      : target.title
    : '';
  const subTitle = target?.kind === 'library' ? getSubTitle(target.movie) : '';
  const posterPath = target
    ? target.kind === 'library'
      ? target.movie.poster_path
      : target.poster_path
    : '';
  const posterSrc =
    target?.kind === 'library' && movie?.source === 'manual'
      ? posterPath || ''
      : getTMDBImageUrl(posterPath, 'w200');
  const isTV = mediaType === 'tv';

  // Reset form mỗi lần mở để lần sau không dính dữ liệu cũ.
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setRatingError(null);
      setDate(formatDateInput(new Date()));
      setTime(formatTimeInput(new Date()));
      setIsSubmitting(false);
    }
  }, [isOpen, target]);

  if (!target || !isOpen || ownerUid !== user?.uid) return null;

  const handleSubmit = async () => {
    if (submitLock.current) return;
    if (rating < 1) {
      setRatingError(MESSAGES.MOVIE.REQUIRED_RATING);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    const [y, m, d] = date.split('-').map(Number);
    const [h, min] = time.split(':').map(Number);
    const watchedAt = new Date(y, m - 1, d, h || 0, min || 0, 0);
    try {
      if (target.kind === 'library' && movie?.docId) {
        const updates: Partial<Movie> = {
          status: 'history',
          rating,
          watched_at: watchedAt,
        };
        // Đánh dấu đã xem series coi như hoàn thành toàn bộ tập.
        if (isTV && movie.progress) {
          updates.progress = {
            ...movie.progress,
            is_completed: true,
            watched_episodes: movie.total_episodes || movie.progress.watched_episodes,
          };
        }
        await updateMovie(movie.docId, updates);
      } else if (target.kind === 'tmdb') {
        const details = await getMovieDetails(Number(target.id), mediaType);
        if (!details) throw new Error('TMDB details unavailable');
        await addMovie({
          uid: user!.uid,
          id: Number(target.id),
          title: details.title || details.name || target.title,
          title_vi: '',
          poster_path: details.poster_path || target.poster_path,
          runtime: details.runtime || details.episode_run_time?.[0] || 0,
          seasons: details.number_of_seasons || 0,
          watched_at: watchedAt,
          status: 'history',
          rating,
          review: '',
          tagline: details.tagline || '',
          genres: details.genres?.map((g) => g.name).join(', ') || '',
          release_date: details.release_date || details.first_air_date || target.release_date || '',
          country: translateCountries(
            details.production_countries?.map((c) => c.name).join(', ') || '',
          ),
          content: details.overview || '',
          source: 'tmdb',
          media_type: mediaType,
        });
      } else {
        return;
      }
      showToast(MESSAGES.MOVIE.MARK_WATCHED_SUCCESS(title), 'success');
      closeMarkWatched();
    } catch {
      showToast(MESSAGES.MOVIE.SAVE_ERROR, 'error');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={closeMarkWatched} titleId="mark-watched-title" presentation="sheet">
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <span className="w-12 h-[72px] rounded-control overflow-hidden border border-border shrink-0 block">
            <img
              src={posterSrc}
              alt=""
              width={200}
              height={300}
              className="w-full h-full object-cover"
            />
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-label-caps text-primary mb-1 block">Đánh dấu đã xem</span>
            <h2
              id="mark-watched-title"
              className="text-display-md text-text-primary truncate tracking-tight"
            >
              {title}
            </h2>
            {subTitle && (
              <p className="text-body-sm text-text-secondary truncate mt-0.5">{subTitle}</p>
            )}
          </div>
        </div>
      </div>

      <DialogBody className="space-y-5">
        {isTV && (
          <p className="text-body-sm text-text-secondary border border-border rounded-control p-3">
            Series sẽ được ghi nhận là đã xem hết toàn bộ tập.
          </p>
        )}
        <div className="space-y-2">
          <RatingSection
            rating={rating}
            hoverRating={hoverRating}
            isAnimating={isAnimating}
            setRating={(value) => {
              setRating(value);
              setRatingError(null);
            }}
            setHoverRating={setHoverRating}
            ratingRef={ratingRef}
          />
          {ratingError && (
            <p role="alert" className="text-body-sm text-danger ml-1">
              {ratingError}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="mark-watched-date"
              className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
            >
              <Calendar size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
              Ngày xem
            </label>
            <DatePicker
              id="mark-watched-date"
              value={date}
              onChange={setDate}
              placeholder="Chọn ngày…"
              popupMode="dialog"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="mark-watched-time"
              className="text-label-caps text-text-primary flex items-center gap-2 ml-1"
            >
              <Clock size={14} strokeWidth={1.5} className="text-primary" aria-hidden="true" />
              Giờ xem
            </label>
            <TimePicker
              id="mark-watched-time"
              value={time}
              onChange={setTime}
              placeholder="Chọn giờ…"
              popupMode="dialog"
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={closeMarkWatched} disabled={isSubmitting}>
          Để sau
        </Button>
        <Button
          variant="primary"
          loading={isSubmitting}
          onClick={() => void handleSubmit()}
          leadingIcon={<Star size={16} strokeWidth={1.5} aria-hidden="true" />}
        >
          Đánh dấu đã xem
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default MarkWatchedDialog;

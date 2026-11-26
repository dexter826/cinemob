import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMarkWatchedStore from '../stores/mark-watched-store';
import useToastStore from '@/shared/stores/toast-store';
import { addMovie, updateMovie } from '../services/movie-service';
import {
  getMovieDetails,
  getTVSeasonDetails,
  getTVShowSeasons,
} from '@/features/search/services/tmdb';
import { MESSAGES } from '@/constants/messages';
import { getMainTitle, getSubTitle } from '../utils/movie-utils';
import { formatDateInput, formatTimeInput } from '../utils/movie-form-utils';
import { buildTMDBMovieDraft } from '../utils/tmdb-movie-draft';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import { Dialog, DialogBody, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import RatingSection from './add-movie/rating-section';
import SeasonPicker from './add-movie/season-picker';
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
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [episodesPerSeason, setEpisodesPerSeason] = useState<Record<number, number>>({});
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
      setDateError(null);
      setIsSubmitting(false);
      setCurrentSeason(1);
      setEpisodesPerSeason({});
      if (target?.kind === 'tmdb' && target.media_type === 'tv') {
        getTVShowSeasons(Number(target.id))
          .then((seasons) => {
            if (seasons && seasons.length > 0) {
              setEpisodesPerSeason(
                Object.fromEntries(seasons.map((s) => [s.season_number, s.episode_count])),
              );
            }
          })
          .catch(() => {
            showToast(MESSAGES.COMMON.LOAD_ERROR, 'error');
          });
      }
    }
  }, [isOpen, target, showToast]);

  if (!target || !isOpen || ownerUid !== user?.uid) return null;

  const createTMDBDraft = async (watchedAt: Date): Promise<Omit<Movie, 'docId'> | null> => {
    if (target.kind !== 'tmdb') return null;
    const details = await getMovieDetails(Number(target.id), mediaType);
    if (!details) throw new Error('TMDB details unavailable');
    let seasonEpisodeCount: number | undefined;
    let seasonPosterPath: string | null = null;
    if (mediaType === 'tv') {
      const seasonInfo = await getTVSeasonDetails(Number(target.id), currentSeason);
      if (!seasonInfo?.episode_count) return null;
      seasonEpisodeCount = seasonInfo.episode_count;
      seasonPosterPath = seasonInfo.poster_path ?? null;
    }
    const draft = buildTMDBMovieDraft({
      uid: user!.uid,
      id: target.id,
      mediaType,
      details,
      fallbackTitle: target.title,
      fallbackPoster: target.poster_path,
      fallbackReleaseDate: target.release_date,
      status: 'history',
      rating,
      watchedAt,
      season: currentSeason,
      seasonEpisodeCount,
      seasonPosterPath,
    });
    if (mediaType === 'tv' && seasonEpisodeCount) {
      draft.progress = {
        current_episode: seasonEpisodeCount,
        watched_episodes: seasonEpisodeCount,
        is_completed: true,
      };
    }
    return draft;
  };

  const handleSubmit = async () => {
    if (submitLock.current) return;
    if (rating < 1) {
      setRatingError(MESSAGES.MOVIE.REQUIRED_RATING);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      return;
    }
    if (!date) {
      setDateError('Chọn ngày xem trước khi lưu.');
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
        if (isTV) {
          const total = movie.total_episodes || 0;
          updates.progress = {
            current_episode: total || movie.progress?.current_episode || 0,
            watched_episodes: total || movie.progress?.watched_episodes || 0,
            is_completed: true,
          };
        }
        await updateMovie(movie.docId, updates);
      } else if (target.kind === 'tmdb') {
        const draft = await createTMDBDraft(watchedAt);
        if (!draft) {
          showToast(MESSAGES.MOVIE.SAVE_ERROR, 'error');
          return;
        }
        await addMovie(draft);
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
    <Dialog
      open={isOpen}
      onClose={closeMarkWatched}
      titleId="mark-watched-title"
      presentation="sheet"
    >
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
          <div className="border border-border rounded-control p-3 space-y-3">
            <p className="text-body-sm text-text-secondary">
              Toàn bộ tập của Mùa được chọn sẽ ghi nhận là đã xem.
            </p>
            {target.kind === 'tmdb' && (
              <div className="flex items-center justify-between">
                <span className="text-label-caps text-text-secondary">Mùa</span>
                <SeasonPicker
                  value={currentSeason}
                  onChange={setCurrentSeason}
                  episodesPerSeason={episodesPerSeason}
                  maxSeasons={Math.max(...Object.keys(episodesPerSeason).map(Number), 0)}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
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
            onClearRating={() => setRatingError(null)}
            describedbyId={ratingError ? 'mark-watched-rating-error' : undefined}
          />
          {ratingError && (
            <p
              id="mark-watched-rating-error"
              role="alert"
              className="text-body-sm text-danger ml-1"
            >
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
              onChange={(value) => {
                setDate(value);
                setDateError(null);
              }}
              placeholder="Chọn ngày…"
              popupMode="dialog"
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? 'mark-watched-date-error' : undefined}
            />
            {dateError && (
              <p
                id="mark-watched-date-error"
                role="alert"
                className="text-body-sm text-danger ml-1"
              >
                {dateError}
              </p>
            )}
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

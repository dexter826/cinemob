import { auth } from '@/shared/lib/firebase';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useAddMovieStore from '../stores/add-movie-store';
import useToastStore from '@/shared/stores/toast-store';
import { addMovie, updateMovie } from '../services/movie-service';
import { Movie, MovieStatus } from '@/types';

import { MESSAGES } from '@/constants/messages';
import { normalizeDate } from '@/shared/utils/date-format';
import {
  buildEmptyMovieForm,
  buildMovieFormFrom,
  toDateTimeInput,
  type MovieFormData,
} from '../utils/movie-form-utils';
import { useTVProgress } from './use-tv-progress';
import { useAlbumSync } from '@/features/albums/hooks/use-album-sync';
import { GENRE_OPTIONS } from '@/constants/genres';
import { resolveMovieStatus } from '../utils/movie-utils';
import { useTMDBLookup } from '@/features/search/hooks/use-tmdb-lookup';
import { useMovieValidation } from './use-movie-validation';

export const useAddMovieForm = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const currentUser = useRef(user);
  currentUser.current = user;
  const [detailsAttempt, setDetailsAttempt] = useState(0);
  const [readyDetails, setReadyDetails] = useState<{
    data: typeof initialData;
    uid: string | undefined;
  } | null>(null);
  const { showToast } = useToastStore();
  const { isOpen, initialData, ownerUid, generation, closeAddModal } = useAddMovieStore();

  const [formData, setFormData] = useState<MovieFormData>(() => buildEmptyMovieForm(new Date()));

  const [status, setStatus] = useState<MovieStatus>('history');
  const [manualMediaType, setManualMediaType] = useState<'movie' | 'tv'>('movie');
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  const {
    fetchDetails,
    isLoading: isTMDBLoading,
    error: detailsError,
    movieExists,
    setMovieExists,
  } = useTMDBLookup();
  const { ratingError, setRatingError, errors, isAnimating, refs, clearErrors, validate } =
    useMovieValidation();

  const isManualMode =
    !initialData?.tmdbId &&
    !initialData?.movie &&
    (!initialData?.movieToEdit || initialData?.movieToEdit?.source === 'manual');
  const isTVSeries = isManualMode
    ? manualMediaType === 'tv'
    : initialData?.mediaType === 'tv' ||
      initialData?.movie?.media_type === 'tv' ||
      initialData?.movieToEdit?.media_type === 'tv';

  const tvProgress = useTVProgress({
    movieToEdit: initialData?.movieToEdit,
    tmdbId: initialData?.tmdbId || initialData?.movie?.id,
    mediaType: (initialData?.mediaType || initialData?.movie?.media_type) as 'movie' | 'tv',
    isTVSeries,
    isOpen,
  });

  const requiresDetails = !initialData?.movieToEdit && !isManualMode;
  const detailsReady = readyDetails?.data === initialData && readyDetails?.uid === uid;
  const initialDetailsLoading =
    requiresDetails && (!detailsReady || isTMDBLoading) && !detailsError;
  const canSubmit =
    isOpen &&
    ownerUid === uid &&
    (!requiresDetails || detailsReady) &&
    !isTMDBLoading &&
    !isSubmitting &&
    !tvProgress.isLoading &&
    (!tvProgress.error || tvProgress.hasUsableSnapshot);

  const {
    setTotalEpisodes: setTvTotalEpisodes,
    setEpisodesPerSeason: setTvEpisodesPerSeason,
    setIsCompleted: setTvIsCompleted,
  } = tvProgress;

  const albumSync = useAlbumSync({
    user,
    movieToEdit: initialData?.movieToEdit,
    isOpen,
    showToast,
  });

  const initialAlbumIds = useMemo(() => {
    const docId = initialData?.movieToEdit?.docId;
    if (!docId) return [];
    return albumSync.albums
      .filter((album) => album.movieDocIds?.includes(docId))
      .map((album) => album.docId)
      .filter((id): id is string => Boolean(id));
  }, [albumSync.albums, initialData?.movieToEdit?.docId]);

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      setHoverRating(0);
      setIsTouched(false);
    }
  }, [isOpen, clearErrors]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();

    if (initialData?.movieToEdit) {
      const m = initialData.movieToEdit;
      setStatus(m.status || 'history');
      setManualMediaType(m.media_type === 'tv' ? 'tv' : 'movie');
      const d = m.status === 'watchlist' ? new Date() : normalizeDate(m.watched_at) || new Date();
      setFormData(buildMovieFormFrom(m, d));
      if (m.genres) {
        const names = m.genres.split(',').map((g) => g.trim().toLowerCase());
        setSelectedGenreIds(
          GENRE_OPTIONS.filter((opt) => names.includes(opt.name.toLowerCase())).map(
            (opt) => opt.id,
          ),
        );
      }
    } else {
      setFormData(buildEmptyMovieForm(new Date()));
      setManualMediaType('movie');
      setMovieExists(false);
      setStatus('history');
      setSelectedGenreIds([]);

      if (initialData?.tmdbId || initialData?.movie) {
        const id = initialData.tmdbId || initialData.movie?.id;
        const type = (initialData.mediaType || initialData.movie?.media_type || 'movie') as
          'movie' | 'tv';

        const initTMDB = async () => {
          if (!id) return;
          const details = await fetchDetails(id, type, currentUser.current, controller.signal);
          if (!details || controller.signal.aborted) return;
          setReadyDetails({ data: initialData, uid });

          if (type === 'tv' && details.tvInfo) {
            setTvTotalEpisodes(details.tvInfo.totalEpisodes);
            setTvEpisodesPerSeason(details.tvInfo.episodesPerSeason);
            setTvIsCompleted(true);
          }

          setFormData((prev) => ({
            ...prev,
            ...details,
          }));
          setSelectedGenreIds(details.genreIds);
        };
        initTMDB();
      }
    }
    return () => controller.abort();
  }, [
    isOpen,
    initialData,
    uid,
    detailsAttempt,
    fetchDetails,
    setMovieExists,
    setTvTotalEpisodes,
    setTvEpisodesPerSeason,
    setTvIsCompleted,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCurrent = () => {
      const modal = useAddMovieStore.getState();
      return (
        modal.isOpen &&
        modal.ownerUid === uid &&
        modal.generation === generation &&
        auth.currentUser?.uid === uid
      );
    };
    if (submitLock.current || !isCurrent()) return;
    const resolvedStatus = resolveMovieStatus(status, isTVSeries, tvProgress.isCompleted);
    if (resolvedStatus === 'history' && !albumSync.ready) return;
    if (!canSubmit || !user || !validate(isManualMode, isTVSeries, resolvedStatus, formData))
      return;

    submitLock.current = true;
    setIsSubmitting(true);
    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      const [h, min] = formData.time.split(':').map(Number);

      const resolvedMediaType: 'movie' | 'tv' = isManualMode
        ? manualMediaType
        : ((initialData?.mediaType ||
            initialData?.movie?.media_type ||
            initialData?.movieToEdit?.media_type ||
            'movie') as 'movie' | 'tv');

      const movieData: Partial<Movie> = {
        title: formData.title,
        title_vi: formData.title_vi,
        poster_path: formData.poster,
        runtime: parseInt(formData.runtime) || 0,
        seasons: Math.max(parseInt(formData.seasons) || 0, tvProgress.resolvedSeasonCount || 0),
        watched_at: resolvedStatus === 'watchlist' ? new Date() : new Date(y, m - 1, d, h, min, 0),
        status: resolvedStatus,
        rating: Number(formData.rating),
        review: formData.review,
        tagline: formData.tagline,
        genres: formData.genres,
        release_date: formData.releaseDate,
        country: formData.country,
        content: formData.content,
        is_review: formData.is_review,
        media_type: resolvedMediaType,
      };

      if (isTVSeries) {
        movieData.total_episodes = tvProgress.totalEpisodes;
        const seasonDates: Record<string, string> = {};
        for (let s = 1; s <= tvProgress.currentSeason; s++) {
          seasonDates[String(s)] = tvProgress.seasonDates[s] || formData.date;
        }
        const previousSeasonDates = initialData?.movieToEdit?.progress?.season_dates || {};
        Object.entries(previousSeasonDates).forEach(([season, iso]) => {
          if (Number(season) > tvProgress.currentSeason && iso) seasonDates[season] = iso;
        });
        movieData.progress = {
          current_season: tvProgress.currentSeason,
          current_episode: tvProgress.currentEpisode,
          watched_episodes: tvProgress.calculateWatchedEpisodes(
            tvProgress.currentSeason,
            tvProgress.currentEpisode,
            tvProgress.isCompleted,
          ),
          is_completed: tvProgress.isCompleted,
          season_dates: seasonDates,
        };
      }

      let movieDocId = initialData?.movieToEdit?.docId;
      if (movieDocId) {
        await updateMovie(movieDocId, movieData);
      } else {
        const docData = {
          ...movieData,
          uid: user.uid,
          id: initialData?.tmdbId || initialData?.movie?.id || Date.now(),
          source: initialData?.tmdbId || initialData?.movie ? 'tmdb' : ('manual' as const),
        };
        movieDocId = await addMovie(docData as Movie);
      }

      if (!isCurrent()) return;
      let albumSyncFailed = false;
      if (resolvedStatus === 'history' && movieDocId) {
        try {
          await albumSync.syncAlbums(movieDocId);
        } catch (error) {
          console.error('Album sync failed after saving movie', error);
          albumSyncFailed = true;
        }
      }

      if (!isCurrent()) return;
      const successMessage = initialData?.movieToEdit
        ? MESSAGES.MOVIE.UPDATE_SUCCESS
        : MESSAGES.MOVIE.ADD_SUCCESS;
      showToast(
        albumSyncFailed ? MESSAGES.MOVIE.ALBUM_SYNC_ERROR : successMessage,
        albumSyncFailed ? 'error' : 'success',
      );
      if (initialData?.onMovieAdded)
        initialData.onMovieAdded(initialData?.tmdbId || initialData?.movie?.id || Date.now());
      if (isCurrent()) closeAddModal();
    } catch (error) {
      if (isCurrent()) showToast(MESSAGES.MOVIE.SAVE_ERROR, 'error');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const isDirty = useMemo(() => {
    if (!initialData?.movieToEdit) return isTouched;
    const m = initialData.movieToEdit;

    const isBasicDirty =
      formData.title !== m.title ||
      formData.title_vi !== (m.title_vi || '') ||
      formData.runtime !== (m.runtime?.toString() || '') ||
      formData.seasons !== (m.seasons?.toString() || '') ||
      formData.rating !== (m.rating || 0) ||
      formData.review !== (m.review || '') ||
      formData.tagline !== (m.tagline || '') ||
      formData.genres !== (m.genres || '') ||
      formData.releaseDate !== (m.release_date || '') ||
      formData.country !== (m.country || '') ||
      formData.content !== (m.content || '') ||
      status !== (m.status || 'history') ||
      formData.is_review !== (m.is_review || false);

    const d = normalizeDate(m.watched_at) || new Date();
    const orig = toDateTimeInput(d);
    const isTimeDirty =
      status !== 'watchlist' && (formData.date !== orig.date || formData.time !== orig.time);

    let isProgressDirty = false;
    if (isTVSeries && m.progress) {
      isProgressDirty =
        tvProgress.currentSeason !== m.progress.current_season ||
        tvProgress.currentEpisode !== m.progress.current_episode ||
        tvProgress.isCompleted !== m.progress.is_completed;
    }

    let isSeasonDatesDirty = false;
    if (isTVSeries && m.progress) {
      const origDates = m.progress.season_dates || {};
      for (let s = 1; s <= tvProgress.currentSeason; s++) {
        if ((tvProgress.seasonDates[s] || formData.date) !== (origDates[String(s)] || orig.date)) {
          isSeasonDatesDirty = true;
          break;
        }
      }
    }

    const albumsDirty =
      [...albumSync.selectedAlbumIds].sort().join('\n') !== [...initialAlbumIds].sort().join('\n');

    return isBasicDirty || isTimeDirty || isProgressDirty || isSeasonDatesDirty || albumsDirty;
  }, [
    formData,
    status,
    initialData,
    isTouched,
    isTVSeries,
    tvProgress.currentSeason,
    tvProgress.currentEpisode,
    tvProgress.isCompleted,
    tvProgress.seasonDates,
    albumSync.selectedAlbumIds,
    initialAlbumIds,
  ]);

  // Bọc setter để đánh dấu người dùng đã thao tác; prefill TMDB nội bộ không tính là dirty.
  const touched =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) => {
      setIsTouched(true);
      fn(...args);
    };

  const readyToSave = canSubmit && (status !== 'history' || albumSync.ready);
  return {
    isOpen,
    initialData,
    closeAddModal,
    formData,
    setFormData: touched(setFormData),
    status,
    setStatus: touched(setStatus),
    manualMediaType,
    setManualMediaType: touched(setManualMediaType),
    isDirty,
    isSubmitting,
    movieExists,
    ratingError,
    setRatingError,
    hoverRating,
    setHoverRating,
    isAnimating,
    isLoadingDetails: initialDetailsLoading,
    initialDetailsLoading,
    detailsError: requiresDetails ? detailsError : null,
    retryDetails: () => setDetailsAttempt((n) => n + 1),
    tvProgressLoading: tvProgress.isLoading,
    tvProgressError: tvProgress.error,
    retryTVProgress: tvProgress.retry,
    canSubmit: readyToSave,
    currentSeason: tvProgress.currentSeason,
    setCurrentSeason: touched(tvProgress.setCurrentSeason),
    currentEpisode: tvProgress.currentEpisode,
    setCurrentEpisode: touched(tvProgress.setCurrentEpisode),
    isCompleted: tvProgress.isCompleted,
    setIsCompleted: touched(tvProgress.setIsCompleted),
    seasonDates: tvProgress.seasonDates,
    setSeasonDate: touched(tvProgress.setSeasonDate),
    resolvedSeasonCount: tvProgress.resolvedSeasonCount,
    totalEpisodes: tvProgress.totalEpisodes,
    episodesPerSeason: tvProgress.episodesPerSeason,
    selectedAlbumIds: albumSync.selectedAlbumIds,
    albumsLoading: albumSync.loading,
    albumsError: albumSync.error,
    retryAlbums: albumSync.retry,
    setSelectedAlbumIds: touched(albumSync.setSelectedAlbumIds),
    showCreateAlbum: albumSync.showCreateAlbum,
    setShowCreateAlbum: albumSync.setShowCreateAlbum,
    newAlbumName: albumSync.newAlbumName,
    setNewAlbumName: touched(albumSync.setNewAlbumName),
    creatingAlbum: albumSync.creatingAlbum,
    handleCreateAlbum: albumSync.handleCreateAlbum,
    handleSubmit,
    genreOptions: GENRE_OPTIONS,
    selectedGenreIds,
    setSelectedGenreIds: touched(setSelectedGenreIds),
    isManualMode,
    isTVSeries,
    albums: albumSync.albums,
    refs,
    errors,
  };
};

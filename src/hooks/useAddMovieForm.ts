import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import useAddMovieStore from '../stores/addMovieStore';
import useToastStore from '../stores/toastStore';
import { addMovie, updateMovie } from '../services/movieService';
import { Movie } from '../types';
import { normalizeMovieDate } from '../utils/movieUtils';
import { MESSAGES } from '../constants/messages';
import { useTVProgress } from './useTVProgress';
import { useAlbumSync } from './useAlbumSync';
import { GENRE_OPTIONS } from '../constants/genres';
import { useTMDBLookup } from './useTMDBLookup';
import { useMovieValidation } from './useMovieValidation';

// Quản lý form thêm/sửa phim và series.
export const useAddMovieForm = () => {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { isOpen, initialData, closeAddModal } = useAddMovieStore();

  const [formData, setFormData] = useState({
    title: '', title_vi: '', runtime: '', seasons: '', poster: '',
    date: new Date().toISOString().split('T')[0],
    time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    rating: 0, review: '', tagline: '', genres: '', releaseDate: '', country: '', content: '',
    is_review: false
  });

  const [status, setStatus] = useState<'history' | 'watchlist'>('history');
  const [manualMediaType, setManualMediaType] = useState<'movie' | 'tv'>('movie');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  const { fetchDetails, isLoading: isTMDBLoading, movieExists, setMovieExists } = useTMDBLookup();
  const { 
    ratingError, setRatingError, errors, isAnimating, refs, clearErrors, validate 
  } = useMovieValidation();

  const isManualMode = !initialData?.tmdbId && !initialData?.movie && (!initialData?.movieToEdit || initialData?.movieToEdit?.source === 'manual');
  const isTVSeries = isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv');

  const tvProgress = useTVProgress({ 
    movieToEdit: initialData?.movieToEdit, 
    tmdbId: initialData?.tmdbId || initialData?.movie?.id,
    mediaType: (initialData?.mediaType || initialData?.movie?.media_type) as 'movie' | 'tv',
    isTVSeries, 
    isOpen 
  });

  const albumSync = useAlbumSync({ user, movieToEdit: initialData?.movieToEdit, isOpen, showToast });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      setHoverRating(0);
    }
  }, [isOpen, clearErrors]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData?.movieToEdit) {
      const m = initialData.movieToEdit;
      setStatus(m.status || 'history');
      const d = normalizeMovieDate(m.watched_at) || new Date();
      setFormData({
        title: m.title, title_vi: m.title_vi || '', runtime: m.runtime?.toString() || '', seasons: m.seasons?.toString() || '', poster: m.poster_path,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        rating: m.rating || 0, review: m.review || '', tagline: m.tagline || '', genres: m.genres || '', releaseDate: m.release_date || '', country: m.country || '', content: m.content || '',
        is_review: m.is_review || false
      });
      if (m.genres) {
        const names = m.genres.split(',').map(g => g.trim().toLowerCase());
        setSelectedGenreIds(GENRE_OPTIONS.filter(opt => names.includes(opt.name.toLowerCase())).map(opt => opt.id));
      }
    } else if (initialData?.tmdbId || initialData?.movie) {
      const id = initialData.tmdbId || initialData.movie?.id;
      const type = (initialData.mediaType || initialData.movie?.media_type || 'movie') as 'movie' | 'tv';
      
      const initTMDB = async () => {
        if (!id) return;
        const details = await fetchDetails(id, type, user);
        if (!details) return;

        if (type === 'tv' && details.tvInfo) {
          tvProgress.setTotalEpisodes(details.tvInfo.totalEpisodes);
          tvProgress.setEpisodesPerSeason(details.tvInfo.episodesPerSeason);
          tvProgress.setIsCompleted(true);
        }

        const now = new Date();
        setFormData(prev => ({
          ...prev, 
          ...details,
          date: now.toISOString().split('T')[0], 
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          rating: 0, 
          review: '',
          is_review: false
        }));
        setSelectedGenreIds(details.genreIds);
      };
      initTMDB();
    } else {
      const now = new Date();
      setFormData({ 
        title: '', title_vi: '', runtime: '', seasons: '', poster: '', 
        date: now.toISOString().split('T')[0], 
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, 
        rating: 0, review: '', tagline: '', genres: '', releaseDate: '', country: '', content: '',
        is_review: false
      });
      setManualMediaType('movie'); setMovieExists(false); setStatus('history'); setSelectedGenreIds([]);
    }
  }, [isOpen, initialData, user, fetchDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate(isManualMode, isTVSeries, status, formData)) return;

    setIsSubmitting(true);
    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      const [h, min] = formData.time.split(':').map(Number);
      
      const movieData: Partial<Movie> = {
        title: formData.title,
        title_vi: formData.title_vi,
        poster_path: formData.poster,
        runtime: parseInt(formData.runtime) || 0,
        seasons: parseInt(formData.seasons) || 0,
        watched_at: status === 'history' ? new Date(y, m - 1, d, h, min, 0) : new Date(),
        status,
        rating: Number(formData.rating),
        review: formData.review,
        tagline: formData.tagline,
        genres: formData.genres,
        release_date: formData.releaseDate,
        country: formData.country,
        content: formData.content,
        is_review: formData.is_review
      };

      if (isTVSeries) {
        movieData.total_episodes = tvProgress.totalEpisodes;
        movieData.progress = {
          current_season: tvProgress.currentSeason,
          current_episode: tvProgress.currentEpisode,
          watched_episodes: tvProgress.calculateWatchedEpisodes(tvProgress.currentSeason, tvProgress.currentEpisode, tvProgress.isCompleted),
          is_completed: tvProgress.isCompleted
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
          source: (initialData?.tmdbId || initialData?.movie) ? 'tmdb' : 'manual' as const,
          media_type: isManualMode ? manualMediaType : (initialData?.mediaType || 'movie' as const),
        };
        movieDocId = await addMovie(docData as Movie);
      }

      if (status === 'history' && movieDocId) {
        await albumSync.syncAlbums(movieDocId);
      }

      showToast(initialData?.movieToEdit ? MESSAGES.MOVIE.UPDATE_SUCCESS : MESSAGES.MOVIE.ADD_SUCCESS, "success");
      if (initialData?.onMovieAdded) initialData.onMovieAdded(initialData?.tmdbId || initialData?.movie?.id || Date.now());
      closeAddModal();
    } catch (error) { 
      showToast(MESSAGES.MOVIE.SAVE_ERROR, "error"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const isDirty = useMemo(() => {
    if (!initialData?.movieToEdit) return true;
    const m = initialData.movieToEdit;
    
    const isBasicDirty = 
      formData.title !== m.title || formData.title_vi !== (m.title_vi || '') ||
      formData.runtime !== (m.runtime?.toString() || '') || formData.seasons !== (m.seasons?.toString() || '') ||
      formData.rating !== (m.rating || 0) || formData.review !== (m.review || '') ||
      formData.tagline !== (m.tagline || '') || formData.genres !== (m.genres || '') ||
      formData.releaseDate !== (m.release_date || '') || formData.country !== (m.country || '') ||
      formData.content !== (m.content || '') || status !== (m.status || 'history') ||
      formData.is_review !== (m.is_review || false);

    const d = normalizeMovieDate(m.watched_at) || new Date();
    const origDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const origTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const isTimeDirty = status === 'history' && (formData.date !== origDate || formData.time !== origTime);

    let isProgressDirty = false;
    if (isTVSeries && m.progress) {
      isProgressDirty = tvProgress.currentSeason !== m.progress.current_season ||
        tvProgress.currentEpisode !== m.progress.current_episode ||
        tvProgress.isCompleted !== m.progress.is_completed;
    }

    return isBasicDirty || isTimeDirty || isProgressDirty;
  }, [formData, status, initialData, isTVSeries, tvProgress.currentSeason, tvProgress.currentEpisode, tvProgress.isCompleted]);

  return {
    isOpen, initialData, closeAddModal, formData, setFormData, status, setStatus, manualMediaType, setManualMediaType,
    isDirty, isSubmitting, movieExists, ratingError, setRatingError, hoverRating, setHoverRating, isAnimating,
    isLoadingDetails: isTMDBLoading || tvProgress.isLoading,
    currentSeason: tvProgress.currentSeason, setCurrentSeason: tvProgress.setCurrentSeason,
    currentEpisode: tvProgress.currentEpisode, setCurrentEpisode: tvProgress.setCurrentEpisode,
    isCompleted: tvProgress.isCompleted, setIsCompleted: tvProgress.setIsCompleted,
    totalEpisodes: tvProgress.totalEpisodes, episodesPerSeason: tvProgress.episodesPerSeason,
    selectedAlbumIds: albumSync.selectedAlbumIds, setSelectedAlbumIds: albumSync.setSelectedAlbumIds,
    showCreateAlbum: albumSync.showCreateAlbum, setShowCreateAlbum: albumSync.setShowCreateAlbum,
    newAlbumName: albumSync.newAlbumName, setNewAlbumName: albumSync.setNewAlbumName,
    creatingAlbum: albumSync.creatingAlbum, handleCreateAlbum: albumSync.handleCreateAlbum,
    handleSubmit, genreOptions: GENRE_OPTIONS, selectedGenreIds, setSelectedGenreIds, isManualMode, isTVSeries,
    albums: albumSync.albums, refs, errors
  };
};

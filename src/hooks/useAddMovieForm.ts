import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import useAddMovieStore from '../stores/addMovieStore';
import useAlertStore from '../stores/alertStore';
import useToastStore from '../stores/toastStore';
import { getMovieDetails, getMovieDetailsWithLanguage, getTVShowEpisodeInfo } from '../services/tmdb';
import { addMovie, updateMovie, checkMovieExists } from '../services/movieService';
import { Movie } from '../types';
import { normalizeMovieDate } from '../utils/movieUtils';
import { MESSAGES } from '../constants/messages';
import { useTVProgress } from './useTVProgress';
import { useAlbumSync } from './useAlbumSync';
import { GENRE_OPTIONS } from '../constants/genres';
import { translateCountries } from '../constants/countries';

/** Quản lý logic form thêm/sửa phim và series. */
export const useAddMovieForm = () => {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { isOpen, initialData, closeAddModal } = useAddMovieStore();
  const { showAlert } = useAlertStore();

  // Form states
  const [formData, setFormData] = useState({
    title: '', title_vi: '', runtime: '', seasons: '', poster: '',
    date: new Date().toISOString().split('T')[0],
    time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    rating: 0, review: '', tagline: '', genres: '', releaseDate: '', country: '', content: ''
  });

  const [status, setStatus] = useState<'history' | 'watchlist'>('history');
  const [manualMediaType, setManualMediaType] = useState<'movie' | 'tv'>('movie');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [movieExists, setMovieExists] = useState(false);
  
  // Validation states
  const [ratingError, setRatingError] = useState(false);
  const [errors, setErrors] = useState({ title: false, country: false, releaseDate: false, runtime: false, seasons: false });
  const [hoverRating, setHoverRating] = useState(0);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const refs = {
    title: useRef<HTMLInputElement>(null),
    country: useRef<HTMLDivElement>(null),
    releaseDate: useRef<HTMLDivElement>(null),
    runtime: useRef<HTMLInputElement>(null),
    seasons: useRef<HTMLInputElement>(null),
    rating: useRef<HTMLDivElement>(null)
  };

  const isManualMode = !initialData?.tmdbId && !initialData?.movie && (!initialData?.movieToEdit || initialData?.movieToEdit?.source === 'manual');
  const isTVSeries = (isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv'));

  const tvProgress = useTVProgress({ 
    movieToEdit: initialData?.movieToEdit, 
    tmdbId: initialData?.tmdbId || initialData?.movie?.id,
    mediaType: (initialData?.mediaType || initialData?.movie?.media_type) as 'movie' | 'tv',
    isTVSeries, 
    isOpen 
  });

  const albumSync = useAlbumSync({ user, movieToEdit: initialData?.movieToEdit, isOpen, showToast });

  const genreOptions = GENRE_OPTIONS;
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRatingError(false);
      setErrors({ title: false, country: false, releaseDate: false, runtime: false, seasons: false });
      setHoverRating(0);
      setErrorTrigger(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData?.movieToEdit) {
      const m = initialData.movieToEdit;
      setStatus(m.status || 'history');
      const d = normalizeMovieDate(m.watched_at) || new Date();
      setFormData({
        title: m.title, title_vi: m.title_vi || '', runtime: m.runtime ? m.runtime.toString() : '', seasons: m.seasons ? m.seasons.toString() : '', poster: m.poster_path,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        rating: m.rating || 0, review: m.review || '', tagline: m.tagline || '', genres: m.genres || '', releaseDate: m.release_date || '', country: m.country || '', content: m.content || ''
      });
      if (m.genres) {
        const names = m.genres.split(',').map(g => g.trim().toLowerCase());
        setSelectedGenreIds(genreOptions.filter(opt => names.includes(opt.name.toLowerCase())).map(opt => opt.id));
      }
    } else if (initialData?.tmdbId || initialData?.movie) {
      const id = initialData.tmdbId || initialData.movie?.id;
      const type = (initialData.mediaType || initialData.movie?.media_type || 'movie') as 'movie' | 'tv';
      
      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          if (user && id) setMovieExists(await checkMovieExists(user.uid, id));
          if (!id) return;
          
          const details = await getMovieDetails(Number(id), type);
          if (!details) return;

          const originalTitle = details.title || details.name || '';
          let viTitle = '', viOverview = '';
          
          try {
            const vi = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN');
            const hasVietnamese = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
            if (vi && hasVietnamese.test(vi.title || vi.name || '')) {
              viTitle = vi.title || vi.name || '';
              viOverview = vi.overview || '';
            }
          } catch (e) { /* Bỏ qua lỗi ngôn ngữ */ }

          const runtime = details.runtime || (details.episode_run_time?.[0]) || 0;
          const seasons = details.number_of_seasons || 0;
          
          if (type === 'tv' && seasons > 0) {
            const info = await getTVShowEpisodeInfo(Number(id), seasons);
            tvProgress.setTotalEpisodes(info.total_episodes);
            tvProgress.setEpisodesPerSeason(info.episodes_per_season);
            tvProgress.setIsCompleted(true);
          }

          const now = new Date();
          setFormData(prev => ({
            ...prev, 
            title: originalTitle, title_vi: viTitle, runtime: runtime.toString(), seasons: seasons ? seasons.toString() : '', poster: details.poster_path || '',
            date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            tagline: details.tagline || '', genres: details.genres?.map(g => g.name).join(', ') || '', releaseDate: details.release_date || details.first_air_date || '',
            country: translateCountries(details.production_countries?.map(c => c.name).join(', ') || ''), 
            content: viOverview || details.overview || ''
          }));
          setSelectedGenreIds(details.genres?.map(g => g.id) || []);
        } catch (error) { 
          showToast(MESSAGES.COMMON.LOAD_ERROR, "error"); 
        } finally { 
          setIsLoadingDetails(false); 
        }
      };
      fetchDetails();
    } else {
      const now = new Date();
      setFormData({ title: '', title_vi: '', runtime: '', seasons: '', poster: '', date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, rating: 0, review: '', tagline: '', genres: '', releaseDate: '', country: '', content: '' });
      setManualMediaType('movie'); setMovieExists(false); setStatus('history'); setSelectedGenreIds([]);
    }
  }, [isOpen, initialData, user]);

  /** Cuộn đến phần tử lỗi khi validate thất bại. */
  useEffect(() => {
    if (errorTrigger > 0) {
      const errorKey = Object.keys(errors).find(k => (errors as any)[k]) || (ratingError ? 'rating' : null);
      if (errorKey && (refs as any)[errorKey]?.current) {
        (refs as any)[errorKey].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsAnimating(false); setTimeout(() => setIsAnimating(true), 10); setTimeout(() => setIsAnimating(false), 1010);
      }
    }
  }, [errorTrigger, errors, ratingError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate thủ công
    if (isManualMode) {
      const newErrors = { 
        title: !formData.title.trim(), 
        country: !formData.country.trim(), 
        releaseDate: !formData.releaseDate, 
        seasons: isTVSeries && (!formData.seasons || parseInt(formData.seasons) <= 0),
        runtime: !isTVSeries && (!formData.runtime || parseInt(formData.runtime) <= 0)
      };
      if (Object.values(newErrors).some(v => v)) { 
        setErrors(newErrors); 
        setErrorTrigger(p => p + 1); 
        showToast(MESSAGES.COMMON.REQUIRED_FIELDS, "error"); 
        return; 
      }
    }
    
    if (status === 'history' && formData.rating === 0) { 
      setRatingError(true); 
      setErrorTrigger(p => p + 1); 
      showToast(MESSAGES.MOVIE.REQUIRED_RATING, "error"); 
      return; 
    }

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
        content: formData.content
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
      formData.title !== m.title ||
      formData.title_vi !== (m.title_vi || '') ||
      formData.runtime !== (m.runtime ? m.runtime.toString() : '') ||
      formData.seasons !== (m.seasons ? m.seasons.toString() : '') ||
      formData.rating !== (m.rating || 0) ||
      formData.review !== (m.review || '') ||
      formData.tagline !== (m.tagline || '') ||
      formData.genres !== (m.genres || '') ||
      formData.releaseDate !== (m.release_date || '') ||
      formData.country !== (m.country || '') ||
      formData.content !== (m.content || '') ||
      status !== (m.status || 'history');

    const d = m.watched_at instanceof Object && 'toDate' in m.watched_at ? m.watched_at.toDate() : new Date(m.watched_at as any);
    const origDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const origTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const isTimeDirty = status === 'history' && (formData.date !== origDate || formData.time !== origTime);

    let isProgressDirty = false;
    if (isTVSeries && m.progress) {
      isProgressDirty = 
        tvProgress.currentSeason !== m.progress.current_season ||
        tvProgress.currentEpisode !== m.progress.current_episode ||
        tvProgress.isCompleted !== m.progress.is_completed;
    }

    return isBasicDirty || isTimeDirty || isProgressDirty;
  }, [formData, status, initialData, isTVSeries, tvProgress.currentSeason, tvProgress.currentEpisode, tvProgress.isCompleted]);

  return {
    isOpen, initialData, closeAddModal, formData, setFormData, status, setStatus, manualMediaType, setManualMediaType,
    isDirty, isSubmitting, movieExists, ratingError, setRatingError, hoverRating, setHoverRating, isAnimating,
    isLoadingDetails: isLoadingDetails || tvProgress.isLoading,
    currentSeason: tvProgress.currentSeason, setCurrentSeason: tvProgress.setCurrentSeason,
    currentEpisode: tvProgress.currentEpisode, setCurrentEpisode: tvProgress.setCurrentEpisode,
    isCompleted: tvProgress.isCompleted, setIsCompleted: tvProgress.setIsCompleted,
    totalEpisodes: tvProgress.totalEpisodes, episodesPerSeason: tvProgress.episodesPerSeason,
    selectedAlbumIds: albumSync.selectedAlbumIds, setSelectedAlbumIds: albumSync.setSelectedAlbumIds,
    showCreateAlbum: albumSync.showCreateAlbum, setShowCreateAlbum: albumSync.setShowCreateAlbum,
    newAlbumName: albumSync.newAlbumName, setNewAlbumName: albumSync.setNewAlbumName,
    creatingAlbum: albumSync.creatingAlbum, handleCreateAlbum: albumSync.handleCreateAlbum,
    handleSubmit, genreOptions, selectedGenreIds, setSelectedGenreIds, isManualMode, isTVSeries,
    albums: albumSync.albums, refs, errors
  };
};

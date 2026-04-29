import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import useAddMovieStore from '../stores/addMovieStore';
import useAlertStore from '../stores/alertStore';
import useToastStore from '../stores/toastStore';
import { getMovieDetails, getMovieDetailsWithLanguage, getTVShowEpisodeInfo } from '../services/tmdb';
import { addMovie, updateMovie, checkMovieExists } from '../services/movieService';
import { Movie } from '../types';
import { normalizeMovieDate } from '../utils/movieUtils';

import { useTVProgress } from './useTVProgress';
import { useAlbumSync } from './useAlbumSync';

/** Điều phối form thêm phim. */
export const useAddMovieForm = () => {
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { isOpen, initialData, closeAddModal } = useAddMovieStore();
  const { showAlert } = useAlertStore();

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

  // Sub-hooks
  const tvProgress = useTVProgress({ 
    movieToEdit: initialData?.movieToEdit, 
    tmdbId: initialData?.tmdbId || initialData?.movie?.id,
    mediaType: (initialData?.mediaType || initialData?.movie?.media_type) as 'movie' | 'tv',
    isTVSeries, 
    isOpen 
  });

  const albumSync = useAlbumSync({ user, movieToEdit: initialData?.movieToEdit, isOpen, showToast });

  const genreOptions = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }, { id: 10759, name: 'Action & Adventure' }, { id: 10762, name: 'Kids' },
    { id: 10763, name: 'News' }, { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' }, { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' }
  ];
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
          if (id) {
            const details = await getMovieDetails(Number(id), type);
            if (details) {
              const originalTitle = details.title || details.name || '';
              let viTitle = '', viOverview = '';
              try {
                const vi = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN');
                if (vi && /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(vi.title || vi.name || '')) {
                  viTitle = vi.title || vi.name || '';
                  viOverview = vi.overview || '';
                }
              } catch (e) {}

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
                ...prev, title: originalTitle, title_vi: viTitle, runtime: runtime.toString(), seasons: seasons ? seasons.toString() : '', poster: details.poster_path || '',
                date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                tagline: details.tagline || '', genres: details.genres?.map(g => g.name).join(', ') || '', releaseDate: details.release_date || details.first_air_date || '',
                country: details.production_countries?.map(c => c.name).join(', ') || '', content: viOverview || details.overview || ''
              }));
              setSelectedGenreIds(details.genres?.map(g => g.id) || []);
            }
          }
        } catch (error) { showToast("Không thể tải thông tin", "error"); } finally { setIsLoadingDetails(false); }
      };
      fetchDetails();
    } else {
      const now = new Date();
      setFormData({ title: '', title_vi: '', runtime: '', seasons: '', poster: '', date: now.toISOString().split('T')[0], time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, rating: 0, review: '', tagline: '', genres: '', releaseDate: '', country: '', content: '' });
      setManualMediaType('movie'); setMovieExists(false); setStatus('history'); setSelectedGenreIds([]);
    }
  }, [isOpen, initialData, user]);

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
    if (isManualMode) {
      const newErrors = { 
        title: !formData.title.trim(), 
        country: !formData.country.trim(), 
        releaseDate: !formData.releaseDate, 
        seasons: isTVSeries && (!formData.seasons || parseInt(formData.seasons) <= 0),
        runtime: !isTVSeries && (!formData.runtime || parseInt(formData.runtime) <= 0)
      };
      if (Object.values(newErrors).some(v => v)) { setErrors(newErrors); setErrorTrigger(p => p + 1); showToast("Vui lòng nhập đủ thông tin", "error"); return; }
    }
    if (status === 'history' && formData.rating === 0) { setRatingError(true); setErrorTrigger(p => p + 1); showToast("Vui lòng đánh giá", "error"); return; }

    setIsSubmitting(true);
    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      const [h, min] = formData.time.split(':').map(Number);
      const movieData: any = {
        title: formData.title, title_vi: formData.title_vi, poster_path: formData.poster, runtime: parseInt(formData.runtime) || 0, seasons: parseInt(formData.seasons) || 0,
        watched_at: status === 'history' ? new Date(y, m - 1, d, h, min, 0) : new Date(),
        status, rating: Number(formData.rating), review: formData.review, tagline: formData.tagline, genres: formData.genres, release_date: formData.releaseDate, country: formData.country, content: formData.content
      };

      if (isTVSeries) {
        movieData.total_episodes = tvProgress.totalEpisodes;
        movieData.progress = {
          current_season: tvProgress.currentSeason, current_episode: tvProgress.currentEpisode,
          watched_episodes: tvProgress.calculateWatchedEpisodes(tvProgress.currentSeason, tvProgress.currentEpisode, tvProgress.isCompleted),
          is_completed: tvProgress.isCompleted
        };
      }

      let movieDocId = initialData?.movieToEdit?.docId;
      if (movieDocId) await updateMovie(movieDocId, movieData);
      else {
        movieData.uid = user.uid; movieData.id = initialData?.tmdbId || initialData?.movie?.id || Date.now();
        movieData.source = (initialData?.tmdbId || initialData?.movie) ? 'tmdb' : 'manual';
        movieData.media_type = isManualMode ? manualMediaType : (initialData?.mediaType || 'movie');
        movieDocId = await addMovie(movieData);
      }

      if (status === 'history' && movieDocId) await albumSync.syncAlbums(movieDocId);

      showToast(initialData?.movieToEdit ? "Đã cập nhật" : "Đã thêm mới", "success");
      if (initialData?.onMovieAdded) initialData.onMovieAdded(movieData.id);
      closeAddModal();
    } catch (error) { showToast("Có lỗi xảy ra", "error"); } finally { setIsSubmitting(false); }
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
    isDirty,
    isSubmitting, isLoadingDetails: isLoadingDetails || tvProgress.isLoading, movieExists, ratingError, setRatingError,
    hoverRating, setHoverRating, isAnimating,
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

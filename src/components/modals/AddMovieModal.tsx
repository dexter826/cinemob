import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Star, Save, Loader2, FolderPlus, Clock, Globe, Film, Tv, LayoutGrid, AlignLeft, Plus } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { addMovie, updateMovie, checkMovieExists } from '../../services/movieService';
import { getMovieDetails, getMovieDetailsWithLanguage, getGenres, getTVShowEpisodeInfo } from '../../services/tmdbService';
import { getDisplayTitle, getDisplayTitleForTMDB } from '../../utils/movieUtils';
import useToastStore from '../../stores/toastStore';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import useAddMovieStore from '../../stores/addMovieStore';
import Loading from '../ui/Loading';
import { subscribeToAlbums, updateAlbum, addAlbum } from '../../services/albumService';
import { Album } from '../../types';
import CustomDropdown from '../ui/CustomDropdown';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';
import { usePreventScroll } from '../../hooks/usePreventScroll';

const AddMovieModal: React.FC = () => {
  const { isOpen, closeAddModal, initialData } = useAddMovieStore();
  const { user } = useAuth();
  const { showToast } = useToastStore();

  // Country options
  const countryOptions = [
    { value: 'Việt Nam', label: 'Việt Nam' },
    { value: 'Mỹ', label: 'Mỹ' },
    { value: 'Anh', label: 'Anh' },
    { value: 'Nhật Bản', label: 'Nhật Bản' },
    { value: 'Hàn Quốc', label: 'Hàn Quốc' },
    { value: 'Trung Quốc', label: 'Trung Quốc' },
    { value: 'Pháp', label: 'Pháp' },
    { value: 'Đức', label: 'Đức' },
    { value: 'Ý', label: 'Ý' },
    { value: 'Tây Ban Nha', label: 'Tây Ban Nha' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Úc', label: 'Úc' },
    { value: 'Ấn Độ', label: 'Ấn Độ' },
    { value: 'Thái Lan', label: 'Thái Lan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Hồng Kông', label: 'Hồng Kông' },
    { value: 'Đài Loan', label: 'Đài Loan' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    title_vi: '',
    runtime: '',
    seasons: '',
    poster: '',
    date: new Date().toISOString().split('T')[0],
    time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    rating: 0,
    review: '',
    tagline: '',
    genres: '',
    releaseDate: '',
    country: '',
    content: ''
  });

  // Progress tracking states for TV series
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [episodesPerSeason, setEpisodesPerSeason] = useState<{ [season: number]: number }>({});
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [manualMediaType, setManualMediaType] = useState<'movie' | 'tv'>('movie');
  const [movieExists, setMovieExists] = useState(false);
  const [status, setStatus] = useState<'history' | 'watchlist'>('history');

  // Album selection states
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<string[]>([]);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // Genre options for MultiSelectDropdown
  const [genreOptions, setGenreOptions] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<(string | number)[]>([]);

  // Error states for highlighting
  const [ratingError, setRatingError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [releaseDateError, setReleaseDateError] = useState(false);
  const [runtimeError, setRuntimeError] = useState(false);
  const [seasonsError, setSeasonsError] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const ratingRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const releaseDateRef = useRef<HTMLInputElement>(null);
  const runtimeRef = useRef<HTMLInputElement>(null);
  const seasonsRef = useRef<HTMLInputElement>(null);

  const isManualMode = !initialData?.tmdbId && !initialData?.movie && !initialData?.movieToEdit;

  // Prevent body scroll when modal is open
  usePreventScroll(isOpen);

  // Subscribe to albums
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAlbums(user.uid, (data) => {
      setAlbums(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch genre options
  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getGenres();
      setGenreOptions(genres);
    };
    fetchGenres();
  }, []);

  // Set selectedGenreIds when genreOptions is loaded and we have TMDB data
  useEffect(() => {
    if (genreOptions.length > 0 && isOpen && (initialData?.tmdbId || initialData?.movie) && !initialData?.movieToEdit && formData.genres) {
      // This is for TMDB add mode - parse the genres string back to IDs
      const genreNames = formData.genres.split(',').map(g => g.trim());
      const matchedIds = genreOptions
        .filter(opt => genreNames.includes(opt.name))
        .map(opt => opt.id);
      if (matchedIds.length > 0) {
        setSelectedGenreIds(matchedIds);
      }
    }
  }, [genreOptions, isOpen, initialData, formData.genres]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      // Reset album selection
      setSelectedAlbumIds([]);
      setShowCreateAlbum(false);
      setNewAlbumName('');
      // Reset errors
      setRatingError(false);
      setTitleError(false);
      setCountryError(false);
      setReleaseDateError(false);
      setRuntimeError(false);
      setSeasonsError(false);
      setHoverRating(0);
      setErrorTrigger(0);
    }
  }, [isOpen]);

  // Load albums that contain the movie being edited
  useEffect(() => {
    if (isOpen && initialData?.movieToEdit && albums.length > 0) {
      const movieDocId = initialData.movieToEdit.docId;
      if (movieDocId) {
        const albumsContainingMovie = albums
          .filter(album => album.movieDocIds?.includes(movieDocId))
          .map(album => album.docId || '');
        setSelectedAlbumIds(albumsContainingMovie);
      }
    }
  }, [isOpen, initialData?.movieToEdit, albums]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      if (initialData?.movieToEdit) {
        // Edit Mode
        const m = initialData.movieToEdit;
        setStatus(m.status || 'history');
        const d = m.watched_at instanceof Object && 'toDate' in m.watched_at
          ? m.watched_at.toDate()
          : new Date(m.watched_at as any);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}`;

        setFormData({
          title: getDisplayTitle(m),
          title_vi: m.title_vi || '',
          runtime: m.runtime.toString(),
          seasons: m.seasons ? m.seasons.toString() : '',
          poster: m.poster_path,
          date: dateStr,
          time: timeStr,
          rating: m.rating || 0,
          review: m.review || '',
          tagline: m.tagline || '',
          genres: m.genres || '',
          releaseDate: m.release_date || '',
          country: m.country || '',
          content: m.content || ''
        });

        // Load progress data for TV series and fetch episode info from TMDB
        if (m.media_type === 'tv') {
          // Fetch episode info from TMDB if source is tmdb
          if (m.source === 'tmdb' && m.id && m.seasons) {
            const fetchEpisodeInfo = async () => {
              setIsLoadingDetails(true);
              try {
                const episodeInfo = await getTVShowEpisodeInfo(Number(m.id), m.seasons);
                setTotalEpisodes(episodeInfo.total_episodes);
                setEpisodesPerSeason(episodeInfo.episodes_per_season);
              } catch (error) {
                console.error('Failed to fetch episode info:', error);
                // Fallback to stored data
                setTotalEpisodes(m.total_episodes || 0);
                setEpisodesPerSeason({});
              } finally {
                setIsLoadingDetails(false);
              }
            };
            fetchEpisodeInfo();
          } else {
            // Manual entry or no TMDB data
            setTotalEpisodes(m.total_episodes || 0);
            setEpisodesPerSeason({});
          }

          if (m.progress) {
            setCurrentSeason(m.progress.current_season || 1);
            setCurrentEpisode(m.progress.current_episode || 0);
            setIsCompleted(m.progress.is_completed || false);
          } else {
            setCurrentSeason(1);
            setCurrentEpisode(0);
            setIsCompleted(false);
          }
        }

        // Parse genres string to IDs for editing
        if (m.genres && genreOptions.length > 0) {
          const genreNames = m.genres.split(',').map(g => g.trim());
          const matchedIds = genreOptions
            .filter(opt => {
              // Try exact match first
              if (genreNames.includes(opt.name)) return true;
              // Try case-insensitive match
              return genreNames.some(name =>
                name.toLowerCase() === opt.name.toLowerCase()
              );
            })
            .map(opt => opt.id);
          setSelectedGenreIds(matchedIds);
        } else {
          setSelectedGenreIds([]);
        }
      } else if (initialData?.tmdbId || initialData?.movie) {
        // Add Mode from Search or ID
        setStatus('history');
        const fetchDetails = async () => {
          setIsLoadingDetails(true);
          try {
            const id = initialData.tmdbId || initialData.movie?.id;
            const type = (initialData.mediaType || initialData.movie?.media_type || 'movie') as 'movie' | 'tv';

            // Check if movie already exists
            if (user && id) {
              const exists = await checkMovieExists(user.uid, id);
              setMovieExists(exists);
            }

            if (id) {
              const details = await getMovieDetails(Number(id), type);
              let displayTitle = '';
              let vietnameseTitle = '';
              let vietnameseOverview = '';
              if (details) {
                const originalTitle = details.title || details.name || '';
                // Always try to fetch Vietnamese translation
                try {
                  const viDetails = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN');
                  if (viDetails) {
                    vietnameseTitle = viDetails.title || viDetails.name || '';
                    vietnameseOverview = viDetails.overview || '';
                  }
                } catch (error) {
                  // Ignore if no Vietnamese translation available
                }
                displayTitle = vietnameseTitle ? `${originalTitle} (${vietnameseTitle})` : originalTitle;

                const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || 0;
                const seasons = details.number_of_seasons || 0;
                const tagline = details.tagline || '';
                // Keep genres in English as returned by TMDB
                const genres = details.genres?.map(g => g.name).join(', ') || '';
                const releaseDate = details.release_date || details.first_air_date || '';
                const country = details.production_countries?.map(c => c.name).join(', ') || '';
                const content = vietnameseOverview || details.overview || '';

                // Set selected genre IDs for dropdown (only if genreOptions is loaded)
                if (genreOptions.length > 0) {
                  const genreIds = details.genres?.map(g => g.id) || [];
                  setSelectedGenreIds(genreIds);
                }

                // Fetch episode info for TV series
                if (type === 'tv' && seasons > 0) {
                  const episodeInfo = await getTVShowEpisodeInfo(Number(id), seasons);
                  setTotalEpisodes(episodeInfo.total_episodes);
                  setEpisodesPerSeason(episodeInfo.episodes_per_season);
                  setCurrentSeason(1);
                  setCurrentEpisode(0);
                  setIsCompleted(true);
                }

                const now = new Date();
                setFormData(prev => ({
                  ...prev,
                  title: displayTitle,
                  title_vi: vietnameseTitle,
                  runtime: runtime.toString(),
                  seasons: seasons ? seasons.toString() : '',
                  poster: details.poster_path || '',
                  date: now.toISOString().split('T')[0],
                  time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                  rating: 0,
                  review: '',
                  tagline: tagline,
                  genres: genres,
                  releaseDate: releaseDate,
                  country: country,
                  content: content
                }));
              }
            }
          } catch (error) {
            console.error("Failed to fetch details", error);
            showToast("Không thể tải thông tin phim", "error");
          } finally {
            setIsLoadingDetails(false);
          }
        };
        fetchDetails();
      } else {
        // Manual Add Mode (Reset)
        const now = new Date();
        setFormData({
          title: '',
          title_vi: '',
          runtime: '',
          seasons: '',
          poster: '',
          date: now.toISOString().split('T')[0],
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          rating: 0,
          review: '',
          tagline: '',
          genres: '',
          releaseDate: '',
          country: '',
          content: ''
        });
        setManualMediaType('movie');
        setMovieExists(false);
        setStatus('history');
        setSelectedGenreIds([]);
        setTotalEpisodes(0);
        setEpisodesPerSeason({});
        setCurrentSeason(1);
        setCurrentEpisode(0);
        setIsCompleted(true);
      }
    }
  }, [isOpen, initialData, user, genreOptions]);

  // Scroll to error section when error occurs
  useEffect(() => {
    if (errorTrigger > 0) {
      let targetRef: HTMLElement | null = null;
      if (titleError && titleRef.current) {
        targetRef = titleRef.current;
      } else if (countryError && countryRef.current) {
        targetRef = countryRef.current;
      } else if (releaseDateError && releaseDateRef.current) {
        targetRef = releaseDateRef.current;
      } else if (runtimeError && runtimeRef.current) {
        targetRef = runtimeRef.current;
      } else if (seasonsError && seasonsRef.current) {
        targetRef = seasonsRef.current;
      } else if (ratingError && ratingRef.current) {
        targetRef = ratingRef.current;
      }
      if (targetRef) {
        targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsAnimating(false);
        setTimeout(() => setIsAnimating(true), 10);
        setTimeout(() => setIsAnimating(false), 1010);
      }
    }
  }, [errorTrigger, titleError, countryError, releaseDateError, runtimeError, seasonsError, ratingError]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !user) return;

    try {
      setCreatingAlbum(true);
      const newAlbumId = await addAlbum({
        uid: user.uid,
        name: newAlbumName.trim(),
        movieDocIds: [],
      });
      showToast(`Đã tạo album "${newAlbumName}"`, 'success');
      setSelectedAlbumIds([...selectedAlbumIds, newAlbumId]);
      setNewAlbumName('');
      setShowCreateAlbum(false);
    } catch (error) {
      showToast('Tạo album thất bại', 'error');
    } finally {
      setCreatingAlbum(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const isHistory = status === 'history';

    // Validate required fields for manual mode
    if (isManualMode) {
      if (!formData.title.trim()) {
        setTitleError(true);
        setErrorTrigger(prev => prev + 1);
        showToast("Vui lòng nhập tên phim", "error");
        return;
      }
      if (!formData.country.trim()) {
        setCountryError(true);
        setErrorTrigger(prev => prev + 1);
        showToast("Vui lòng chọn quốc gia", "error");
        return;
      }
      if (!formData.releaseDate) {
        setReleaseDateError(true);
        setErrorTrigger(prev => prev + 1);
        showToast("Vui lòng nhập ngày phát hành", "error");
        return;
      }
      const isTv = manualMediaType === 'tv';
      if (isTv && (!formData.seasons || parseInt(formData.seasons) <= 0)) {
        setSeasonsError(true);
        setErrorTrigger(prev => prev + 1);
        showToast("Vui lòng nhập số phần hợp lệ", "error");
        return;
      }
      if (!isTv && (!formData.runtime || parseInt(formData.runtime) <= 0)) {
        setRuntimeError(true);
        setErrorTrigger(prev => prev + 1);
        showToast("Vui lòng nhập thời lượng hợp lệ", "error");
        return;
      }
    }

    // Check if rating is required (when recording movies)
    if (isHistory && formData.rating === 0) {
      setRatingError(true);
      setErrorTrigger(prev => prev + 1);
      showToast("Vui lòng đánh giá phim", "error");
      return;
    }

    // Validate: watched date must be after release date
    if (isHistory && formData.releaseDate) {
      const [y, m, d] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const watchedDate = new Date(y, m - 1, d, hours, minutes, 0);

      const [ry, rm, rd] = formData.releaseDate.split('-').map(Number);
      const releaseDate = new Date(ry, rm - 1, rd, 0, 0, 0);

      if (watchedDate <= releaseDate) {
        showToast("Ngày xem phải sau ngày phát hành", "error");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const watchedDate = isHistory
        ? new Date(y, m - 1, d, hours, minutes, 0)
        : new Date();
      const isTv = initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || (initialData?.movieToEdit?.media_type === 'tv') || (isManualMode && manualMediaType === 'tv');

      // Parse title and title_vi if title contains parentheses
      let parsedTitle = formData.title;
      let parsedTitleVi = formData.title_vi;
      if (formData.title.includes('(') && formData.title.includes(')')) {
        const match = formData.title.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
          parsedTitle = match[1].trim();
          parsedTitleVi = match[2].trim();
        }
      }

      // Calculate watched episodes for TV series
      let watchedEpisodes = 0;
      if (isTv && !isCompleted) {
        // Calculate total episodes watched up to current season and episode
        for (let s = 1; s < currentSeason; s++) {
          watchedEpisodes += episodesPerSeason[s] || 0;
        }
        watchedEpisodes += currentEpisode;
      } else if (isTv && isCompleted) {
        watchedEpisodes = totalEpisodes;
      }

      if (initialData?.movieToEdit && initialData.movieToEdit.docId) {
        // Update Existing
        const updateData: any = {
          title: parsedTitle,
          title_vi: parsedTitleVi,
          runtime: parseInt(formData.runtime) || 0,
          seasons: parseInt(formData.seasons) || 0,
          poster_path: formData.poster,
          watched_at: watchedDate,
          status,
          rating: Number(formData.rating),
          review: formData.review,
          tagline: formData.tagline,
          genres: formData.genres,
          release_date: formData.releaseDate,
          country: formData.country,
          content: formData.content
        };

        // Add progress for TV series
        if (isTv) {
          updateData.total_episodes = totalEpisodes;
          updateData.progress = {
            current_season: currentSeason,
            current_episode: currentEpisode,
            watched_episodes: watchedEpisodes,
            is_completed: isCompleted
          };
        }

        await updateMovie(initialData.movieToEdit.docId, updateData);

        // Update album associations for edit mode
        if (isHistory) {
          try {
            const movieDocId = initialData.movieToEdit.docId;

            // Find albums that previously contained this movie
            const previousAlbums = albums.filter(album =>
              album.movieDocIds?.includes(movieDocId)
            );

            // Remove movie from albums that are no longer selected
            for (const album of previousAlbums) {
              if (album.docId && !selectedAlbumIds.includes(album.docId)) {
                const newIds = (album.movieDocIds || []).filter(id => id !== movieDocId);
                await updateAlbum(album.docId, { movieDocIds: newIds });
              }
            }

            // Add movie to newly selected albums
            for (const albumId of selectedAlbumIds) {
              const album = albums.find(a => a.docId === albumId);
              if (album && album.docId && !album.movieDocIds?.includes(movieDocId)) {
                const newIds = Array.from(new Set([...(album.movieDocIds || []), movieDocId]));
                await updateAlbum(album.docId, { movieDocIds: newIds });
              }
            }
          } catch (error) {
            console.error('Error updating albums:', error);
          }
        }

        showToast("Đã cập nhật phim", "success");
      } else {
        // Add New
        const usedId = initialData?.tmdbId || initialData?.movie?.id || Date.now();
        const movieData: any = {
          uid: user.uid,
          id: usedId,
          title: parsedTitle,
          title_vi: parsedTitleVi,
          poster_path: formData.poster,
          runtime: parseInt(formData.runtime) || 0,
          seasons: parseInt(formData.seasons) || 0,
          watched_at: watchedDate,
          source: (initialData?.tmdbId || initialData?.movie) ? 'tmdb' : 'manual',
          media_type: isManualMode ? manualMediaType : (initialData?.mediaType || 'movie'),
          status,
          rating: Number(formData.rating),
          review: formData.review,
          tagline: formData.tagline,
          genres: formData.genres,
          release_date: formData.releaseDate,
          country: formData.country,
          content: formData.content
        };

        // Add progress for TV series
        if (isTv) {
          movieData.total_episodes = totalEpisodes;
          movieData.progress = {
            current_season: currentSeason,
            current_episode: currentEpisode,
            watched_episodes: watchedEpisodes,
            is_completed: isCompleted
          };
        }

        const movieDocId = await addMovie(movieData);

        // Add to selected albums if status is history
        if (isHistory && selectedAlbumIds.length > 0 && movieDocId) {
          try {
            for (const albumId of selectedAlbumIds) {
              const album = albums.find(a => a.docId === albumId);
              if (album && album.docId) {
                const newIds = Array.from(new Set([...(album.movieDocIds || []), movieDocId]));
                await updateAlbum(album.docId, { movieDocIds: newIds });
              }
            }

            if (selectedAlbumIds.length === 1) {
              showToast("Đã thêm phim và lưu vào album", "success");
            } else {
              showToast(`Đã thêm phim và lưu vào ${selectedAlbumIds.length} album`, "success");
            }
          } catch (error) {
            console.error('Error adding to albums:', error);
            showToast("Đã thêm phim nhưng không thể thêm vào album", "error");
          }
        } else {
          showToast("Đã thêm phim mới", "success");
        }

        if (initialData?.onMovieAdded) {
          initialData.onMovieAdded(usedId);
        }
      }
      closeAddModal();
    } catch (error) {
      console.error(error);
      showToast("Có lỗi xảy ra", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/95 backdrop-blur shrink-0">
          <h2 className="text-xl font-bold text-text-main">
            {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
          <button onClick={closeAddModal} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-text-muted hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {isLoadingDetails ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-text-muted min-h-[400px]">
              <Loading fullScreen={false} size={40} />
              <p>Đang tải thông tin...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">

              {/* LEFT COLUMN: Visuals & Core Status */}
              <div className="md:col-span-4 space-y-6">
                {/* Poster */}
                <div className="aspect-2/3 rounded-xl overflow-hidden bg-black/20 border border-white/10 relative shadow-lg group">
                  {formData.poster ? (
                    <img
                      src={formData.poster.startsWith('http') ? formData.poster : `${TMDB_IMAGE_BASE_URL}${formData.poster}`}
                      alt="Poster"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
                      <LayoutGrid size={40} className="opacity-20" />
                      <span className="text-sm">No Poster</span>
                    </div>
                  )}
                  {/* Rating Overlay if History */}
                  {status === 'history' && formData.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-white font-bold text-sm">{formData.rating}</span>
                    </div>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl flex">
                  <button
                    type="button"
                    onClick={() => setStatus('history')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${status === 'history'
                      ? 'bg-surface shadow-sm text-primary'
                      : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                  >
                    Đã xem
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('watchlist')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${status === 'watchlist'
                      ? 'bg-surface shadow-sm text-primary'
                      : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                  >
                    Sẽ xem
                  </button>
                </div>

                {/* History Specifics: Rating & Date */}
                {status === 'history' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div ref={ratingRef} className={`bg-black/5 dark:bg-white/5 rounded-xl p-4 space-y-3 transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Đánh giá</label>
                      <div className="flex justify-between px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, rating: star }));
                              setRatingError(false);
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="group p-1 focus:outline-none"
                          >
                            <Star
                              size={28}
                              className={`transition-all duration-200 ${star <= (hoverRating || formData.rating)
                                ? 'fill-yellow-500 text-yellow-500 scale-110'
                                : 'text-text-muted/40 group-hover:text-yellow-500/50 group-hover:scale-110'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 space-y-3">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider block">Thời gian xem</label>
                      <div className="space-y-2">
                        <CustomDatePicker
                          value={formData.date}
                          onChange={(val) => setFormData({ ...formData, date: val })}
                        />
                        <CustomTimePicker
                          value={formData.time}
                          onChange={(val) => setFormData({ ...formData, time: val })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Details & Form */}
              <div className="md:col-span-8 space-y-6">

                {/* Title Section */}
                <div className="space-y-4">
                  <div className={`transition-transform duration-500 ${isAnimating && titleError ? 'scale-110' : ''}`}>
                    <input
                      ref={titleRef}
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        setTitleError(false);
                      }}
                      placeholder="Tên phim"
                      className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 px-0 py-2 text-2xl font-bold text-text-main placeholder-text-muted/50 focus:border-primary outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Tagline / Slogan..."
                      disabled={!isManualMode && !initialData?.movieToEdit}
                      className="w-full bg-transparent border-b border-black/10 dark:border-white/10 px-0 py-2 text-base text-text-muted italic focus:border-primary focus:text-text-main outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Media Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Film size={12} /> Loại
                    </label>
                    {isManualMode ? (
                      <CustomDropdown
                        options={[
                          { value: 'movie', label: 'Phim lẻ' },
                          { value: 'tv', label: 'TV Series' },
                        ]}
                        value={manualMediaType}
                        onChange={(value) => {
                          setManualMediaType(value as 'movie' | 'tv');
                          setFormData(prev => ({ ...prev, runtime: '', seasons: '' }));
                        }}
                        placeholder="Chọn loại"
                      />
                    ) : (
                      <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-text-main text-sm">
                        {(initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv') ? 'TV Series' : 'Phim lẻ'}
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={12} /> Quốc gia
                    </label>
                    {isManualMode ? (
                      <div ref={countryRef} className={`transition-transform duration-500 ${isAnimating && countryError ? 'scale-110' : ''}`}>
                        <CustomDropdown
                          options={countryOptions}
                          value={formData.country}
                          onChange={(value) => {
                            setFormData({ ...formData, country: value as string });
                            setCountryError(false);
                          }}
                          placeholder="Chọn quốc gia..."
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main opacity-70">
                        {formData.country || 'Không có thông tin'}
                      </div>
                    )}
                  </div>

                  {/* Release Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={12} /> Phát hành
                    </label>
                    <div ref={releaseDateRef} className={`transition-transform duration-500 ${isAnimating && releaseDateError ? 'scale-110' : ''}`}>
                      {isManualMode ? (
                        <CustomDatePicker
                          value={formData.releaseDate}
                          onChange={(val) => {
                            setFormData({ ...formData, releaseDate: val });
                            setReleaseDateError(false);
                          }}
                          placeholder="Chọn ngày phát hành..."
                        />
                      ) : (
                        <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-text-main opacity-50">
                          {formData.releaseDate ? (() => {
                            const [y, m, d] = formData.releaseDate.split('-').map(Number);
                            return `${d}/${m}/${y}`;
                          })() : 'Không có thông tin'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Runtime / Seasons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      {(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? <Tv size={12} /> : <Clock size={12} />}
                      {(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? 'Số phần' : 'Thời lượng (phút)'}
                    </label>
                    <div className={`transition-transform duration-500 ${isAnimating && ((manualMediaType === 'tv' && seasonsError) || (manualMediaType !== 'tv' && runtimeError)) ? 'scale-110' : ''}`}>
                      <input
                        ref={(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? seasonsRef : runtimeRef}
                        type="number"
                        required
                        disabled={!isManualMode}
                        value={(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? formData.seasons : formData.runtime}
                        onChange={e => {
                          setFormData({ ...formData, [(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? 'seasons' : 'runtime']: e.target.value });
                          if ((isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv'))) {
                            setSeasonsError(false);
                          } else {
                            setRuntimeError(false);
                          }
                        }}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Genres */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Thể loại</label>
                  {(isManualMode || initialData?.movieToEdit) ? (
                    <MultiSelectDropdown
                      options={genreOptions.map(g => ({ value: g.id, label: g.name }))}
                      values={selectedGenreIds}
                      onChange={(values) => {
                        setSelectedGenreIds(values);
                        const genreNames = genreOptions
                          .filter(g => values.includes(g.id))
                          .map(g => g.name)
                          .join(', ');
                        setFormData(prev => ({ ...prev, genres: genreNames }));
                      }}
                      placeholder="Chọn thể loại..."
                      searchable={true}
                      maxDisplay={5}
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main opacity-70">
                      {formData.genres || 'Không có thể loại'}
                    </div>
                  )}
                </div>

                {/* Overview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft size={12} /> Nội dung
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all custom-scrollbar resize-none"
                    placeholder="Tóm tắt nội dung phim..."
                  />
                </div>

                {/* Review (History Only) */}
                {status === 'history' && (
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Review ngắn</label>
                    <textarea
                      rows={3}
                      value={formData.review}
                      onChange={e => setFormData({ ...formData, review: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-text-main placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all custom-scrollbar resize-none"
                      placeholder="Cảm nhận của bạn về phim..."
                    />
                  </div>
                )}

                {/* TV Series Progress */}
                {status === 'history' && (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv') && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Tv size={16} /> Tiến độ xem
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="completed-checkbox"
                          checked={isCompleted}
                          onChange={(e) => setIsCompleted(e.target.checked)}
                          className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary accent-primary"
                        />
                        <label htmlFor="completed-checkbox" className="text-sm text-text-main cursor-pointer select-none">
                          Đã xem hết
                        </label>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-text-muted">Season</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setCurrentSeason(Math.max(1, currentSeason - 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              -
                            </button>
                            <div className="flex-1 text-center font-medium text-text-main">{currentSeason}</div>
                            <button
                              type="button"
                              onClick={() => setCurrentSeason(Math.min(parseInt(formData.seasons) || 1, currentSeason + 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-text-muted">Episode</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setCurrentEpisode(Math.max(0, currentEpisode - 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              -
                            </button>
                            <div className="flex-1 text-center font-medium text-text-main">{currentEpisode}</div>
                            <button
                              type="button"
                              onClick={() => {
                                const maxEpisodes = episodesPerSeason[currentSeason] || 999;
                                setCurrentEpisode(Math.min(maxEpisodes, currentEpisode + 1));
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {totalEpisodes > 0 && !isCompleted && (
                      <div className="text-xs text-text-muted text-center pt-2 border-t border-primary/10">
                        Tổng: {totalEpisodes} tập • Mùa này: {episodesPerSeason[currentSeason] || '?'} tập
                      </div>
                    )}
                  </div>
                )}

                {/* Album Selection (History only) */}
                {status === 'history' && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <FolderPlus size={12} /> {initialData?.movieToEdit ? 'Quản lý Album' : 'Thêm vào Album'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreateAlbum(!showCreateAlbum)}
                        className={`text-xs hover:underline font-medium flex items-center gap-1 transition-colors ${showCreateAlbum ? 'text-red-500' : 'text-primary'}`}
                      >
                        {showCreateAlbum ? (
                          <>
                            <X size={12} /> Hủy
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Tạo album mới
                          </>
                        )}
                      </button>
                    </div>

                    {showCreateAlbum && (
                      <div className="flex gap-2 animate-in slide-in-from-top-1 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                        <input
                          type="text"
                          placeholder="Tên album mới..."
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
                          className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateAlbum}
                          disabled={creatingAlbum || !newAlbumName.trim()}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {creatingAlbum ? <Loader2 size={16} className="animate-spin" /> : 'Tạo'}
                        </button>
                      </div>
                    )}

                    <MultiSelectDropdown
                      options={albums.map(album => ({ value: album.docId || '', label: album.name }))}
                      values={selectedAlbumIds}
                      onChange={(values) => setSelectedAlbumIds(values as string[])}
                      placeholder="Chọn album..."
                      searchable={true}
                      maxDisplay={3}
                      className="w-full"
                    />
                  </div>
                )}

              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 bg-surface/95 backdrop-blur flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={closeAddModal}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {(movieExists && !initialData?.movieToEdit) ? 'Đóng' : 'Hủy bỏ'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (movieExists && !initialData?.movieToEdit)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed shadow-lg shadow-primary/20 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {(movieExists && !initialData?.movieToEdit) ? 'Đã có trong thư viện' : (initialData?.movieToEdit ? 'Lưu thay đổi' : 'Lưu phim')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddMovieModal;

import React, { useState, useEffect } from 'react';
import { X, Calendar, Star, Save, Loader2, FolderPlus, Check } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { addMovie, updateMovie, checkMovieExists } from '../../services/movieService';
import { getMovieDetails, getMovieDetailsWithLanguage } from '../../services/tmdbService';
import useToastStore from '../../stores/toastStore';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import useAddMovieStore from '../../stores/addMovieStore';
import Loading from '../ui/Loading';
import { subscribeToAlbums, updateAlbum, addAlbum } from '../../services/albumService';
import { Album } from '../../types';

const AddMovieModal: React.FC = () => {
  const { isOpen, closeAddModal, initialData } = useAddMovieStore();
  const { user } = useAuth();
  const { showToast } = useToastStore();

  const [formData, setFormData] = useState({
    title: '',
    title_vi: '',
    runtime: '',
    seasons: '',
    poster: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    rating: 0,
    review: '',
    tagline: '',
    genres: '',
    releaseDate: '',
    country: '',
    content: ''
  });

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

  const isManualMode = !initialData?.tmdbId && !initialData?.movie && !initialData?.movieToEdit;

  // Subscribe to albums
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAlbums(user.uid, (data) => {
      setAlbums(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Reset album selection
      setSelectedAlbumIds([]);
      setShowCreateAlbum(false);
      setNewAlbumName('');
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
          title: m.title_vi || m.title,
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
              if (details) {
                const originalTitle = details.title || details.name || '';
                // Fetch Vietnamese title only if from Vietnam
                if (details.production_countries?.some(c => c.iso_3166_1 === 'VN')) {
                  const viDetails = await getMovieDetailsWithLanguage(Number(id), type, 'vi-VN');
                  if (viDetails) {
                    vietnameseTitle = viDetails.title || viDetails.name || '';
                    displayTitle = vietnameseTitle;
                  } else {
                    displayTitle = originalTitle;
                  }
                } else {
                  displayTitle = originalTitle;
                }

                const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || 0;
                const seasons = details.number_of_seasons || 0;
                const tagline = details.tagline || '';
                const genres = details.genres?.map(g => g.name).join(', ') || '';
                const releaseDate = details.release_date || details.first_air_date || '';
                const country = details.production_countries?.map(c => c.name).join(', ') || '';
                const content = details.overview || '';

                setFormData(prev => ({
                  ...prev,
                  title: displayTitle,
                  title_vi: vietnameseTitle,
                  runtime: runtime.toString(),
                  seasons: seasons ? seasons.toString() : '',
                  poster: details.poster_path || '',
                  date: new Date().toISOString().split('T')[0],
                  time: '12:00',
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
        setFormData({
          title: '',
          title_vi: '',
          runtime: '',
          seasons: '',
          poster: '',
          date: new Date().toISOString().split('T')[0],
          time: '12:00',
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
      }
    }
  }, [isOpen, initialData, user]);

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

  const toggleAlbumSelection = (albumId: string) => {
    setSelectedAlbumIds(prev =>
      prev.includes(albumId)
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const isHistory = status === 'history';

    // Check if rating is required (when recording movies, not manual mode)
    if (isHistory && !isManualMode && formData.rating === 0) {
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

      if (initialData?.movieToEdit && initialData.movieToEdit.docId) {
        // Update Existing
        await updateMovie(initialData.movieToEdit.docId, {
          title: formData.title,
          title_vi: formData.title_vi,
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
        });
        showToast("Đã cập nhật phim", "success");
      } else {
        // Add New
        const usedId = initialData?.tmdbId || initialData?.movie?.id || Date.now();
        const movieDocId = await addMovie({
          uid: user.uid,
          id: usedId,
          title: formData.title,
          title_vi: formData.title_vi,
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
        });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 bg-surface/95 backdrop-blur">
          <h2 className="text-xl font-bold text-text-main">
            {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
          <button onClick={closeAddModal} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoadingDetails ? (
            <Loading fullScreen={false} size={40} text="Đang tải thông tin..." className="py-12" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster Preview */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                  <div className="aspect-2/3 rounded-xl overflow-hidden bg-black/10 dark:bg-black/20 border border-black/10 dark:border-white/5 relative group">
                    {formData.poster ? (
                      <img
                        src={formData.poster.startsWith('http') ? formData.poster : `${TMDB_IMAGE_BASE_URL}${formData.poster}`}
                        alt="Poster"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        No Poster
                      </div>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Trạng thái</label>
                    <div className="inline-flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => setStatus('history')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${status === 'history' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'}`}
                      >
                        Đã xem
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('watchlist')}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${status === 'watchlist' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'}`}
                      >
                        Sẽ xem
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Tên phim</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Nội dung (tùy chọn)</label>
                    <textarea
                      rows={8}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      placeholder="Tóm tắt nội dung phim..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Tagline (tùy chọn)</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Câu slogan của phim..."
                      disabled={!isManualMode && !initialData?.movieToEdit}
                      className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors ${!isManualMode && !initialData?.movieToEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {isManualMode && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Link Poster (URL)</label>
                      <input
                        type="url"
                        value={formData.poster}
                        onChange={e => setFormData({ ...formData, poster: e.target.value })}
                        placeholder="https://example.com/poster.jpg"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Thể loại</label>
                    <input
                      type="text"
                      required={isManualMode}
                      value={formData.genres}
                      onChange={e => setFormData({ ...formData, genres: e.target.value })}
                      placeholder="Hành động, Phiêu lưu, Khoa học viễn tưởng..."
                      disabled={!isManualMode && !initialData?.movieToEdit}
                      className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors ${!isManualMode && !initialData?.movieToEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Quốc gia</label>
                    <input
                      type="text"
                      required={isManualMode}
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Việt Nam, Mỹ, Hàn Quốc..."
                      disabled={!isManualMode && !initialData?.movieToEdit}
                      className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors ${!isManualMode && !initialData?.movieToEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Ngày phát hành</label>
                    <input
                      type="date"
                      required={isManualMode}
                      value={formData.releaseDate}
                      onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                      disabled={!isManualMode}
                      className={`w-full max-w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors scheme-light dark:scheme-dark ${!isManualMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {status === 'history' && (
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Ngày xem</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                        <input
                          type="datetime-local"
                          required
                          value={`${formData.date}T${formData.time}`}
                          onChange={e => {
                            const datetimeValue = e.target.value;
                            if (datetimeValue) {
                              const [datePart, timePart] = datetimeValue.split('T');
                              setFormData({ ...formData, date: datePart, time: timePart });
                            }
                          }}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors scheme-light dark:scheme-dark"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Loại nội dung</label>
                      {isManualMode ? (
                        <select
                          value={manualMediaType}
                          onChange={e => {
                            setManualMediaType(e.target.value as 'movie' | 'tv');
                            // Reset runtime/seasons when switching
                            setFormData(prev => ({
                              ...prev,
                              runtime: '',
                              seasons: ''
                            }));
                          }}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors [&>option]:bg-surface [&>option]:text-text-main dark:[&>option]:bg-gray-800"
                        >
                          <option value="movie">Phim lẻ</option>
                          <option value="tv">TV Series</option>
                        </select>
                      ) : (
                        <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main">
                          {(initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv') ? 'TV Series' : 'Phim lẻ'}
                        </div>
                      )}
                    </div>
                    {(isManualMode ? manualMediaType === 'tv' : (initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv')) ? (
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Số phần</label>
                        <input
                          type="number"
                          required
                          disabled={!isManualMode}
                          value={formData.seasons}
                          onChange={e => setFormData({ ...formData, seasons: e.target.value })}
                          className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors ${!isManualMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Thời lượng (phút)</label>
                        <input
                          type="number"
                          required
                          disabled={!isManualMode}
                          value={formData.runtime}
                          onChange={e => setFormData({ ...formData, runtime: e.target.value })}
                          className={`w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors ${!isManualMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    )}
                  </div>

                  {status === 'history' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">
                          Đánh giá {!isManualMode && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={32}
                                className={`${star <= formData.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-text-muted hover:text-yellow-500'
                                  } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Review ngắn (tùy chọn)</label>
                        <textarea
                          rows={3}
                          value={formData.review}
                          onChange={e => setFormData({ ...formData, review: e.target.value })}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                          placeholder="Cảm nhận của bạn về phim..."
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Album Selection - Only show when adding new movie with history status */}
              {!initialData?.movieToEdit && status === 'history' && (
                <div className="border-t border-black/10 dark:border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-main">Thêm vào Album</h3>
                      <p className="text-sm text-text-muted">Chọn album để lưu phim này (tùy chọn)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateAlbum(!showCreateAlbum)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
                    >
                      <FolderPlus size={16} />
                      Tạo album mới
                    </button>
                  </div>

                  {showCreateAlbum && (
                    <div className="mb-4 p-4 border border-primary/20 rounded-xl bg-primary/5">
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Tên album"
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateAlbum();
                            }
                          }}
                          className="w-full p-3 rounded-lg border border-black/10 dark:border-white/10 bg-surface text-text-main placeholder-text-muted focus:border-primary focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateAlbum}
                            disabled={creatingAlbum || !newAlbumName.trim()}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            {creatingAlbum ? 'Đang tạo...' : 'Tạo album'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateAlbum(false);
                              setNewAlbumName('');
                            }}
                            className="px-4 py-2 border border-black/10 dark:border-white/10 text-text-main rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {albums.length === 0 ? (
                    <div className="text-center py-6 text-text-muted text-sm">
                      Bạn chưa có album nào. Tạo album mới để bắt đầu.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {albums.map(album => (
                        <button
                          key={album.docId}
                          type="button"
                          onClick={() => album.docId && toggleAlbumSelection(album.docId)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${selectedAlbumIds.includes(album.docId || '')
                            ? 'border-primary bg-primary/10'
                            : 'border-black/10 dark:border-white/10 hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-main truncate">{album.name}</h4>
                              <p className="text-xs text-text-muted">{album.movieDocIds.length} phim</p>
                            </div>
                            {selectedAlbumIds.includes(album.docId || '') && (
                              <div className="ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedAlbumIds.length > 0 && (
                    <div className="mt-3 text-sm text-primary">
                      Đã chọn {selectedAlbumIds.length} album
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-6 py-2.5 rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-3"
                >
                  {movieExists ? 'Đóng' : 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || movieExists}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {movieExists ? 'Phim đã lưu' : (initialData?.movieToEdit ? 'Lưu thay đổi' : 'Lưu phim')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMovieModal;

import React, { useState, useEffect } from 'react';
import { X, Calendar, Star, Save, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { addMovie, updateMovie } from '../services/movieService';
import { getMovieDetails } from '../services/tmdbService';
import { useToast } from './Toast';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useAddMovie } from './AddMovieContext';

const AddMovieModal: React.FC = () => {
  const { isOpen, closeAddModal, initialData } = useAddMovie();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    runtime: '',
    seasons: '',
    poster: '',
    date: new Date().toISOString().split('T')[0],
    rating: 0,
    review: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      if (initialData?.movieToEdit) {
        // Edit Mode
        const m = initialData.movieToEdit;
        const d = m.watched_at instanceof Object && 'toDate' in m.watched_at
          ? m.watched_at.toDate()
          : new Date(m.watched_at as any);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        setFormData({
          title: m.title,
          runtime: m.runtime.toString(),
          seasons: m.seasons ? m.seasons.toString() : '',
          poster: m.poster_path,
          date: dateStr,
          rating: m.rating || 0,
          review: m.review || ''
        });
      } else if (initialData?.tmdbId || initialData?.movie) {
        // Add Mode from Search or ID
        const fetchDetails = async () => {
          setIsLoadingDetails(true);
          try {
            const id = initialData.tmdbId || initialData.movie?.id;
            const type = initialData.mediaType || initialData.movie?.media_type || 'movie';
            
            if (id) {
              const details = await getMovieDetails(Number(id), type);
              if (details) {
                const title = details.title || details.name || '';
                const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || 0;
                const seasons = details.number_of_seasons || 0;
                
                setFormData(prev => ({
                  ...prev,
                  title: title,
                  runtime: runtime.toString(),
                  seasons: seasons ? seasons.toString() : '',
                  poster: details.poster_path || '',
                  date: new Date().toISOString().split('T')[0],
                  rating: 0,
                  review: ''
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
          runtime: '',
          seasons: '',
          poster: '',
          date: new Date().toISOString().split('T')[0],
          rating: 0,
          review: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      const watchedDate = new Date(y, m - 1, d, 12, 0, 0);
      const isTv = initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || (initialData?.movieToEdit?.media_type === 'tv');

      if (initialData?.movieToEdit && initialData.movieToEdit.docId) {
        // Update Existing
        await updateMovie(initialData.movieToEdit.docId, {
          title: formData.title,
          runtime: parseInt(formData.runtime) || 0,
          seasons: parseInt(formData.seasons) || 0,
          poster_path: formData.poster,
          watched_at: watchedDate,
          rating: Number(formData.rating),
          review: formData.review
        });
        showToast("Đã cập nhật phim", "success");
      } else {
        // Add New
        await addMovie({
          uid: user.uid,
          id: initialData?.tmdbId || initialData?.movie?.id || Date.now(), // Fallback ID
          title: formData.title,
          poster_path: formData.poster,
          runtime: parseInt(formData.runtime) || 0,
          seasons: parseInt(formData.seasons) || 0,
          watched_at: watchedDate,
          source: (initialData?.tmdbId || initialData?.movie) ? 'tmdb' : 'manual',
          media_type: initialData?.mediaType || 'movie',
          rating: Number(formData.rating),
          review: formData.review
        });
        showToast("Đã thêm phim mới", "success");
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
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-surface/95 backdrop-blur">
          <h2 className="text-xl font-bold text-text-main">
            {initialData?.movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
          <button onClick={closeAddModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-text-muted">Đang tải thông tin...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster Preview */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/20 border border-white/5 relative group">
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
                    <label className="block text-sm font-medium text-text-muted mb-1">Tên phim</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(initialData?.mediaType === 'tv' || initialData?.movie?.media_type === 'tv' || initialData?.movieToEdit?.media_type === 'tv') ? (
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Số phần</label>
                        <input
                          type="number"
                          required
                          disabled
                          value={formData.seasons}
                          onChange={e => setFormData({...formData, seasons: e.target.value})}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors opacity-60 cursor-not-allowed"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Thời lượng (phút)</label>
                        <input
                          type="number"
                          required
                          disabled
                          value={formData.runtime}
                          onChange={e => setFormData({...formData, runtime: e.target.value})}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors opacity-60 cursor-not-allowed"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-1">Ngày xem</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Đánh giá</label>
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
                            className={`${
                              star <= formData.rating
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
                      onChange={e => setFormData({...formData, review: e.target.value})}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      placeholder="Cảm nhận của bạn về phim..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-6 py-2.5 rounded-xl text-text-muted hover:bg-white/5 transition-colors mr-3"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {initialData?.movieToEdit ? 'Lưu thay đổi' : 'Lưu phim'}
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

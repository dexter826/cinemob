import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Loader2, Film, Link as LinkIcon, Calendar, Star, Save } from 'lucide-react';
import { searchMovies, getMovieDetails } from '../services/tmdbService';
import { TMDBMovieResult, Movie } from '../types';
import { useAuth } from './AuthProvider';
import { addMovie, updateMovie } from '../services/movieService';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useToast } from './Toast';
import { Timestamp } from 'firebase/firestore';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieToEdit?: Movie | null;
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({ isOpen, onClose, movieToEdit }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  // Search State
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovieResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTMDBMovie, setSelectedTMDBMovie] = useState<TMDBMovieResult | null>(null);

  // Form State (Used for both Manual, Search Details, and Edit)
  const [formData, setFormData] = useState({
    title: '',
    runtime: '',
    poster: '',
    date: new Date().toISOString().split('T')[0],
    rating: 0,
    review: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or Populate on Open
  useEffect(() => {
    if (isOpen) {
      if (movieToEdit) {
        // Edit Mode
        const d = movieToEdit.watched_at instanceof Timestamp
          ? movieToEdit.watched_at.toDate()
          : (movieToEdit.watched_at as Date);

        // Ensure we display the local date string correctly
        // Getting the year/month/day from the Date object directly
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        setFormData({
          title: movieToEdit.title,
          runtime: movieToEdit.runtime.toString(),
          poster: movieToEdit.poster_path,
          date: dateStr,
          rating: movieToEdit.rating || 0,
          review: movieToEdit.review || ''
        });
      } else {
        // New Mode
        setFormData({
          title: '',
          runtime: '',
          poster: '',
          date: new Date().toISOString().split('T')[0],
          rating: 0,
          review: ''
        });
        setQuery('');
        setSearchResults([]);
        setSelectedTMDBMovie(null);
        setActiveTab('search');
      }
    }
  }, [isOpen, movieToEdit]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2 && activeTab === 'search' && !movieToEdit) {
        setIsSearching(true);
        const results = await searchMovies(query);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, activeTab, movieToEdit]);

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    setSelectedTMDBMovie(movie);
    // Reset form data but keep defaults, waiting for submission to fetch details
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      // FIX: Construct date using local time components to avoid UTC shifting issues.
      // Set time to Noon (12:00:00) to be safe from any boundary DST shifts.
      const [y, m, d] = formData.date.split('-').map(Number);
      const watchedDate = new Date(y, m - 1, d, 12, 0, 0);

      if (movieToEdit && movieToEdit.docId) {
        // UPDATE EXISTING
        await updateMovie(movieToEdit.docId, {
          title: formData.title,
          runtime: parseInt(formData.runtime) || 0,
          poster_path: formData.poster,
          watched_at: watchedDate,
          rating: formData.rating,
          review: formData.review,
        });
        showToast("Cập nhật phim thành công!", 'success');
      }
      else if (activeTab === 'search' && selectedTMDBMovie) {
        // ADD FROM TMDB
        const details = await getMovieDetails(selectedTMDBMovie.id);
        if (!details) throw new Error("Không thể lấy thông tin chi tiết");

        await addMovie({
          uid: user.uid,
          id: details.id,
          title: details.title,
          poster_path: details.poster_path || '',
          runtime: details.runtime || 0,
          source: 'tmdb',
          watched_at: watchedDate,
          rating: formData.rating,
          review: formData.review
        });
        showToast("Thêm phim thành công!", 'success');
      }
      else {
        // ADD MANUAL
        await addMovie({
          uid: user.uid,
          id: Date.now(),
          title: formData.title,
          poster_path: formData.poster,
          runtime: parseInt(formData.runtime) || 0,
          source: 'manual',
          watched_at: watchedDate,
          rating: formData.rating,
          review: formData.review
        });
        showToast("Thêm phim thành công!", 'success');
      }
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Lưu phim thất bại.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-2xl rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-text-main">
            {movieToEdit ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs (Only if adding new) */}
        {!movieToEdit && !selectedTMDBMovie && (
          <div className="flex border-b border-black/10 dark:border-white/10">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'
                }`}
            >
              Tìm kiếm trên TMDB
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'
                }`}
            >
              Nhập thủ công
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">

          {/* SEARCH MODE */}
          {!movieToEdit && activeTab === 'search' && !selectedTMDBMovie && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                />
              </div>

              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => handleSelectMovie(movie)}
                      disabled={isSubmitting}
                      className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img
                            src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <Film size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-text-main font-medium group-hover:text-primary transition-colors">{movie.title}</h4>
                        <p className="text-sm text-text-muted">{movie.release_date?.split('-')[0] || 'Không rõ năm'}</p>
                      </div>
                      <Plus size={20} className="text-text-muted group-hover:text-primary" />
                    </button>
                  ))}
                  {query.length > 2 && searchResults.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Không tìm thấy phim.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TMDB CONFIRMATION MODE */}
          {!movieToEdit && activeTab === 'search' && selectedTMDBMovie && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-start space-x-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                <img
                  src={selectedTMDBMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${selectedTMDBMovie.poster_path}` : ''}
                  className="w-20 rounded-lg"
                  alt="poster"
                />
                <div>
                  <h3 className="text-lg font-bold text-text-main">{selectedTMDBMovie.title}</h3>
                  <p className="text-text-muted text-sm mt-1">
                    {selectedTMDBMovie.release_date?.split('-')[0]}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedTMDBMovie(null)}
                    className="text-xs text-primary mt-2 hover:underline"
                  >
                    Đổi phim
                  </button>
                </div>
              </div>
              <AdditionalFields formData={formData} setFormData={setFormData} />
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>Lưu phim</span>
                </button>
              </div>
            </form>
          )}

          {/* MANUAL OR EDIT MODE */}
          {(activeTab === 'manual' || movieToEdit) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Tiêu đề phim</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-3 text-text-main focus:border-primary/50 focus:outline-none"
                  placeholder="ví dụ: Inception"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Thời lượng (phút)</label>
                <input
                  required
                  type="number"
                  value={formData.runtime}
                  onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                  className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-3 text-text-main focus:border-primary/50 focus:outline-none"
                  placeholder="ví dụ: 148"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">URL Poster (Tùy chọn)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="url"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-3 pl-10 text-text-main focus:border-primary/50 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <AdditionalFields formData={formData} setFormData={setFormData} />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{movieToEdit ? 'Cập nhật phim' : 'Thêm phim'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface AdditionalFieldsProps {
  formData: {
    title: string;
    runtime: string;
    poster: string;
    date: string;
    rating: number;
    review: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    runtime: string;
    poster: string;
    date: string;
    rating: number;
    review: string;
  }>>;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({ formData, setFormData }) => (
  <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-text-muted mb-1">Ngày xem</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-3 pl-10 text-text-main focus:border-primary/50 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-text-muted mb-1">Đánh giá</label>
        <div className="flex space-x-2 items-center h-[46px] bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={20}
                className={`${star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm text-text-muted mb-1">Đánh giá / Ghi chú</label>
      <textarea
        value={formData.review}
        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
        className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg p-3 text-text-main focus:border-primary/50 focus:outline-none min-h-[100px]"
        placeholder="Bạn nghĩ gì về phim này?"
      />
    </div>
  </div>
);

export default AddMovieModal;
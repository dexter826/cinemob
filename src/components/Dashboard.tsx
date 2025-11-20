import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { subscribeToMovies, deleteMovie } from '../services/movieService';
import { Movie, Stats } from '../types';
import { Film, Clock, Plus, Loader, AlertTriangle, Calendar, Type, ArrowUp, ArrowDown, Search, X, Filter, Star } from 'lucide-react';
import StatsCard from './StatsCard';
import MovieCard from './MovieCard';
import MovieDetailModal from './MovieDetailModal';
import Navbar from './Navbar';
import { TMDB_API_KEY } from '../constants';
import { Timestamp } from 'firebase/firestore';
import { useToast } from './Toast';
import { useAlert } from './Alert';

import { useAddMovie } from './AddMovieContext';
import Loading from './Loading';

type SortOption = 'date' | 'title' | 'runtime';
type SortOrder = 'asc' | 'desc';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert } = useAlert();
  const { openAddModal } = useAddMovie();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(18);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToMovies(user.uid, (data) => {
      setMovies(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats: Stats = useMemo(() => {
    const totalMovies = movies.length;
    const totalMinutes = movies.reduce((acc, curr) => acc + (curr.runtime || 0), 0);

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    return { totalMovies, totalMinutes, days, hours, minutes };
  }, [movies]);

  // Sort & Filter Logic
  const processedMovies = useMemo(() => {
    // 1. Filter first
    let result = [...movies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(movie => movie.title.toLowerCase().includes(q));
    }

    if (filterRating !== null) {
      result = result.filter(movie => (movie.rating || 0) >= filterRating);
    }

    if (filterYear !== null) {
      result = result.filter(movie => {
        const date = movie.watched_at instanceof Timestamp ? movie.watched_at.toDate() : (movie.watched_at as Date);
        return date && date.getFullYear() === filterYear;
      });
    }

    if (filterCountry) {
      result = result.filter(movie => movie.country && movie.country.toLowerCase().includes(filterCountry.toLowerCase()));
    }

    // 2. Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'runtime') {
        comparison = (a.runtime || 0) - (b.runtime || 0);
      } else {
        // Date Sort
        const getTime = (t: any) => {
          if (!t) return 0;
          if (t instanceof Timestamp) return t.toMillis();
          if (t instanceof Date) return t.getTime();
          if (t.seconds) return t.seconds * 1000;
          return 0;
        };
        comparison = getTime(a.watched_at) - getTime(b.watched_at);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, sortBy, sortOrder, searchQuery, filterRating, filterYear]);

  // Pagination Logic
  const totalPages = Math.ceil(processedMovies.length / moviesPerPage);
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * moviesPerPage;
    const endIndex = startIndex + moviesPerPage;
    return processedMovies.slice(startIndex, endIndex);
  }, [processedMovies, currentPage, moviesPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRating, filterYear, filterCountry, sortBy, sortOrder]);

  const handleDelete = async (docId: string) => {
    showAlert({
      title: "Xóa phim",
      message: "Bạn có chắc chắn muốn xóa phim này khỏi lịch sử của mình không? Hành động này không thể hoàn tác.",
      type: "danger",
      confirmText: "Xóa",
      onConfirm: async () => {
        try {
          await deleteMovie(docId);
          showToast("Đã xóa phim", "info");
        } catch (e) {
          showToast("Xóa phim thất bại", "error");
        }
      }
    });
  };

  const handleEdit = (movie: Movie) => {
    openAddModal({ movieToEdit: movie });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20 transition-colors duration-300">

      {/* Navigation */}
      <Navbar />

      {!TMDB_API_KEY && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center">
          <p className="text-yellow-500 text-sm flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            TMDB API Key bị thiếu. Tìm kiếm sẽ không hoạt động. Thêm nó vào constants.ts hoặc .env.
          </p>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Action Card: Search */}
          <button
            onClick={() => navigate('/search')}
            className="w-full bg-gradient-to-br from-primary/80 to-primary hover:to-primary/90 p-6 rounded-2xl flex items-center justify-between group transition-all shadow-lg shadow-primary/20"
          >
            <div>
              <p className="text-white/90 text-sm font-medium mb-1 text-left">Thêm vào bộ sưu tập</p>
              <h3 className="text-2xl font-bold text-white text-left">Ghi lại phim</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:rotate-90 transition-transform duration-300">
              <Search size={24} className="text-white" />
            </div>
          </button>

          {/* Action Card: Manual Add */}
          <button
            onClick={() => openAddModal({})}
            className="w-full bg-surface border border-black/5 dark:border-white/10 hover:border-primary/50 p-6 rounded-2xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <p className="text-text-muted text-sm font-medium mb-1 text-left">Không tìm thấy phim?</p>
              <h3 className="text-2xl font-bold text-text-main text-left">Thêm thủ công</h3>
            </div>
            <div className="bg-black/5 dark:bg-white/10 p-3 rounded-xl group-hover:bg-primary/10 transition-colors duration-300">
              <Plus size={24} className="text-text-main group-hover:text-primary transition-colors" />
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-semibold text-text-main">Lịch sử xem</h2>
              <span className="text-sm text-text-muted">{movies.length} phim</span>
            </div>

            {/* Controls Toolbar */}
            {movies.length > 0 && (
              <div className="flex flex-col items-end gap-3 relative">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Bar */}
                  <div className="relative group flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Lọc phim..."
                      className="w-full sm:w-64 bg-surface border border-black/5 dark:border-white/10 rounded-xl py-2 pl-10 pr-8 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Toggle Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                    className={`p-2 rounded-xl border transition-colors ${showFilters ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-black/5 dark:border-white/10 text-text-muted hover:text-text-main'}`}
                  >
                    <Filter size={20} />
                  </button>
                </div>

                {/* Sorting Controls (Dropdown/Expandable) */}
                {showFilters && (
                  <div ref={filterRef} className="absolute top-full right-0 mt-2 z-20 bg-surface p-4 rounded-xl border border-black/5 dark:border-white/10 shadow-xl flex flex-col gap-4 min-w-[280px] animate-fade-in">
                    
                    {/* Sort Section */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sắp xếp</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSortBy('date')}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'}`}
                        >
                          <Calendar size={14} />
                          <span>Ngày</span>
                        </button>
                        <button
                          onClick={() => setSortBy('title')}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'title' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'}`}
                        >
                          <Type size={14} />
                          <span>Tên</span>
                        </button>
                        <button
                          onClick={() => setSortBy('runtime')}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${sortBy === 'runtime' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'}`}
                        >
                          <Clock size={14} />
                          <span>Thời lượng</span>
                        </button>
                        <button
                          onClick={toggleSortOrder}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                        >
                          {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-black/10 dark:bg-white/10" />

                    {/* Filter Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lọc</div>
                        {(filterRating !== null || filterYear !== null || filterCountry) && (
                          <button 
                            onClick={() => { setFilterRating(null); setFilterYear(null); setFilterCountry(''); }}
                            className="text-xs text-primary hover:underline"
                          >
                            Xóa lọc
                          </button>
                        )}
                      </div>
                      
                      {/* Rating Filter */}
                      <div>
                        <label className="text-xs text-text-muted mb-1.5 block">Đánh giá tối thiểu</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFilterRating(filterRating === star ? null : star)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                (filterRating || 0) >= star ? 'text-yellow-500 bg-yellow-500/10' : 'text-text-muted bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                              }`}
                            >
                              <Star size={16} fill={(filterRating || 0) >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Year Filter */}
                      <div>
                        <label className="text-xs text-text-muted mb-1.5 block">Năm xem</label>
                        <div className="relative">
                          <select
                            value={filterYear || ''}
                            onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-black/5 dark:bg-white/5 border-none rounded-lg text-sm text-text-main py-2 px-3 focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-surface text-text-main dark:bg-gray-800">Tất cả các năm</option>
                            {Array.from(new Set(movies.map(m => {
                              const d = m.watched_at instanceof Timestamp ? m.watched_at.toDate() : (m.watched_at as Date);
                              return d ? d.getFullYear() : null;
                            }).filter(Boolean))).sort((a, b) => (b as number) - (a as number)).map(year => (
                              <option key={year} value={year as number} className="bg-surface text-text-main dark:bg-gray-800">{year}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ArrowDown size={12} />
                          </div>
                        </div>
                      </div>

                      {/* Country Filter */}
                      <div>
                        <label className="text-xs text-text-muted mb-1.5 block">Quốc gia</label>
                        <div className="relative">
                          <select
                            value={filterCountry}
                            onChange={(e) => setFilterCountry(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border-none rounded-lg text-sm text-text-main py-2 px-3 focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            <option value="" className="bg-surface text-text-main dark:bg-gray-800">Tất cả quốc gia</option>
                            {Array.from(new Set(
                              movies
                                .filter(m => m.country && m.country.trim().length > 0)
                                .flatMap(m => m.country!.split(',').map(c => c.trim()))
                                .filter(c => c.length > 0)
                            )).sort().map(country => (
                              <option key={country} value={country} className="bg-surface text-text-main dark:bg-gray-800">{country}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                            <ArrowDown size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {processedMovies.length === 0 ? (
            <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
                <Film className="text-text-muted" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-main">
                  {searchQuery ? "Không tìm thấy phim phù hợp" : "Chưa có phim nào"}
                </h3>
                <p className="text-text-muted max-w-xs mx-auto">
                  {searchQuery ? "Hãy thử điều chỉnh truy vấn tìm kiếm của bạn." : "Bắt đầu xây dựng lịch sử điện ảnh cá nhân của bạn bằng cách thêm bộ phim đầu tiên."}
                </p>
              </div>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/search')}
                  className="px-6 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-text-main rounded-full font-medium transition-colors"
                >
                  Thêm phim
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {paginatedMovies.map(movie => (
                  <MovieCard
                    key={movie.docId}
                    movie={movie}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onClick={handleMovieClick}
                  />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white font-medium'
                              : 'bg-surface border border-black/10 dark:border-white/10 text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Tiếp
                  </button>
                  
                  <span className="ml-4 text-sm text-text-muted">
                    Trang {currentPage} / {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      <MovieDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        movie={selectedMovie}
      />
    </div>
  );
};

export default Dashboard;
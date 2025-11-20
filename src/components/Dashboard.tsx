import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { subscribeToMovies, deleteMovie } from '../services/movieService';
import { Movie, Stats } from '../types';
import { LogOut, Film, Clock, Plus, Loader, AlertTriangle, Calendar, Type, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
import StatsCard from './StatsCard';
import MovieCard from './MovieCard';
import AddMovieModal from './AddMovieModal';
import { TMDB_API_KEY } from '../constants';
import { Timestamp } from 'firebase/firestore';
import { useToast } from './Toast';

type SortOption = 'date' | 'title' | 'runtime';
type SortOrder = 'asc' | 'desc';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [movies, sortBy, sortOrder, searchQuery]);

  const handleDelete = async (docId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này khỏi lịch sử của mình không?")) {
      try {
        await deleteMovie(docId);
        showToast("Đã xóa phim", "info");
      } catch (e) {
        showToast("Xóa phim thất bại", "error");
      }
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-20">

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Film className="text-primary" size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Cinemetrics</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-secondary"></div>
              )}
              <span className="text-sm font-medium text-gray-300">{user?.displayName}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            label="Đã xem"
            value={stats.totalMovies}
            icon={Film}
            colorClass="text-primary"
            subValue="Phim đã sưu tập"
          />
          <StatsCard
            label="Thời gian đã xem"
            value={`${stats.days}d ${stats.hours}h ${stats.minutes}m`}
            icon={Clock}
            colorClass="text-secondary"
            subValue={`${stats.totalMinutes.toLocaleString()} tổng số phút`}
          />
          {/* Action Card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-br from-primary/80 to-primary hover:to-primary/90 p-6 rounded-2xl flex items-center justify-between group transition-all shadow-lg shadow-primary/20"
          >
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Thêm vào bộ sưu tập</p>
              <h3 className="text-2xl font-bold text-white">Ghi lại phim</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:rotate-90 transition-transform duration-300">
              <Plus size={24} className="text-white" />
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-semibold text-gray-200">Lịch sử xem</h2>
              <span className="text-sm text-gray-500">{movies.length} mục</span>
            </div>

            {/* Controls Toolbar */}
            {movies.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Lọc phim..."
                    className="w-full sm:w-64 bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-8 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center space-x-2 bg-surface p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Calendar size={14} />
                    <span className="hidden sm:inline">Ngày</span>
                  </button>

                  <button
                    onClick={() => setSortBy('title')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'title' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Type size={14} />
                    <span className="hidden sm:inline">Tiêu đề</span>
                  </button>

                  <button
                    onClick={() => setSortBy('runtime')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'runtime' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Clock size={14} />
                    <span className="hidden sm:inline">Thời lượng</span>
                  </button>

                  <div className="w-px h-4 bg-white/10 mx-1" />

                  <button
                    onClick={toggleSortOrder}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title={`Sắp xếp ${sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}`}
                  >
                    {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {processedMovies.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                <Film className="text-gray-600" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {searchQuery ? "Không tìm thấy phim phù hợp" : "Chưa có phim nào"}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  {searchQuery ? "Hãy thử điều chỉnh truy vấn tìm kiếm của bạn." : "Bắt đầu xây dựng lịch sử điện ảnh cá nhân của bạn bằng cách thêm bộ phim đầu tiên."}
                </p>
              </div>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors"
                >
                  Thêm phim
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {processedMovies.map(movie => (
                <MovieCard
                  key={movie.docId}
                  movie={movie}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      <AddMovieModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movieToEdit={editingMovie}
      />
    </div>
  );
};

export default Dashboard;
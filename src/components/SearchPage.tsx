import React, { useState, useEffect } from 'react';
import { Search, Loader2, Film, ArrowLeft, Filter } from 'lucide-react';
import { searchMovies, getGenres, getTrendingMovies } from '../services/tmdbService';
import { TMDBMovieResult } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAddMovie } from './AddMovieContext';
import Loading from './Loading';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAddModal } = useAddMovie();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchPage, setSearchPage] = useState(1);
  const [totalSearchPages, setTotalSearchPages] = useState(1);
  
  // Filters
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterGenre, setFilterGenre] = useState<string>('');
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [genreList, trendingData] = await Promise.all([
          getGenres(),
          getTrendingMovies()
        ]);
        setGenres(genreList);
        setTrendingMovies(trendingData.results);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        const { results: data, totalPages } = await searchMovies(query, searchPage);
        setResults(data);
        setTotalSearchPages(totalPages);
        setLoading(false);
      } else {
        setResults([]);
        setSearchPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, searchPage]);

  // Reset search page when query changes
  useEffect(() => {
    setSearchPage(1);
  }, [query]);

  const filteredResults = (query ? results : trendingMovies).filter(movie => {
    if (filterType !== 'all' && movie.media_type !== filterType) return false;
    
    if (filterYear) {
      const date = movie.release_date || movie.first_air_date;
      if (!date || !date.startsWith(filterYear)) return false;
    }

    if (filterGenre) {
      // Note: search/multi results usually contain genre_ids array
      if (!movie.genre_ids || !movie.genre_ids.includes(Number(filterGenre))) return false;
    }

    return true;
  });

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: movie.media_type || (filterType === 'tv' ? 'tv' : 'movie')
    });
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Tìm kiếm phim</h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Nhập tên phim..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all shadow-sm text-lg"
              autoFocus
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2">
              <Filter size={16} className="text-text-muted" />
              <span className="text-sm font-medium text-text-muted">Lọc theo:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm flex-1 sm:flex-none text-text-main [&>option]:bg-surface [&>option]:text-text-main dark:[&>option]:bg-gray-800"
            >
              <option value="all">Tất cả loại</option>
              <option value="movie">Phim lẻ</option>
              <option value="tv">TV Series</option>
            </select>

            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm flex-1 sm:flex-none min-w-[140px] text-text-main [&>option]:bg-surface [&>option]:text-text-main dark:[&>option]:bg-gray-800"
            >
              <option value="">Tất cả thể loại</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Năm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-24 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm flex-1 sm:flex-none"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            {!query && filteredResults.length > 0 && (
               <div className="mb-4">
                 <h2 className="text-xl font-bold">Phim thịnh hành</h2>
               </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredResults.map(movie => (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie)}
                className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="aspect-[2/3] w-full relative overflow-hidden">
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-text-muted">
                      <Film size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1" title={movie.title || movie.name}>
                    {movie.title || movie.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {(movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A'} • {movie.media_type === 'tv' ? 'TV' : 'Movie'}
                  </p>
                </div>
              </div>
            ))}
            {query.length > 2 && filteredResults.length === 0 && (
              <div className="col-span-full text-center py-10 text-text-muted">
                Không tìm thấy kết quả nào.
              </div>
            )}
            {!query && filteredResults.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
                <Search size={48} className="mb-4" />
                <p>Nhập tên phim để bắt đầu tìm kiếm</p>
              </div>
            )}
          </div>

          {/* Pagination Controls - Only for Search Results */}
          {!loading && query && filteredResults.length > 0 && totalSearchPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setSearchPage(prev => Math.max(1, prev - 1))}
                disabled={searchPage === 1}
                className="px-4 py-2 rounded-lg bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalSearchPages) }, (_, i) => {
                  let pageNum;
                  if (totalSearchPages <= 5) {
                    pageNum = i + 1;
                  } else if (searchPage <= 3) {
                    pageNum = i + 1;
                  } else if (searchPage >= totalSearchPages - 2) {
                    pageNum = totalSearchPages - 4 + i;
                  } else {
                    pageNum = searchPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setSearchPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        searchPage === pageNum
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
                onClick={() => setSearchPage(prev => Math.min(totalSearchPages, prev + 1))}
                disabled={searchPage === totalSearchPages}
                className="px-4 py-2 rounded-lg bg-surface border border-black/10 dark:border-white/10 text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Tiếp
              </button>
              
              <span className="ml-4 text-sm text-text-muted">
                Trang {searchPage} / {totalSearchPages}
              </span>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

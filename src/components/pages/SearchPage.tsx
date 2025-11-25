import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Film, ArrowLeft, Filter, ArrowDown } from 'lucide-react';
import { searchMovies, getGenres, getTrendingMovies, getCountries, getDiscoverMovies } from '../../services/tmdbService';
import { TMDBMovieResult } from '../../types';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Pagination from '../ui/Pagination';
import CustomDropdown from '../ui/CustomDropdown';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import useAddMovieStore from '../../stores/addMovieStore';
import Loading from '../ui/Loading';
import { useAuth } from '../providers/AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import useRecommendationsStore from '../../stores/recommendationsStore';
import { Movie } from '../../types';
import Lottie from 'lottie-react';
import { Sparkles, Popcorn } from 'lucide-react';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAddModal } = useAddMovieStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchPage, setSearchPage] = useState(1);
  const [totalSearchPages, setTotalSearchPages] = useState(1);

  // Discover movies state
  const [discoverMovies, setDiscoverMovies] = useState<TMDBMovieResult[]>([]);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [totalDiscoverPages, setTotalDiscoverPages] = useState(1);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  const { user } = useAuth();
  const { aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations } = useRecommendationsStore();
  const [suggestAnimation, setSuggestAnimation] = useState(null);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch('/loading_suggest.json')
      .then(res => res.json())
      .then(data => setSuggestAnimation(data))
      .catch(err => console.error('Error loading animation:', err));
  }, []);

  // Subscribe to user's saved movies to check which ones are already saved
  useEffect(() => {
    if (!user) {
      setSavedMovies([]);
      return;
    }
    const unsubscribe = subscribeToMovies(user.uid, (movies) => {
      setSavedMovies(movies);
    });
    return () => unsubscribe();
  }, [user]);

  // Auto-fetch recommendations when accessing the page if user is logged in and no AI recommendations yet
  useEffect(() => {
    if (user && aiRecommendations.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user, aiRecommendations.length, isAiLoading, refreshRecommendations]);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterGenres, setFilterGenres] = useState<(string | number)[]>([]);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [genres, setGenres] = useState<{ id: number, name: string }[]>([]);
  const [countries, setCountries] = useState<{ iso_3166_1: string, english_name: string, native_name: string }[]>([]);

  // Logic lấy dữ liệu ban đầu (Genres & Countries)
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [genreList, countriesList] = await Promise.all([
          getGenres(),
          getCountries(),
        ]);
        setGenres(genreList);
        setCountries(countriesList);
      } catch (error) {
        console.error("Error fetching static data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStaticData();
  }, []);

  // Auto-search when query changes (for search mode)
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

  // Reset discover page when filters change
  useEffect(() => {
    if (discoverMovies.length > 0) {
      setDiscoverPage(1);
    }
  }, [filterGenres, filterYear, filterCountry]);

  // Auto-load discover movies when page or filters change
  useEffect(() => {
    if (!isSearchMode && discoverMovies.length > 0) {
      const timer = setTimeout(async () => {
        setDiscoverLoading(true);
        const { results, totalPages } = await getDiscoverMovies({
          page: discoverPage,
          genres: filterGenres.map(g => String(g)),
          year: filterYear,
          country: filterCountry,
        });
        setDiscoverMovies(results);
        setTotalDiscoverPages(totalPages);
        setDiscoverLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [discoverPage, filterGenres, filterYear, filterCountry]);

  // Reset search page when query changes
  useEffect(() => {
    setSearchPage(1);
  }, [query]);

  const isSearchMode = query.trim().length > 0;
  const displayMovies = isSearchMode
    ? results
    : discoverMovies;

  const filteredResults = displayMovies.filter(movie => {
    if (filterType !== 'all' && movie.media_type !== filterType) return false;

    if (filterYear) {
      const date = movie.release_date || movie.first_air_date;
      if (!date || !date.startsWith(filterYear)) return false;
    }

    if (filterGenres.length > 0) {
      // Check if movie has at least one of the selected genres
      const hasMatchingGenre = filterGenres.some(g =>
        movie.genre_ids?.includes(Number(g))
      );
      if (!hasMatchingGenre) return false;
    }

    if (filterCountry) {
      if (!movie.origin_country || !movie.origin_country.includes(filterCountry)) return false;
    }

    return true;
  });

  const isLoading = isSearchMode ? loading : discoverLoading;
  const currentPage = isSearchMode ? searchPage : discoverPage;
  const totalPages = isSearchMode ? totalSearchPages : totalDiscoverPages;
  const setCurrentPage = isSearchMode ? setSearchPage : setDiscoverPage;

  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: (movie.media_type === 'tv' || movie.media_type === 'movie') ? movie.media_type : (filterType === 'tv' ? 'tv' : 'movie'),
    });
  };

  // Check if a movie is already saved
  const isMovieSaved = (movieId: number) => {
    return savedMovies.some(m => m.id === movieId);
  };

  // Handle search/discover
  const handleSearch = async () => {
    if (query.trim()) {
      // Search mode
      setLoading(true);
      const { results: data, totalPages } = await searchMovies(query, searchPage);
      setResults(data);
      setTotalSearchPages(totalPages);
      setLoading(false);
    } else {
      // Discover mode
      setDiscoverLoading(true);
      const { results, totalPages } = await getDiscoverMovies({
        page: discoverPage,
        genres: filterGenres.map(g => String(g)),
        year: filterYear,
        country: filterCountry,
      });
      setDiscoverMovies(results);
      setTotalDiscoverPages(totalPages);
      setDiscoverLoading(false);
    }
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">
            {discoverMovies.length > 0 ? "Duyệt tất cả phim" : "Tìm kiếm phim"}
          </h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Nhập tên phim ..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-16 focus:outline-none focus:border-primary/50 transition-all shadow-sm text-lg"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
            >
              Tìm
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2">
              <Filter size={16} className="text-text-muted" />
              <span className="text-sm font-medium text-text-muted">Lọc theo:</span>
            </div>

            <CustomDropdown
              options={[
                { value: 'all', label: 'Tất cả loại' },
                { value: 'movie', label: 'Phim lẻ' },
                { value: 'tv', label: 'TV Series' },
              ]}
              value={filterType}
              onChange={(value) => setFilterType(value as 'all' | 'movie' | 'tv')}
              placeholder="Chọn loại"
              className="flex-1 sm:flex-none"
            />


            <MultiSelectDropdown
              options={genres.map(g => ({ value: g.id, label: g.name }))}
              values={filterGenres}
              onChange={(values) => setFilterGenres(values)}
              placeholder="Chọn thể loại"
              className="flex-1 sm:flex-none min-w-[180px]"
              searchable={true}
              maxDisplay={1}
            />

            <CustomDropdown
              options={[
                { value: '', label: 'Tất cả quốc gia' },
                ...countries.map(c => ({ value: c.iso_3166_1, label: c.native_name })),
              ]}
              value={filterCountry}
              onChange={(value) => setFilterCountry(value as string)}
              placeholder="Chọn quốc gia"
              className="flex-1 sm:flex-none min-w-[140px]"
              searchable={true}
            />

            <input
              type="number"
              placeholder="Năm"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full sm:w-24 bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm flex-1 sm:flex-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <Loading fullScreen={false} size={40} className="py-20" />
        ) : !query && !discoverMovies.length && isAiLoading ? (
          <>
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-24 h-24">
                {suggestAnimation && <Lottie animationData={suggestAnimation} loop={true} />}
              </div>
              <p className="text-lg font-medium text-primary animate-pulse">Đang gợi ý phim cho bạn...</p>
            </div>
            {/* Always show trending movies even when AI is loading */}
            <div className="flex items-center gap-2">
              <Popcorn className="text-primary" size={18} />
              <h2 className="text-xl text-primary font-bold">Phim vừa ra mắt</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {trendingMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-2/3 w-full relative overflow-hidden">
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
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Saved Badge */}
                    {isMovieSaved(movie.id) && (
                      <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/50 backdrop-blur-md rounded-lg border border-white/20 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        <span className="text-xs font-bold text-white">Đã lưu</span>
                      </div>
                    )}
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
            </div>
          </>
        ) : (
          <>
            {!query && !discoverMovies.length && (
              <>
                {aiRecommendations.length > 0 && (
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={18} />
                      <h2 className="text-xl font-bold text-primary">
                        Đề xuất cho bạn
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => refreshRecommendations(user?.uid || '', true)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-text-main"
                    >
                      <RotateCcw size={16} />
                      <span>Làm mới</span>
                    </button>
                  </div>
                )}
                {aiRecommendations.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                    {aiRecommendations.map(movie => (
                      <div
                        key={movie.id}
                        onClick={() => handleSelectMovie(movie)}
                        className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="aspect-2/3 w-full relative overflow-hidden">
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
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Saved Badge */}
                          {isMovieSaved(movie.id) && (
                            <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/50 backdrop-blur-md rounded-lg border border-white/20 z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                              </svg>
                              <span className="text-xs font-bold text-white">Đã lưu</span>
                            </div>
                          )}
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
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Popcorn className="text-primary" size={18} />
                  <h2 className="text-xl text-primary font-bold">Phim vừa ra mắt</h2>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {(query || discoverMovies.length > 0) ? filteredResults.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-2/3 w-full relative overflow-hidden">
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
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Saved Badge */}
                    {isMovieSaved(movie.id) && (
                      <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/50 backdrop-blur-md rounded-lg border border-white/20 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        <span className="text-xs font-bold text-white">Đã lưu</span>
                      </div>
                    )}
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
              )) : trendingMovies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-2/3 w-full relative overflow-hidden">
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
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Saved Badge */}
                    {isMovieSaved(movie.id) && (
                      <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/50 backdrop-blur-md rounded-lg border border-white/20 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        <span className="text-xs font-bold text-white">Đã lưu</span>
                      </div>
                    )}
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
              {!query && discoverMovies.length === 0 && trendingMovies.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
                  <Search size={48} className="mb-4" />
                  <p>Nhập tên phim hoặc nhấn "Tìm" để duyệt tất cả phim</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!isLoading && filteredResults.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

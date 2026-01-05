import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Film, ArrowLeft, Filter, ArrowDown, User, X } from 'lucide-react';
import { searchMovies, getTrendingMovies, getCountries, getDiscoverMovies, searchPeople } from '../../services/tmdbService';
import { TMDBMovieResult, TMDBPerson, Movie } from '../../types';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { getDisplayTitleForTMDB } from '../../utils/movieUtils';
import Navbar from '../layout/Navbar';
import Pagination from '../ui/Pagination';
import CustomDropdown from '../ui/CustomDropdown';
import useAddMovieStore from '../../stores/addMovieStore';
import Loading from '../ui/Loading';
import { useAuth } from '../providers/AuthProvider';
import { subscribeToMovies } from '../../services/movieService';
import useRecommendationsStore from '../../stores/recommendationsStore';
import Lottie from 'lottie-react';
import { Sparkles, Star } from 'lucide-react';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAddModal } = useAddMovieStore();
  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'movies' | 'people'>('movies');
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [peopleResults, setPeopleResults] = useState<TMDBPerson[]>([]);
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
  const { aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations, historyMovies } = useRecommendationsStore();
  const [suggestAnimation, setSuggestAnimation] = useState(null);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch('/data/loading_suggest.json')
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

  // Calculate watched movies count
  const watchedMoviesCount = historyMovies.filter(m => (m.status || 'history') === 'history').length;

  // Auto-fetch recommendations when accessing the page if user is logged in and no AI recommendations yet
  useEffect(() => {
    if (user && aiRecommendations.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user, aiRecommendations.length, isAiLoading, refreshRecommendations]);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [countries, setCountries] = useState<{ iso_3166_1: string, english_name: string, native_name: string }[]>([]);

  // Logic lấy dữ liệu ban đầu (Countries)
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const countriesList = await getCountries();
        setCountries(countriesList);
      } catch (error) {
        console.error("Error fetching static data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStaticData();
  }, []);

  const isSearchMode = query.trim().length > 2;

  // Auto-search when query changes (for search mode)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        if (searchTab === 'movies') {
          const { results: data, totalPages } = await searchMovies(query, searchPage, filterYear);
          setResults(data);
          setTotalSearchPages(totalPages);
        } else {
          const { results: data, totalPages } = await searchPeople(query, searchPage);
          setPeopleResults(data);
          setTotalSearchPages(totalPages);
        }
        setLoading(false);
      } else {
        setResults([]);
        setPeopleResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, searchPage, searchTab, filterYear]);

  // Reset discover page when filters change
  useEffect(() => {
    setDiscoverPage(1);
  }, [filterYear, filterCountry, filterRating, sortBy, filterType]);

  // Auto-load discover movies when page or filters change
  useEffect(() => {
    if (isSearchMode) return;

    const hasFilters = filterYear || filterCountry || filterRating || sortBy !== 'popularity.desc' || filterType !== 'all';
    
    if (hasFilters) {
      const timer = setTimeout(async () => {
        setDiscoverLoading(true);
        const { results, totalPages } = await getDiscoverMovies({
          page: discoverPage,
          year: filterYear,
          country: filterCountry,
          rating: filterRating,
          sortBy: sortBy,
          type: filterType,
        });
        setDiscoverMovies(results);
        setTotalDiscoverPages(totalPages);
        setDiscoverLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDiscoverMovies([]);
      setDiscoverLoading(false);
    }
  }, [discoverPage, filterYear, filterCountry, filterRating, sortBy, filterType, isSearchMode]);

  // Reset search page when query changes
  useEffect(() => {
    setSearchPage(1);
  }, [query]);

  const displayMovies = isSearchMode
    ? results
    : discoverMovies;

  const filteredResults = displayMovies.filter(movie => {
    if (isSearchMode) {
      if (filterType !== 'all' && movie.media_type !== filterType) return false;
      if (filterCountry && movie.origin_country && !movie.origin_country.includes(filterCountry)) return false;
      if (filterRating && (movie.vote_average || 0) < Number(filterRating)) return false;
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

  // Check if a movie is already saved and get its status
  const getMovieStatus = (movieId: number): 'history' | 'watchlist' | null => {
    const movie = savedMovies.find(m => m.id === movieId);
    return movie ? movie.status || null : null;
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setFilterType('all');
    setFilterYear('');
    setFilterCountry('');
    setFilterRating('');
    setSortBy('popularity.desc');
    setResults([]);
    setDiscoverMovies([]);
    setPeopleResults([]);
    setSearchPage(1);
    setDiscoverPage(1);
    setLoading(false);
    setDiscoverLoading(false);
  };

  // Handle search/discover
  const handleSearch = async () => {
    if (query.trim().length > 2) {
      setLoading(true);
      if (searchTab === 'movies') {
        const { results: data, totalPages } = await searchMovies(query, searchPage, filterYear);
        setResults(data);
        setTotalSearchPages(totalPages);
      } else {
        const { results: data, totalPages } = await searchPeople(query, searchPage);
        setPeopleResults(data);
        setTotalSearchPages(totalPages);
      }
      setLoading(false);
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
            {searchTab === 'movies'
              ? (discoverMovies.length > 0 ? "Duyệt tất cả phim" : "Tìm kiếm phim")
              : "Tìm kiếm người"}
          </h1>
        </div>

        {/* Search Tabs */}
        <div className="flex gap-2 bg-surface border border-black/10 dark:border-white/10 rounded-xl p-1">
          <button
            onClick={() => {
              setSearchTab('movies');
              setSearchPage(1);
              setPeopleResults([]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${searchTab === 'movies'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-main'
              }`}
          >
            <Film size={18} />
            <span>Phim</span>
          </button>
          <button
            onClick={() => {
              setSearchTab('people');
              setSearchPage(1);
              setResults([]);
              setDiscoverMovies([]);
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${searchTab === 'people'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text-main'
              }`}
          >
            <User size={18} />
            <span>Người</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder={searchTab === 'movies' ? "Nhập tên phim ..." : "Nhập tên diễn viên, đạo diễn ..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-32 focus:outline-none focus:border-primary/50 transition-all shadow-sm text-lg"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-text-muted transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
              >
                Tìm
              </button>
            </div>
          </div>

          {searchTab === 'movies' && (
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

              <CustomDropdown
                options={[
                  { value: '', label: 'Tất cả năm' },
                  ...Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return { value: String(year), label: String(year) };
                  }),
                ]}
                value={filterYear}
                onChange={(value) => setFilterYear(value as string)}
                placeholder="Chọn năm"
                className="flex-1 sm:flex-none min-w-[120px]"
                searchable={true}
              />

              <CustomDropdown
                options={[
                  { value: '', label: 'Tất cả đánh giá' },
                  { value: '9', label: '9+ ⭐' },
                  { value: '8', label: '8+ ⭐' },
                  { value: '7', label: '7+ ⭐' },
                  { value: '6', label: '6+ ⭐' },
                  { value: '5', label: '5+ ⭐' },
                ]}
                value={filterRating}
                onChange={(value) => setFilterRating(value as string)}
                placeholder="Đánh giá"
                className="flex-1 sm:flex-none min-w-[140px]"
              />

              <CustomDropdown
                options={[
                  { value: 'popularity.desc', label: 'Phổ biến nhất' },
                  { value: 'vote_average.desc', label: 'Đánh giá cao' },
                  { value: 'primary_release_date.desc', label: 'Mới nhất' },
                  { value: 'primary_release_date.asc', label: 'Cũ nhất' },
                  { value: 'title.asc', label: 'Tên A-Z' },
                  { value: 'title.desc', label: 'Tên Z-A' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as string)}
                placeholder="Sắp xếp"
                className="flex-1 sm:flex-none min-w-[140px]"
              />

              {(filterType !== 'all' || filterCountry || filterYear || filterRating || sortBy !== 'popularity.desc') && (
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <Loading fullScreen={false} size={40} className="py-20" />
        ) : searchTab === 'people' && query.trim().length > 0 ? (
          <>
            {/* People Results */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {peopleResults.map(person => (
                <div
                  key={person.id}
                  onClick={() => navigate(`/person/${person.id}`)}
                  className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-2/3 w-full relative overflow-hidden">
                    {person.profile_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE_URL}${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-text-muted">
                        <User size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1" title={person.name}>
                      {person.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {person.known_for_department || 'N/A'}
                    </p>
                    {person.known_for && person.known_for.length > 0 && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">
                        {person.known_for.map(m => m.title || m.name).filter(Boolean).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No results message */}
            {peopleResults.length === 0 && query.length > 2 && (
              <div className="col-span-full text-center py-10 text-text-muted">
                Không tìm thấy kết quả nào.
              </div>
            )}

            {/* Pagination for people */}
            {peopleResults.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={searchPage}
                totalPages={totalPages}
                onPageChange={setSearchPage}
              />
            )}
          </>
        ) : !query && !discoverMovies.length && isAiLoading && searchTab === 'movies' ? (
          <>
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
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface transition-colors cursor-pointer text-text-main"
              >
                <RotateCcw size={16} />
                <span>Làm mới</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-24 h-24">
                {suggestAnimation && <Lottie animationData={suggestAnimation} loop={true} />}
              </div>
              <p className="text-lg font-medium text-primary animate-pulse">Đang gợi ý phim cho bạn...</p>
            </div>
            {/* Always show trending movies even when AI is loading */}
            <div className="flex items-center gap-2">
              <Star className="text-primary" size={18} />
              <h2 className="text-xl text-primary font-bold">Phim thịnh hành</h2>
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
                    {(() => {
                      const status = getMovieStatus(movie.id);
                      if (!status) return null;
                      return (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/60 backdrop-blur-md rounded-lg border border-white/20 z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                          <span className="text-xs font-bold text-white">{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1" title={getDisplayTitleForTMDB(movie)}>
                      {getDisplayTitleForTMDB(movie)}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {(movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A'} • {movie.media_type === 'tv' ? 'TV' : 'Movie'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searchTab === 'movies' ? (
          <>
            {!query && !discoverMovies.length && (
              <>
                {/* Always show header if user has watched enough movies */}
                {watchedMoviesCount >= 3 && (
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={18} />
                      <h2 className="text-xl font-bold text-primary">
                        Đề xuất cho bạn
                      </h2>
                    </div>

                    {aiRecommendations.length === 0 && !isAiLoading ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline text-sm text-text-muted">Không thể tải. </span>
                        <button
                          type="button"
                          onClick={() => refreshRecommendations(user?.uid || '', true)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-primary text-white hover:bg-primary/80 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <RotateCcw size={16} />
                          <span>Thử lại</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => refreshRecommendations(user?.uid || '', true)}
                        disabled={isAiLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface transition-colors cursor-pointer text-text-main"
                      >
                        <RotateCcw size={16} />
                        <span>Làm mới</span>
                      </button>
                    )}
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
                          {(() => {
                            const status = getMovieStatus(movie.id);
                            if (!status) return null;
                            return (
                              <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/60 backdrop-blur-md rounded-lg border border-white/20 z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                </svg>
                                <span className="text-xs font-bold text-white">{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1" title={getDisplayTitleForTMDB(movie)}>
                            {getDisplayTitleForTMDB(movie)}
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
                  <Star className="text-primary" size={18} />
                  <h2 className="text-xl text-primary font-bold">Phim thịnh hành</h2>
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
                    {(() => {
                      const status = getMovieStatus(movie.id);
                      if (!status) return null;
                      return (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/60 backdrop-blur-md rounded-lg border border-white/20 z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                          <span className="text-xs font-bold text-white">{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1" title={getDisplayTitleForTMDB(movie)}>
                      {getDisplayTitleForTMDB(movie)}
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
                    {(() => {
                      const status = getMovieStatus(movie.id);
                      if (!status) return null;
                      return (
                        <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/60 backdrop-blur-md rounded-lg border border-white/20 z-10">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                          <span className="text-xs font-bold text-white">{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1" title={getDisplayTitleForTMDB(movie)}>
                      {getDisplayTitleForTMDB(movie)}
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
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
            <Search size={48} className="mb-4" />
            <p>Nhập từ khóa để tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

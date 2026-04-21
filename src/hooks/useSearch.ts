import { useState, useEffect } from 'react';
import { 
  searchMovies, 
  getTrendingMovies, 
  getCountries, 
  getDiscoverMovies, 
  searchPeople 
} from '../services/tmdb';
import { TMDBMovieResult, TMDBPerson } from '../types';
import useMovieStore from '../stores/movieStore';
import useRecommendationsStore from '../stores/recommendationsStore';
import useAddMovieStore from '../stores/addMovieStore';

/** Logic tìm kiếm phim và người nổi tiếng. */
export const useSearch = (user: any) => {
  const { openAddModal } = useAddMovieStore();
  const { 
    aiRecommendations, 
    trendingMovies, 
    isAiLoading, 
    refreshRecommendations, 
    historyMovies 
  } = useRecommendationsStore();

  const [query, setQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'movies' | 'people'>('movies');
  const [results, setResults] = useState<TMDBMovieResult[]>([]);
  const [peopleResults, setPeopleResults] = useState<TMDBPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchPage, setSearchPage] = useState(1);
  const [totalSearchPages, setTotalSearchPages] = useState(1);

  const [discoverMovies, setDiscoverMovies] = useState<TMDBMovieResult[]>([]);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [totalDiscoverPages, setTotalDiscoverPages] = useState(1);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  const { movies: savedMovies } = useMovieStore();
  const [suggestAnimation, setSuggestAnimation] = useState(null);
  const [countries, setCountries] = useState<{ iso_3166_1: string, english_name: string, native_name: string }[]>([]);

  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity.desc');

  useEffect(() => {
    fetch('/data/loading_suggest.json')
      .then(res => res.json())
      .then(data => setSuggestAnimation(data))
      .catch(err => console.error('Error loading animation:', err));

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

  useEffect(() => {
    if (user && aiRecommendations.length === 0 && !isAiLoading) {
      refreshRecommendations(user.uid);
    }
  }, [user, aiRecommendations.length, isAiLoading, refreshRecommendations]);

  const isSearchMode = query.trim().length > 2;

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

  useEffect(() => {
    setDiscoverPage(1);
  }, [filterYear, filterCountry, filterRating, sortBy, filterType]);

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

  useEffect(() => {
    setSearchPage(1);
  }, [query]);

  const displayMovies = isSearchMode ? results : discoverMovies;

/** Lọc kết quả cục bộ. */
  const filteredResults = displayMovies.filter(movie => {
    if (isSearchMode) {
      if (filterType !== 'all' && movie.media_type !== filterType) return false;
      if (filterCountry && movie.origin_country && !movie.origin_country.includes(filterCountry)) return false;
      if (filterRating && (movie.vote_average || 0) < Number(filterRating)) return false;
    }
    return true;
  });

/** Mở modal thêm phim. */
  const handleSelectMovie = (movie: TMDBMovieResult) => {
    openAddModal({
      movie: movie,
      mediaType: (movie.media_type === 'tv' || movie.media_type === 'movie') 
        ? movie.media_type 
        : (filterType === 'tv' ? 'tv' : 'movie'),
    });
  };

/** Lấy trạng thái phim. */
  const getMovieStatus = (movieId: number): 'history' | 'watchlist' | null => {
    const movie = savedMovies.find(m => m.id === movieId);
    return movie ? movie.status || null : null;
  };

/** Reset tìm kiếm và bộ lọc. */
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

/** Xử lý tìm kiếm thủ công. */
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

  return {
    query, setQuery,
    searchTab, setSearchTab,
    results, peopleResults,
    loading, initialLoading,
    currentPage: isSearchMode ? searchPage : discoverPage,
    totalPages: isSearchMode ? totalSearchPages : totalDiscoverPages,
    setCurrentPage: isSearchMode ? setSearchPage : setDiscoverPage,
    discoverMovies, discoverLoading,
    aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations,
    historyMovies, suggestAnimation, countries,
    filterType, setFilterType,
    filterYear, setFilterYear,
    filterCountry, setFilterCountry,
    filterRating, setFilterRating,
    sortBy, setSortBy,
    filteredResults,
    handleSelectMovie, getMovieStatus,
    handleClear, handleSearch,
    isSearchMode,
    isLoading: isSearchMode ? loading : discoverLoading,
    watchedMoviesCount: historyMovies.filter(m => (m.status || 'history') === 'history').length
  };
};

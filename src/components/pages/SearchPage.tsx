import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../providers/AuthProvider';
import Navbar from '../layout/Navbar';
import Loading from '../ui/Loading';
import SearchHeader from '../search/SearchHeader';
import SearchFilters from '../search/SearchFilters';
import SearchResults from '../search/SearchResults';

/** Trang Tìm kiếm và Khám phá nội dung TMDB. */
const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const {
    query, setQuery,
    initialLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations,
    suggestAnimation,
    filterType, setFilterType,
    filterYear, setFilterYear,
    sortBy, setSortBy,
    filteredResults,
    handleSelectMovie, getMovieStatus,
    handleClear, handleSearch,
    isLoading,
    watchedMoviesCount
  } = useSearch(user);

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <SearchHeader 
          hasDiscoverMovies={discoverMovies.length > 0}
        />

        <SearchFilters 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          handleClear={handleClear}
          filterType={filterType}
          setFilterType={setFilterType}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <SearchResults 
          isLoading={isLoading}
          query={query}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isAiLoading={isAiLoading}
          aiRecommendations={aiRecommendations}
          trendingMovies={trendingMovies}
          discoverMovies={discoverMovies}
          filteredResults={filteredResults}
          suggestAnimation={suggestAnimation}
          watchedMoviesCount={watchedMoviesCount}
          getMovieStatus={getMovieStatus}
          handleSelectMovie={handleSelectMovie}
          refreshRecommendations={refreshRecommendations}
          userId={user?.uid || ''}
        />
      </div>
    </div>
  );
};

export default SearchPage;

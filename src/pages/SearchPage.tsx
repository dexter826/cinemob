import React from 'react';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../components/providers/AuthProvider';
import Loading from '../components/ui/Loading';
import SearchHeader from '../components/search/SearchHeader';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';

/** Trang Tìm kiếm và Khám phá nội dung TMDB. */
const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const {
    filters,
    updateFilter,
    initialLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations,
    suggestAnimation,
    filteredResults,
    handleSelectMovie, getMovieStatus,
    handleClear,
    isLoading,
    watchedMoviesCount
  } = useSearch(user);

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <SearchHeader 
          hasDiscoverMovies={discoverMovies.length > 0}
        />

        <SearchFilters 
          filters={filters}
          updateFilter={updateFilter}
          handleSearch={() => {}}
          handleClear={handleClear}
        />

        <SearchResults 
          isLoading={isLoading}
          query={filters.query}
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

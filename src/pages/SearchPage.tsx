import React from 'react';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../components/providers/AuthProvider';
import Loading from '../components/ui/Loading';
import SkeletonCard from '../components/ui/SkeletonCard';
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
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="h-10 w-48 bg-surface rounded-xl animate-pulse" />
        <div className="h-14 bg-surface rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
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

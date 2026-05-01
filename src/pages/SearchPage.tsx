import React from 'react';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../components/providers/AuthProvider';
import Loading from '../components/ui/Loading';
import SkeletonCard from '../components/ui/SkeletonCard';
import PageHeader from '../components/ui/PageHeader';
import { Search } from 'lucide-react';
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

  return (
    <div className="text-text-main transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader 
          icon={Search}
          title={discoverMovies.length > 0 ? "Khám phá điện ảnh" : "Tìm kiếm phim"}
          description="Tìm kiếm phim, series và khám phá các gợi ý mới nhất từ TMDB."
        />

        <SearchFilters 
          filters={filters}
          updateFilter={updateFilter}
          handleSearch={() => {}}
          handleClear={handleClear}
        />

        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default SearchPage;

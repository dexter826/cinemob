import { useSearch } from '../hooks/use-search';
import { useAuth } from '@/features/auth/components/auth-provider';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import PageHeader from '@/shared/components/ui/page-header';
import SearchFilters from '../components/search-filters';
import SearchResults from '../components/search-results';

/** Trang tìm kiếm và khám phá phim từ TMDB. */
function SearchPage() {
  const { user } = useAuth();
  const {
    filters,
    updateFilter,
    initialLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations,
    trendingMovies,
    isAiLoading,
    isTrendingLoading,
    refreshRecommendations,
    removeRecommendation,
    filteredResults,
    handleSelectMovie,
    getMovieStatus,
    handleClear,
    isLoading,
    watchedMoviesCount,
    suggestions,
    isSuggesting,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    submittedQuery,
    resultsError,
    retrySearch,
  } = useSearch(user);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader title={discoverMovies.length > 0 ? 'Khám phá điện ảnh' : 'Tìm kiếm phim'} />

      <SearchFilters
        filters={filters}
        updateFilter={updateFilter}
        handleSearch={handleSearch}
        handleClear={handleClear}
        suggestions={suggestions}
        isSuggesting={isSuggesting}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleSelectMovie={handleSelectMovie}
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
          query={submittedQuery}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isAiLoading={isAiLoading}
          isTrendingLoading={isTrendingLoading}
          aiRecommendations={aiRecommendations}
          trendingMovies={trendingMovies}
          discoverMovies={discoverMovies}
          filteredResults={filteredResults}
          watchedMoviesCount={watchedMoviesCount}
          getMovieStatus={getMovieStatus}
          handleSelectMovie={handleSelectMovie}
          refreshRecommendations={refreshRecommendations}
          removeRecommendation={removeRecommendation}
          userId={user?.uid || ''}
          resultsError={resultsError}
          retrySearch={retrySearch}
        />
      )}
    </div>
  );
}

export default SearchPage;

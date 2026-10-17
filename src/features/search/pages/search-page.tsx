import LoadingStatus from '@/shared/components/ui/loading-status';
import ErrorState from '@/shared/components/ui/error-state';
import { useSearch } from '../hooks/use-search';
import { useAuth } from '@/features/auth/components/auth-provider';
import PageHeader from '@/shared/components/ui/page-header';
import SearchFilters from '../components/search-filters';
import SearchResults from '../components/search-results';

/** Trang tìm kiếm và khám phá phim từ TMDB. */
function SearchPage() {
  const { user } = useAuth();
  const {
    filters,
    updateFilter,
    mode,
    currentPage,
    totalPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations,
    trendingMovies,
    isAiLoading,
    isTrendingLoading,
    aiError,
    trendingError,
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader title={mode === 'discover' ? 'Khám phá điện ảnh' : 'Tìm kiếm phim'} />

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

      <LoadingStatus>
        {isLoading
          ? 'Đang tải kết quả…'
          : resultsError
            ? 'Không tải được kết quả.'
            : mode !== 'home'
              ? `Có ${filteredResults.length} kết quả trên trang này.`
              : isAiLoading || isTrendingLoading
                ? 'Đang cập nhật gợi ý phim…'
                : ''}
      </LoadingStatus>
      {mode === 'home' && aiError && (
        <ErrorState
          compact
          title={aiError}
          description="Nội dung đã tải trước đó vẫn được giữ."
          retry={{
            label: 'Thử lại',
            onClick: () => {
              if (user) void refreshRecommendations(user.uid, true);
            },
          }}
        />
      )}
      {mode === 'home' && trendingError && (
        <ErrorState
          compact
          title={trendingError}
          description="Vui lòng thử lại."
          retry={{
            label: 'Thử lại',
            onClick: () => {
              if (user) void refreshRecommendations(user.uid, true);
            },
          }}
        />
      )}
      <div aria-busy={isLoading}>
        <SearchResults
          mode={mode}
          onClear={handleClear}
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
      </div>
    </div>
  );
}

export default SearchPage;

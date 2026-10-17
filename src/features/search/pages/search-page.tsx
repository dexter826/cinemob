import LoadingStatus from '@/shared/components/ui/loading-status';
import ErrorState from '@/shared/components/ui/error-state';
import { useSearch } from '../hooks/use-search';
import PageHeader from '@/shared/components/ui/page-header';
import SearchFilters from '../components/search-filters';
import SearchResults from '../components/search-results';

/** Trang tìm kiếm và khám phá phim từ TMDB. */
function SearchPage() {
  const {
    filters,
    updateFilter,
    mode,
    currentPage,
    totalPages,
    setCurrentPage,
    trendingMovies,
    isTrendingLoading,
    trendingError,
    refreshTrending,
    filteredResults,
    handleSelectMovie,
    getMovieStatus,
    handleClear,
    isLoading,
    suggestions,
    isSuggesting,
    showSuggestions,
    setShowSuggestions,
    handleSearch,
    submittedQuery,
    resultsError,
    retrySearch,
  } = useSearch();

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
              : isTrendingLoading
                ? 'Đang tải phim thịnh hành…'
                : ''}
      </LoadingStatus>

      {mode === 'home' && trendingError && (
        <ErrorState
          compact
          title={trendingError}
          description="Vui lòng thử lại."
          retry={{
            label: 'Thử lại',
            onClick: () => {
              void refreshTrending(true);
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
          isTrendingLoading={isTrendingLoading}
          trendingMovies={trendingMovies}
          filteredResults={filteredResults}
          getMovieStatus={getMovieStatus}
          handleSelectMovie={handleSelectMovie}
          refreshTrending={() => void refreshTrending(true)}
          resultsError={resultsError}
          retrySearch={retrySearch}
        />
      </div>
    </div>
  );
}

export default SearchPage;

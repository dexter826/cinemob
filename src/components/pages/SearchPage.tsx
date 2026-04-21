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
    searchTab, setSearchTab,
    peopleResults,
    initialLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    discoverMovies,
    aiRecommendations, trendingMovies, isAiLoading, refreshRecommendations,
    suggestAnimation, countries,
    filterType, setFilterType,
    filterYear, setFilterYear,
    filterCountry, setFilterCountry,
    filterRating, setFilterRating,
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
          searchTab={searchTab}
          onTabChange={(tab) => {
            setSearchTab(tab);
            setCurrentPage(1);
          }}
          hasDiscoverMovies={discoverMovies.length > 0}
        />

        <SearchFilters 
          query={query}
          setQuery={setQuery}
          searchTab={searchTab}
          handleSearch={handleSearch}
          handleClear={handleClear}
          filterType={filterType}
          setFilterType={setFilterType}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          countries={countries}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          filterRating={filterRating}
          setFilterRating={setFilterRating}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <SearchResults 
          isLoading={isLoading}
          searchTab={searchTab}
          query={query}
          peopleResults={peopleResults}
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

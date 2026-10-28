import LoadingStatus from '@/shared/components/ui/loading-status';
import Skeleton from '@/shared/components/ui/skeleton';
import ErrorState from '@/shared/components/ui/error-state';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateDMY } from '@/shared/utils/date-format';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';
import EmptyState from '@/shared/components/ui/empty-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import PageHeader from '@/shared/components/ui/page-header';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import { PersonMovieSection } from '../components/person/person-movie-section';
import { usePersonDetail, PERSON_MOVIES_PER_PAGE } from '../hooks/use-person-detail';

function PersonProfileSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-surface border border-border-default rounded-dialog p-5 sm:p-6"
    >
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        <Skeleton className="mx-auto md:mx-0 h-64 w-48 sm:h-80 sm:w-56 shrink-0 rounded-card" />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-card" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-card" />
            </div>
          </div>
          <div className="pt-4 border-t border-border-default space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const {
    loading,
    retry,
    person,
    error,
    searchQuery,
    setSearchQuery,
    selectedYears,
    setSelectedYears,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    showFilters,
    setShowFilters,
    availableYears,
    paginatedMovies,
    filteredMovies,
    totalPages,
  } = usePersonDetail(personId);
  const [showFullBio, setShowFullBio] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, setShowFilters]);

  const shouldShowSkeleton = loading;
  const showSkeleton = useDelayedSkeleton(shouldShowSkeleton);

  return (
    <div className="text-text-primary transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <LoadingStatus>{loading ? 'Đang tải thông tin nghệ sĩ…' : ''}</LoadingStatus>
        <PageHeader
          onBack={() => navigate(-1)}
          leading={<User className="text-primary w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />}
          loading={loading}
          title={person?.name || 'Chi tiết nghệ sĩ'}
          description={
            person?.place_of_birth
              ? `Nơi sinh: ${person.place_of_birth}`
              : 'Thông tin chi tiết nghệ sĩ'
          }
        />

        {error ? (
          <ErrorState
            title={error}
            description="Vui lòng thử lại."
            retry={{ label: 'Thử lại', onClick: retry }}
          />
        ) : shouldShowSkeleton ? (
          showSkeleton ? (
            <div aria-busy="true" className="space-y-6">
              <PersonProfileSkeleton />
              <div
                aria-hidden="true"
                className="flex flex-col md:flex-row md:items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-3 md:flex-1">
                  <Skeleton className="h-12 flex-1 rounded-none" />
                  <Skeleton className="h-11 w-11 shrink-0 rounded-control" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {Array.from({ length: PERSON_MOVIES_PER_PAGE }).map((_, i) => (
                  <SkeletonCard key={i} badges={1} />
                ))}
              </div>
            </div>
          ) : null
        ) : !person ? (
          <div className="max-w-6xl mx-auto py-20">
            <EmptyState
              icon={User}
              title={error || 'Không tìm thấy nghệ sĩ'}
              description="Thông tin chi tiết về nghệ sĩ này hiện không khả dụng."
              action={{
                label: 'Quay lại',
                onClick: () => navigate(-1),
              }}
            />
          </div>
        ) : (
          <>
            <div className="bg-surface border border-border-default rounded-dialog p-5 sm:p-6 overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 relative z-10">
                <div className="flex justify-center md:justify-start shrink-0">
                  <div className="relative group">
                    <img
                      src={getTMDBImageUrl(person.profile_path, 'h632')}
                      alt={person.name}
                      width={192}
                      height={256}
                      className="w-48 h-64 sm:w-56 sm:h-80 object-cover rounded-card border border-white/10"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-title-lg font-bold text-text-primary tracking-tight">
                        Thông tin cá nhân
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {person.birthday && (
                          <div className="flex items-center gap-4 p-3 rounded-card border border-border-default">
                            <div className="flex items-center justify-center text-primary">
                              <Calendar
                                size={18}
                                strokeWidth={1.5}
                                className="text-primary"
                                aria-hidden="true"
                              />
                            </div>
                            <div>
                              <div className="text-label-caps font-semibold text-text-secondary">
                                Ngày sinh
                              </div>
                              <div className="font-bold text-body">
                                {formatDateDMY(person.birthday)}
                              </div>
                            </div>
                          </div>
                        )}

                        {person.deathday && (
                          <div className="flex items-center gap-4 p-3 bg-danger/5 rounded-card border border-danger/20">
                            <div className="w-10 h-10 rounded-control bg-danger/10 flex items-center justify-center border border-danger/20">
                              <Calendar
                                size={18}
                                strokeWidth={1.5}
                                className="text-danger"
                                aria-hidden="true"
                              />
                            </div>
                            <div>
                              <div className="text-label-caps font-semibold text-danger">
                                Ngày mất
                              </div>
                              <div className="font-bold text-body text-danger">
                                {formatDateDMY(person.deathday)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {person.birthday && !person.deathday && (
                          <div className="flex items-center gap-4 p-3 rounded-card border border-border-default">
                            <div className="flex items-center justify-center text-primary">
                              <Users
                                size={18}
                                strokeWidth={1.5}
                                className="text-primary"
                                aria-hidden="true"
                              />
                            </div>
                            <div>
                              <div className="text-label-caps font-semibold text-text-secondary">
                                Tuổi
                              </div>
                              <div className="font-bold text-body">
                                {(() => {
                                  const [by, bm, bd] = (person.birthday || '')
                                    .split('-')
                                    .map(Number);
                                  if (!by || !bm || !bd) return '—';
                                  const birth = new Date(by, bm - 1, bd);
                                  const today = new Date();
                                  let age = today.getFullYear() - birth.getFullYear();
                                  const m = today.getMonth() - birth.getMonth();
                                  if (m < 0 || (m === 0 && today.getDate() < birth.getDate()))
                                    age--;
                                  return age;
                                })()}{' '}
                                tuổi
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {person.place_of_birth && (
                      <div className="mt-4 flex items-center gap-4 p-3 rounded-card border border-border-default">
                        <div className="flex items-center justify-center text-primary">
                          <MapPin
                            size={18}
                            strokeWidth={1.5}
                            className="text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <div className="text-label-caps font-semibold text-text-secondary">
                            Nơi sinh
                          </div>
                          <div className="font-bold text-body">{person.place_of_birth}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {person.biography && (
                    <div className="pt-4 border-t border-border-default">
                      <h2 className="text-title-md font-bold text-text-primary mb-3 tracking-tight">
                        Tiểu sử
                      </h2>
                      <div className="text-text-secondary leading-relaxed text-body">
                        <p
                          className={
                            showFullBio ? 'whitespace-pre-wrap break-words' : 'line-clamp-4'
                          }
                        >
                          {person.biography}
                        </p>
                        {person.biography.length > 200 && (
                          <button
                            onClick={() => setShowFullBio(!showFullBio)}
                            className="mt-3 text-primary hover:text-primary-hover font-bold text-body-sm flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {showFullBio ? (
                              <>
                                Thu gọn <ChevronUp size={14} strokeWidth={1.5} aria-hidden="true" />
                              </>
                            ) : (
                              <>
                                Xem thêm{' '}
                                <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <PersonMovieSection
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              showFilters={showFilters}
              onShowFiltersChange={setShowFilters}
              filterRef={filterRef}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              availableYears={availableYears}
              selectedYears={selectedYears}
              onSelectedYearsChange={setSelectedYears}
              paginatedMovies={paginatedMovies}
              filteredCount={filteredMovies.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PersonDetailPage;

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { PersonMovie, TMDBPerson } from '@/types';
import { getPersonMovieCredits, getPersonDetails } from '../services/tmdb';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import EmptyState from '@/shared/components/ui/EmptyState';
import SkeletonCard from '@/shared/components/ui/SkeletonCard';
import PageHeader from '@/shared/components/ui/PageHeader';
import { PersonMovieSection } from '../components/person/PersonMovieSection';

/** Chi tiết nghệ sĩ, diễn viên và danh sách phim liên quan. */
function PersonDetailPage() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'year'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFullBio, setShowFullBio] = useState(false);
  const itemsPerPage = 20;
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!personId) return;

      setLoading(true);
      setError(null);

      try {
        const [personData, movieCredits] = await Promise.all([
          getPersonDetails(personId),
          getPersonMovieCredits(Number(personId))
        ]);

        if (!personData) {
          throw new Error('Failed to fetch person details');
        }

        setPerson(personData);
        setMovies(movieCredits);
      } catch (err) {
        console.error('Failed to fetch person data:', err);
        setError('Không thể tải thông tin người này');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYears, sortBy, sortOrder]);

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
  }, [showFilters]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    movies.forEach(movie => {
      const date = movie.release_date || movie.first_air_date;
      if (date) {
        years.add(new Date(date).getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [movies]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    const result = movies.filter(movie => {
      const matchesSearch = !searchQuery ||
        (movie.title || movie.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear = selectedYears.length === 0 ||
        selectedYears.some(year => (movie.release_date || movie.first_air_date || '').startsWith(year));

      return matchesSearch && matchesYear;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = (a.title || a.name || '').localeCompare(b.title || b.name || '');
      } else {
        // Year sort
        const yearA = new Date(a.release_date || a.first_air_date || '1900-01-01').getFullYear();
        const yearB = new Date(b.release_date || b.first_air_date || '1900-01-01').getFullYear();
        comparison = yearA - yearB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, searchQuery, selectedYears, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="text-text-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader 
          onBack={() => navigate(-1)}
          icon={User}
          title={loading ? "Đang tải…" : person?.name || "Chi tiết nghệ sĩ"}
          description={person?.place_of_birth ? `Nơi sinh: ${person.place_of_birth}` : "Thông tin chi tiết nghệ sĩ"}
        />

        {loading ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-surface border border-border-default rounded-3xl p-5 sm:p-6 shadow-premium h-96 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : !person ? (
          <div className="max-w-7xl mx-auto py-20">
            <EmptyState
              icon={User}
              title={error || "Không tìm thấy nghệ sĩ"}
              description="Thông tin chi tiết về nghệ sĩ này hiện không khả dụng."
              action={{
                label: "Quay lại",
                onClick: () => navigate(-1)
              }}
            />
          </div>
        ) : (
          <>
            {/* Person Info Section */}
            <div className="bg-surface border border-border-default rounded-3xl p-5 sm:p-6 shadow-premium overflow-hidden relative">
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 relative z-10">
                {/* Person Image */}
                <div className="flex justify-center md:justify-start shrink-0">
                  <div className="relative group">
                    <img
                      src={getTMDBImageUrl(person.profile_path, 'h632')}
                      alt={person.name}
                      className="w-48 h-64 sm:w-56 sm:h-80 object-cover rounded-2xl shadow-premium border border-white/10"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Person Details */}
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-text-main tracking-tight">Thông tin cá nhân</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {person.birthday && (
                          <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Calendar size={18} className="text-primary" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">Ngày sinh</div>
                              <div className="font-bold text-sm">{new Date(person.birthday).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                        )}

                        {person.deathday && (
                          <div className="flex items-center gap-4 p-3 bg-error/5 rounded-2xl border border-error/20">
                            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center border border-error/20">
                              <Calendar size={18} className="text-error" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-error uppercase tracking-widest opacity-60">Ngày mất</div>
                              <div className="font-bold text-sm text-error">{new Date(person.deathday).toLocaleDateString('vi-VN')}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {person.birthday && !person.deathday && (
                          <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Users size={18} className="text-primary" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">Tuổi</div>
                              <div className="font-bold text-sm">
                                {(() => {
                                  const birth = new Date(person.birthday);
                                  if (Number.isNaN(birth.getTime())) return '—';
                                  const today = new Date();
                                  let age = today.getFullYear() - birth.getFullYear();
                                  const m = today.getMonth() - birth.getMonth();
                                  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                                  return age;
                                })()} tuổi
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {person.place_of_birth && (
                      <div className="mt-4 flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">Nơi sinh</div>
                          <div className="font-bold text-sm">{person.place_of_birth}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {person.biography && (
                    <div className="pt-4 border-t border-border-default">
                      <h2 className="text-lg font-bold text-text-main mb-3 tracking-tight">Tiểu sử</h2>
                      <div className="text-text-muted leading-relaxed text-sm">
                        <p className={showFullBio ? 'whitespace-pre-wrap' : 'line-clamp-4'}>
                          {person.biography}
                        </p>
                        {person.biography.length > 200 && (
                          <button
                            onClick={() => setShowFullBio(!showFullBio)}
                            className="mt-3 text-primary hover:text-primary-dark font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {showFullBio ? (
                              <>Thu gọn <ChevronUp size={14} /></>
                            ) : (
                              <>Xem thêm <ChevronDown size={14} /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search & Filter Bar + Results */}
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
};

export default PersonDetailPage;

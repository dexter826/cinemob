import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Film, Tv, User, Calendar, CalendarCheck, MapPin, Users, Star, X, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Type, Filter } from 'lucide-react';
import { PersonMovie, TMDBPerson } from '../../types';
import { getPersonMovieCredits } from '../../services/tmdbService';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE, TMDB_API_KEY } from '../../constants';
import Loading from '../ui/Loading';
import Pagination from '../ui/Pagination';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import Navbar from '../layout/Navbar';
import useAddMovieStore from '../../stores/addMovieStore';

const PersonDetailPage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [movies, setMovies] = useState<PersonMovie[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'year'>('year');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFullBio, setShowFullBio] = useState(false);
  const itemsPerPage = 20;
  const { openAddModal } = useAddMovieStore();
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!personId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch person details
        let personResponse = await fetch(
          `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&language=vi`
        );

        if (!personResponse.ok) throw new Error('Failed to fetch person details');

        let personData = await personResponse.json();

        // If biography is empty, try fetching in English
        if (!personData.biography) {
          const englishResponse = await fetch(
            `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&language=en`
          );
          if (englishResponse.ok) {
            const englishData = await englishResponse.json();
            personData.biography = englishData.biography;
          }
        }

        setPerson(personData);

        // Fetch person's movie credits
        const movieCredits = await getPersonMovieCredits(Number(personId));
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

  // Get unique genres and years for filters
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(movie => {
      // Note: TMDB doesn't provide genre info in person credits, so we'll skip genre filtering for now
    });
    return Array.from(genres).sort();
  }, [movies]);

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
    let result = movies.filter(movie => {
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

  const handleMovieClick = (movie: PersonMovie) => {
    // Open add movie modal with the selected movie
    openAddModal({
      movie: {
        id: movie.id,
        title: movie.title || movie.name || '',
        poster_path: movie.poster_path || '',
        release_date: movie.release_date || movie.first_air_date || '',
        media_type: movie.media_type,
      },
      mediaType: movie.media_type,
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-background text-text-main pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-main mb-4">
              {error || 'Không tìm thấy thông tin người này'}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{person.name}</h1>
        </div>


        {/* Person Info Section */}
        <div className="bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Person Image */}
            <div className="flex justify-center md:justify-start shrink-0">
              <img
                src={person.profile_path ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}` : PLACEHOLDER_IMAGE}
                alt={person.name}
                className="w-48 h-72 object-cover rounded-xl shadow-lg"
              />
            </div>

            {/* Person Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-text-main mb-4">Thông tin cá nhân</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-primary" />
                      <div>
                        <div className="text-sm text-text-muted">Nghề nghiệp</div>
                        <div className="font-medium">{person.known_for_department || 'Không rõ'}</div>
                      </div>
                    </div>

                    {person.birthday && (
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-primary" />
                        <div>
                          <div className="text-sm text-text-muted">Ngày sinh</div>
                          <div className="font-medium">{new Date(person.birthday).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    )}

                    {person.deathday && (
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-red-400" />
                        <div>
                          <div className="text-sm text-text-muted">Ngày mất</div>
                          <div className="font-medium">{new Date(person.deathday).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    )}

                    {person.birthday && !person.deathday && (
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-primary" />
                        <div>
                          <div className="text-sm text-text-muted">Tuổi</div>
                          <div className="font-medium">{new Date().getFullYear() - new Date(person.birthday).getFullYear()}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {person.gender !== undefined && (
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-primary" />
                        <div>
                          <div className="text-sm text-text-muted">Giới tính</div>
                          <div className="font-medium">
                            {person.gender === 1 ? 'Nữ' : person.gender === 2 ? 'Nam' : 'Không rõ'}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Star size={18} className="text-primary" />
                      <div>
                        <div className="text-sm text-text-muted">Độ phổ biến</div>
                        <div className="font-medium">{person.popularity?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {person.place_of_birth && (
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-primary" />
                      <div>
                        <div className="text-sm text-text-muted">Nơi sinh</div>
                        <div className="font-medium">{person.place_of_birth}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {person.biography && (
                <div>
                  <h2 className="text-xl font-semibold text-text-main mb-3">Tiểu sử</h2>
                  <div className="text-text-muted leading-relaxed">
                    <p className={showFullBio ? '' : 'line-clamp-3'}>
                      {person.biography}
                    </p>
                    {person.biography.length > 200 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-2 text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                      >
                        {showFullBio ? (
                          <>
                            Thu gọn <ChevronUp size={16} className="inline ml-1" />
                          </>
                        ) : (
                          <>
                            Xem thêm <ChevronDown size={16} className="inline ml-1" />
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

        {/* Search & Filter Bar + Results Count */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search & Filter Section - Left Half on Desktop */}
          <div className="flex flex-col items-end gap-3 relative md:flex-1">
            <div className="flex items-center gap-2 w-full">
              {/* Search Bar */}
              <div className="relative group flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="w-full bg-surface border-2 border-black/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-8 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
                className={`p-2 rounded-xl border-2 transition-colors cursor-pointer ${showFilters ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-black/10 dark:border-white/10 text-text-muted hover:text-text-main hover:border-primary/30'}`}
              >
                {showFilters ? <X size={20} /> : <Filter size={20} />}
              </button>
            </div>

            {/* Sorting Controls (Dropdown/Expandable) */}
            {showFilters && (
              <div ref={filterRef} className="absolute top-full right-0 mt-2 z-20 bg-surface p-4 rounded-xl border border-black/10 dark:border-white/10 shadow-xl flex flex-col gap-4 min-w-[280px]">

                {/* Sort Section */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Sắp xếp</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('year')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${sortBy === 'year' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'}`}
                    >
                      <Calendar size={14} />
                      <span>Năm</span>
                    </button>
                    <button
                      onClick={() => setSortBy('title')}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${sortBy === 'title' ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main'}`}
                    >
                      <Type size={14} />
                      <span>Tên</span>
                    </button>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-black/10 dark:bg-white/10" />

                {/* Filter Section */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lọc</div>

                  {/* Year Filter */}
                  <div>
                    <label className="text-xs text-text-muted mb-1.5 block">Năm phát hành</label>
                    <MultiSelectDropdown
                      options={availableYears.map(year => ({ value: year, label: year }))}
                      values={selectedYears}
                      onChange={(values) => setSelectedYears(values.map(v => v.toString()))}
                      placeholder="Chọn năm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count - Right Half on Desktop */}
          {paginatedMovies.length > 0 && (
            <div className="md:flex-1 md:flex md:justify-end">
              <p className="text-text-muted">
                Hiển thị {paginatedMovies.length} trong tổng số {filteredMovies.length} phim
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {paginatedMovies.length > 0 ? (
          <>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {paginatedMovies.map((movie) => (
                <div
                  key={`${movie.id}-${movie.media_type}`}
                  onClick={() => handleMovieClick(movie)}
                  className="group relative bg-surface rounded-xl overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-2/3 w-full relative overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-text-muted">
                        <Film size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10">
                      {movie.media_type === 'tv' ? (
                        <>
                          <Tv size={12} className="text-blue-400" />
                          <span className="text-xs font-bold text-white">TV</span>
                        </>
                      ) : (
                        <>
                          <Film size={12} className="text-green-400" />
                          <span className="text-xs font-bold text-white">Phim</span>
                        </>
                      )}
                    </div>

                    {/* Year Tag */}
                    {(movie.release_date || movie.first_air_date) && (
                      <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 z-10">
                        <CalendarCheck size={12} className="text-yellow-400" />
                        <span className="text-xs font-bold text-white">
                          {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1" title={movie.title || movie.name}>
                      {movie.title || movie.name || 'Không rõ'}
                    </h3>
                    {(movie.character || movie.job) && (
                      <p className="text-xs text-text-muted truncate">
                        {movie.character && `Nhân vật: ${movie.character}`}
                        {movie.job && `Công việc: ${movie.job}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
              <Film className="text-text-muted" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-main">
                Không tìm thấy phim nào
              </h3>
              <p className="text-text-muted max-w-xs mx-auto">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PersonDetailPage;
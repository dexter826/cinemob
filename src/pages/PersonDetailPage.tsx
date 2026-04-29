import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Film, User, Calendar, MapPin, Users, Star, X, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Type, Filter } from 'lucide-react';
import { PersonMovie, TMDBPerson } from '../types';
import TMDBMovieCard from '../components/ui/TMDBMovieCard';
import { getPersonMovieCredits } from '../services/tmdb';
import { PLACEHOLDER_IMAGE, TMDB_API_KEY } from '../constants';
import { getTMDBImageUrl } from '../utils/movieUtils';
import Loading from '../components/ui/Loading';
import Pagination from '../components/ui/Pagination';
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown';
import Navbar from '../components/layout/Navbar';
import useAddMovieStore from '../stores/addMovieStore';

const PersonDetailPage: React.FC = () => {
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

  if (loading) return <Loading />;

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
              className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-xl transition-colors"
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
            className="w-12 h-12 rounded-2xl bg-surface border border-border-default flex items-center justify-center text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-premium shrink-0"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{person.name}</h1>
        </div>

        {/* Person Info Section */}
        <div className="bg-surface border border-border-default rounded-3xl p-8 shadow-premium overflow-hidden relative">
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Person Image */}
            <div className="flex justify-center md:justify-start shrink-0">
              <div className="relative group">
                <img
                  src={getTMDBImageUrl(person.profile_path, 'h632')}
                  alt={person.name}
                  className="w-56 h-80 object-cover rounded-2xl shadow-premium border border-white/10"
                />
                <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Person Details */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-main tracking-tight">Thông tin cá nhân</h2>
                  <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg border border-primary/20">
                    TMDB ID: {person.id}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Nghề nghiệp</div>
                        <div className="font-bold text-sm">{person.known_for_department || 'N/A'}</div>
                      </div>
                    </div>

                    {person.birthday && (
                      <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Calendar size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Ngày sinh</div>
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
                          <div className="text-[10px] font-bold text-error uppercase tracking-widest opacity-60">Ngày mất</div>
                          <div className="font-bold text-sm text-error">{new Date(person.deathday).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Users size={18} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Giới tính / Tuổi</div>
                        <div className="font-bold text-sm">
                          {person.gender === 1 ? 'Nữ' : person.gender === 2 ? 'Nam' : 'N/A'} 
                          {person.birthday && !person.deathday && ` · ${new Date().getFullYear() - new Date(person.birthday).getFullYear()} tuổi`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                      <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
                        <Star size={18} className="text-warning" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Độ phổ biến</div>
                        <div className="font-bold text-sm">{person.popularity?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {person.place_of_birth && (
                  <div className="mt-4 flex items-center gap-4 p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-default">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Nơi sinh</div>
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
                        className="mt-3 text-primary hover:text-primary-dark font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-all cursor-pointer"
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

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
          <div className="flex items-center gap-3 relative md:flex-1">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm phim của nghệ sĩ này..."
                className="w-full bg-surface border border-border-default rounded-2xl py-3 pl-12 pr-10 text-sm font-medium text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 shadow-premium transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-muted transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all shadow-premium cursor-pointer ${showFilters ? 'bg-primary border-primary text-white' : 'bg-surface border-border-default text-text-muted hover:border-primary/50'}`}
            >
              <Filter size={20} />
            </button>

            {showFilters && (
              <div ref={filterRef} className="absolute top-full left-0 md:left-auto md:right-0 mt-3 z-30 bg-surface/95 backdrop-blur-2xl p-6 rounded-3xl border border-border-default shadow-premium flex flex-col gap-6 min-w-[320px] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Sắp xếp theo</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSortBy('year')} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${sortBy === 'year' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:bg-black/10 dark:hover:bg-white/10'}`}>
                      <Calendar size={14} /> <span>Năm</span>
                    </button>
                    <button onClick={() => setSortBy('title')} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${sortBy === 'title' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-text-muted hover:bg-black/10 dark:hover:bg-white/10'}`}>
                      <Type size={14} /> <span>Tên</span>
                    </button>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 text-text-muted hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-transparent cursor-pointer ml-auto">
                      {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      <span>{sortOrder === 'asc' ? 'Tăng' : 'Giảm'}</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border-default" />

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">Lọc nâng cao</div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Năm phát hành</label>
                    <MultiSelectDropdown
                      options={availableYears.map(year => ({ value: year, label: year }))}
                      values={selectedYears}
                      onChange={(values) => setSelectedYears(values.map(v => v.toString()))}
                      placeholder="Tất cả các năm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {paginatedMovies.length > 0 && (
            <div className="flex items-center justify-end">
              <span className="text-[10px] font-bold text-text-muted bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-border-default uppercase tracking-widest">
                Hiển thị {paginatedMovies.length} / {filteredMovies.length} mục
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {paginatedMovies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {paginatedMovies.map((movie) => (
                <TMDBMovieCard
                  key={`${movie.id}-${movie.media_type}`}
                  movie={movie}
                  onClick={() => handleMovieClick(movie)}
                  character={movie.character}
                  job={movie.job}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-3xl border border-border-default shadow-premium">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-border-default">
              <Film className="text-text-muted opacity-40" size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">Không tìm thấy phim</h3>
            <p className="text-text-muted/60 text-sm max-w-xs text-center">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetailPage;
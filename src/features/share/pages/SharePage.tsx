import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Film, Share2, Star, Search, X } from 'lucide-react';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import CustomDropdown from '@/shared/components/ui/CustomDropdown';
import logoText from '@/assets/images/logo_text.png';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import { getPublicShare } from '@/features/share/services/shareService';
import type { PublicShare } from '@/types';

type SortOption = 'default' | 'rating-desc' | 'year-desc' | 'year-asc';

const SORT_OPTIONS = [
  { value: 'default', label: 'Thứ tự mặc định' },
  { value: 'rating-desc', label: 'Đánh giá cao nhất' },
  { value: 'year-desc', label: 'Năm phát hành (Mới nhất)' },
  { value: 'year-asc', label: 'Năm phát hành (Cũ nhất)' },
];

/** Trang công khai xem danh sách phim được chia sẻ */
function SharePage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicShare | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    let cancelled = false;
    const fetchShare = async () => {
      if (!uid) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const share = await getPublicShare(uid);
        if (cancelled) return;
        if (!share || !share.isEnabled) {
          setNotFound(true);
        } else {
          setData(share);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchShare();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const rawMovies = useMemo(() => {
    return Array.isArray(data?.movies) ? data.movies : [];
  }, [data]);

  const filteredMovies = useMemo(() => {
    let result = [...rawMovies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.title_vi && m.title_vi.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'year-desc') {
      result.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    } else if (sortBy === 'year-asc') {
      result.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
    }

    return result;
  }, [rawMovies, searchQuery, sortBy]);

  if (loading) return <Loading fullScreen />;

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <EmptyState
          icon={Share2}
          title="Link không khả dụng"
          description="Link đã tắt hoặc không tồn tại."
          action={{ label: 'Về trang chủ', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center gap-2">
          <img src={logoText} alt="CineMOB" className="h-7 w-auto" />
          <span className="text-xs font-semibold text-text-secondary">Chia sẻ công khai</span>
        </header>
        {/* User Profile Header */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {data.photoURL ? (
              <img
                src={data.photoURL}
                alt={data.displayName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-border-default shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary border border-primary/20 shrink-0">
                {(data.displayName || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">{data.displayName}</h1>
              <p className="text-xs sm:text-sm text-text-muted">{data.totalCount} phim đã xem</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-border-default hover:border-primary/50 text-text-main hover:text-primary transition-colors text-xs sm:text-sm font-semibold cursor-pointer text-center"
          >
            Mở CineMOB
          </button>
        </div>

        {rawMovies.length === 0 ? (
          <EmptyState
            icon={Film}
            title="Chưa có phim nào"
            description="Danh sách chia sẻ này chưa có phim nào."
          />
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <label htmlFor="share-search" className="sr-only">Tìm phim trong danh sách được chia sẻ</label>
                <input
                  id="share-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phim theo tên tiếng Anh hoặc tiếng Việt…"
                  className="w-full bg-surface border border-border rounded-2xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1"
                    aria-label="Xóa từ khóa tìm kiếm"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:w-64 shrink-0">
                <div className="w-full">
                  <CustomDropdown
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(val) => setSortBy(val as SortOption)}
                    placeholder="Sắp xếp…"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between text-xs text-text-muted px-1">
                <span>
                  Tìm thấy <strong className="text-primary font-bold">{filteredMovies.length}</strong> / {rawMovies.length} phim
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Movie Grid or Empty Search */}
            {filteredMovies.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Không tìm thấy phim phù hợp"
                description={`Không có bộ phim nào khớp với từ khóa "${searchQuery}"`}
                action={{
                  label: 'Xem tất cả phim',
                  onClick: () => setSearchQuery(''),
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {filteredMovies.map((movie) => {
                  const poster = movie.poster_path ? getTMDBImageUrl(movie.poster_path, 'w500') : PLACEHOLDER_IMAGE;
                  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
                  return (
                    <div
                      key={String(movie.id)}
                      className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col"
                    >
                      <div className="aspect-2/3 bg-black/5 dark:bg-white/5 overflow-hidden">
                        <img
                          src={poster}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-bold text-text-primary line-clamp-1">
                            {movie.title}
                          </p>
                          {movie.title_vi && movie.title_vi !== movie.title && (
                            <p className="text-xs text-text-muted italic line-clamp-1 mt-0.5">
                              {movie.title_vi}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-border-default/50 flex items-center justify-between text-xs text-text-muted">
                          {year ? <span>{year}</span> : <span />}
                          {!!movie.rating && movie.rating > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-text-main">
                              <Star size={13} className="text-amber-400 fill-amber-400" />
                              {movie.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SharePage;

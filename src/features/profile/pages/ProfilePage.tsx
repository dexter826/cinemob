import { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, Camera, User, Mail, CalendarDays, ArrowRight, Film } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import PageHeader from '@/shared/components/ui/PageHeader';
import { IconButton } from '@/shared/components/ui/IconButton';
import EmptyState from '@/shared/components/ui/EmptyState';
import useToastStore from '@/shared/stores/toastStore';
import useMovieStore from '@/features/movies/stores/movieStore';
import useMovieDetailStore from '@/features/movies/stores/movieDetailStore';
import { getTMDBImageUrl, getMainTitle, normalizeMovieDate } from '@/features/movies/utils/movieUtils';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { updateDisplayName, validateDisplayName, FALLBACK_DISPLAY_NAME } from '../services/profileService';

const ChangeAvatarModal = lazy(() => import('@/features/auth/components/ChangeAvatarModal').then((m) => ({ default: m.ChangeAvatarModal })));

const RECENT_COUNT = 10;

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return 'Không rõ';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const { movies, loading } = useMovieStore();
  const { openDetailModal } = useMovieDetailStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const recentMovies = useMemo(() => {
    return movies
      .filter((m) => m.status === 'history')
      .sort((a, b) => {
        const da = normalizeMovieDate(a.watched_at)?.getTime() ?? 0;
        const db = normalizeMovieDate(b.watched_at)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, RECENT_COUNT);
  }, [movies]);

  if (!user) return null;
  const displayName = user.displayName || FALLBACK_DISPLAY_NAME;
  const joinDate = formatJoinDate(user.metadata?.creationTime);

  const startEdit = () => {
    setDraft(displayName);
    setFieldError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFieldError(null);
  };

  const saveEdit = async () => {
    const checked = validateDisplayName(draft);
    if (!checked.ok) {
      setFieldError(checked.error);
      return;
    }
    if (checked.value === displayName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setFieldError(null);
    try {
      await updateDisplayName(user, checked.value);
      await refreshUser();
      showToast('Đã cập nhật tên hiển thị', 'success');
      setIsEditing(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật tên';
      setFieldError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader
        title="Hồ sơ"
        description="Thông tin tài khoản CineMOB của bạn."
        onBack={() => navigate('/')}
      />

      <section aria-labelledby="profile-info-title" className="relative overflow-hidden bg-surface border border-border rounded-3xl">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 p-5 sm:p-8">
          <div className="relative shrink-0 self-start">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-primary/20" />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-primary/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAvatarOpen(true)}
              aria-label="Đổi ảnh đại diện"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elevated hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Camera size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            {!isEditing ? (
              <div className="flex items-center gap-2 min-w-0">
                <h2 id="profile-info-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary truncate font-display">{displayName}</h2>
                <IconButton label="Sửa tên hiển thị" onClick={startEdit} size="sm">
                  <Pencil size={15} aria-hidden="true" />
                </IconButton>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    maxLength={50}
                    disabled={isSaving}
                    aria-label="Tên hiển thị mới"
                    className="flex-1 min-w-0 px-3 h-11 rounded-xl border border-border bg-surface-elevated text-base text-text-primary outline-none focus:border-primary"
                  />
                  <IconButton label="Lưu tên" onClick={saveEdit} disabled={isSaving} size="sm">
                    <Check size={15} aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Hủy sửa tên" onClick={cancelEdit} disabled={isSaving} size="sm">
                    <X size={15} aria-hidden="true" />
                  </IconButton>
                </div>
                {fieldError && <p role="alert" className="mt-2 text-xs text-danger">{fieldError}</p>}
              </div>
            )}
            <ul className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-5 sm:gap-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2 min-w-0">
                <Mail size={14} className="shrink-0 text-text-secondary" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays size={14} className="shrink-0 text-text-secondary" aria-hidden="true" />
                <span>Tham gia {joinDate}</span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary bg-black/5 dark:bg-white/5 border border-border rounded-full px-2.5 py-1">
                  <User size={12} aria-hidden="true" /> Google
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="profile-recent-title" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="profile-recent-title" className="text-lg font-bold tracking-tight text-text-primary">Vừa xem gần đây</h2>
          {recentMovies.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              Xem tất cả
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-28 sm:w-36 shrink-0">
                <div className="aspect-2/3 w-full rounded-2xl bg-surface animate-pulse" />
                <div className="mt-2 h-3 w-3/4 rounded bg-surface animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentMovies.length === 0 ? (
          <EmptyState
            icon={Film}
            title="Chưa có phim đã xem"
            description="Phim bạn xem sẽ hiện ở đây để tiện mở lại."
            compact
          />
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
            {recentMovies.map((movie) => {
              const title = getMainTitle(movie);
              const poster = movie.poster_path
                ? (movie.source === 'tmdb' ? getTMDBImageUrl(movie.poster_path, 'w342') : movie.poster_path)
                : PLACEHOLDER_IMAGE;
              return (
                <button
                  key={movie.docId ?? movie.id}
                  type="button"
                  onClick={() => openDetailModal(movie)}
                  aria-label={`Xem chi tiết phim ${title}`}
                  className="group w-28 sm:w-36 shrink-0 snap-start text-left cursor-pointer rounded-2xl focus-visible:outline-none"
                >
                  <span className="block aspect-2/3 w-full overflow-hidden rounded-2xl border border-border group-hover:border-primary/40 transition-colors duration-300">
                    <img
                      src={poster}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-text-primary truncate">{title}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        <ChangeAvatarModal isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
      </Suspense>
    </main>
  );
}

export default ProfilePage;

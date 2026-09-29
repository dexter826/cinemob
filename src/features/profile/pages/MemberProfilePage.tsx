import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EyeOff, Link2, Users } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import PageHeader from '@/shared/components/ui/PageHeader';
import IconButton from '@/shared/components/ui/IconButton';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import { getMemberProfile, buildProfileMovies } from '../services/memberProfileService';
import OwnProfileEditor from '../components/OwnProfileEditor';
import MemberProfileCard from '../components/MemberProfileCard';
import MovieListSection from '../components/MovieListSection';
import ProfileMovieCard from '../components/ProfileMovieCard';
import { useOwnProfile } from '../hooks/useOwnProfile';
import { getCommonMovies } from '../utils/commonMovies';
import type { MemberProfile } from '@/types';

/** Trang cá nhân thành viên: chính chủ chỉnh sửa inline, thành viên khác chỉ xem. */
function MemberProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { movies: myMovies, loading: myMoviesLoading } = useMovieStore();
  const own = useOwnProfile();

  const isOwn = Boolean(user && uid && user.uid === uid);

  const { showToast } = useToastStore();

  // Copy link trang cá nhân hiện tại vào clipboard kèm toast xác nhận.
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết trang cá nhân', 'success');
    } catch {
      showToast('Không thể sao chép liên kết', 'error');
    }
  };

  const copyLinkButton = (
    <IconButton
      label="Sao chép liên kết trang cá nhân"
      variant="secondary"
      size="md"
      onClick={() => void handleCopyLink()}
    >
      <Link2 size={18} aria-hidden="true" />
    </IconButton>
  );

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'common' | 'all'>('common');

  useEffect(() => {
    if (isOwn || !uid) {
      setProfile(null);
      setNotFound(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setActiveTab('common');
    getMemberProfile(uid)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setNotFound(data === null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwn, uid]);

  const otherMovies = useMemo(() => (isOwn ? [] : (profile?.movies ?? [])), [isOwn, profile]);
  const ownListMovies = useMemo(
    () => (isOwn ? buildProfileMovies(myMovies) : []),
    [isOwn, myMovies],
  );

  const commonMovies = useMemo(() => {
    if (isOwn || !profile || profile.isMovieListHidden) return null;
    return getCommonMovies(myMovies, profile.movies);
  }, [isOwn, myMovies, profile]);

  if (!user || !uid) return <Loading fullScreen />;

  if (isOwn) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader title="Trang cá nhân" actions={copyLinkButton} />
        <OwnProfileEditor
          profile={own.profile}
          loading={own.loading}
          saving={own.saving}
          toggling={own.toggling}
          onSaveDetails={own.saveDetails}
          onToggleHidden={own.toggleMovieListHidden}
        />

        {own.profile?.isMovieListHidden && (
          <p className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xs sm:text-sm text-text-secondary">
            <EyeOff size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
            Danh sách phim đang ẩn với thành viên khác, chỉ bạn thấy mục này.
          </p>
        )}

        <section aria-label="Danh sách phim đã xem" className="space-y-4">
          <h2 className="sr-only">Danh sách phim đã xem</h2>
          <MovieListSection
            movies={ownListMovies}
            isLoading={myMoviesLoading}
            emptyTitle="Chưa có phim nào"
            emptyDescription="Thêm phim vào lịch sử xem."
          />
        </section>
      </main>
    );
  }

  if (loading) return <Loading fullScreen />;

  if (notFound || !profile) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <EmptyState
          icon={EyeOff}
          title="Không tìm thấy hồ sơ"
          description="Hồ sơ không tồn tại hoặc thành viên chưa mở app sau bản cập nhật."
        />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
      <PageHeader title="Hồ sơ thành viên" actions={copyLinkButton} />
      <MemberProfileCard profile={profile} />

      {profile.isMovieListHidden ? (
        <EmptyState
          icon={EyeOff}
          title="Đã ẩn danh sách phim"
          description="Thành viên này chọn ẩn danh sách phim đã xem."
        />
      ) : (
        <>
          <section aria-label="Phim đã xem" className="space-y-4">
            <div
              role="tablist"
              aria-label="Phim của thành viên"
              className="inline-flex items-center bg-black/5 dark:bg-white/5 rounded-full p-1 relative border border-border-default overflow-hidden"
            >
              <div
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out ${
                  activeTab === 'common' ? 'translate-x-0' : 'translate-x-full'
                }`}
              />
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'common'}
                onClick={() => setActiveTab('common')}
                className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors cursor-pointer relative z-10 ${
                  activeTab === 'common' ? 'text-white' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Phim chung
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-sm font-bold rounded-full transition-colors cursor-pointer relative z-10 ${
                  activeTab === 'all' ? 'text-white' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Tất cả phim
              </button>
            </div>

            {activeTab === 'common' &&
              (commonMovies && commonMovies.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base font-bold text-text-main tracking-tight font-display">
                    Bạn và {profile.displayName} đã xem chung{' '}
                    <span className="text-primary">{commonMovies.length}</span> phim
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                    {commonMovies.map((movie) => (
                      <ProfileMovieCard key={String(movie.id)} movie={movie} />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Chưa xem chung phim nào"
                  description={`Danh sách phim của ${profile.displayName} đang ở tab Tất cả phim.`}
                />
              ))}

            {activeTab === 'all' && (
              <MovieListSection
                movies={otherMovies}
                emptyTitle="Chưa có phim nào"
                emptyDescription="Hồ sơ này chưa có phim đã xem nào."
              />
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default MemberProfilePage;

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BarChart2, EyeOff, Link2, Users } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import useToastStore from '@/shared/stores/toast-store';
import PageHeader from '@/shared/components/ui/page-header';
import IconButton from '@/shared/components/ui/icon-button';
import Loading from '@/shared/components/ui/loading';
import EmptyState from '@/shared/components/ui/empty-state';
import { getMemberProfile, buildProfileMovies } from '../services/member-profile-service';
import OwnProfileEditor from '../components/own-profile-editor';
import MemberProfileCard from '../components/member-profile-card';
import MovieListSection from '../components/movie-list-section';
import PosterCard from '@/features/movies/components/poster-card';
import { formatDateAny } from '@/shared/utils/date-format';
import { useOwnProfile } from '../hooks/use-own-profile';
import { getCommonMovies } from '../utils/common-movies';
import type { MemberProfile } from '@/types';

/** Trang cá nhân thành viên: chính chủ chỉnh sửa inline, thành viên khác chỉ xem. */
function MemberProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<'common' | 'all'>(() =>
    searchParams.get('tab') === 'all' ? 'all' : 'common',
  );

  const setActiveTab = (tab: 'common' | 'all') => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (tab === 'all') params.set('tab', tab);
      else params.delete('tab');
      return params;
    });
  };

  const lastUidRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isOwn || !uid) {
      setProfile(null);
      setNotFound(false);
      setLoading(false);
      return;
    }
    // Đổi thành viên thì về tab mặc định, không đụng deep-link lần đầu vào trang.
    if (lastUidRef.current !== undefined && lastUidRef.current !== uid) {
      setActiveTabState('common');
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.delete('tab');
          return params;
        },
        { replace: true },
      );
    }
    lastUidRef.current = uid;
    let cancelled = false;
    setLoading(true);
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
  }, [isOwn, uid, setSearchParams]);

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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
        <PageHeader
          title="Trang cá nhân"
          actions={
            <>
              <IconButton
                label="Xem thống kê phim đã xem"
                variant="secondary"
                size="md"
                onClick={() => navigate('/stats')}
              >
                <BarChart2 size={18} aria-hidden="true" />
              </IconButton>
              {copyLinkButton}
            </>
          }
        />
        <OwnProfileEditor
          profile={own.profile}
          loading={own.loading}
          saving={own.saving}
          toggling={own.toggling}
          onSaveDetails={own.saveDetails}
          onToggleHidden={own.toggleMovieListHidden}
        />

        <section aria-label="Danh sách phim đã xem" className="space-y-4">
          <h2 className="sr-only">Danh sách phim đã xem</h2>
          <MovieListSection
            movies={ownListMovies}
            isLoading={myMoviesLoading}
            emptyTitle="Chưa có phim nào"
            emptyDescription="Thêm phim vào lịch sử xem."
          />
        </section>
      </div>
    );
  }

  if (loading) return <Loading fullScreen />;

  if (notFound || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <EmptyState
          icon={EyeOff}
          title="Không tìm thấy hồ sơ"
          description="Không tìm thấy hồ sơ này."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5 md:space-y-6">
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
            <div role="group" aria-label="Phim của thành viên" className="flex items-center border-b border-border">
              {(
                [
                  { key: 'common', label: 'Phim chung' },
                  { key: 'all', label: 'Tất cả phim' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center h-11 px-3.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                      isActive
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === 'common' &&
              (commonMovies && commonMovies.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base font-bold text-text-primary tracking-tight font-display">
                    Bạn và {profile.displayName} đã xem chung{' '}
                    <span className="text-primary">{commonMovies.length}</span> phim
                  </p>
                  <div className="grid cv-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {commonMovies.map((movie) => (
                      <PosterCard
                        key={String(movie.id)}
                        title={movie.title_vi || movie.title}
                        posterPath={movie.poster_path ?? null}
                        mediaType={movie.media_type}
                        rating={movie.rating}
                        review={movie.is_review}
                        meta={
                          movie.watched_at
                            ? formatDateAny(movie.watched_at)
                            : movie.release_date
                              ? movie.release_date.slice(0, 4)
                              : undefined
                        }
                      />
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
    </div>
  );
}

export default MemberProfilePage;

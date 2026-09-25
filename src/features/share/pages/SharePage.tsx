import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Film, Share2, Star } from 'lucide-react';
import Loading from '@/shared/components/ui/Loading';
import EmptyState from '@/shared/components/ui/EmptyState';
import { PLACEHOLDER_IMAGE } from '@/constants';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';
import { getPublicShare } from '@/features/share/services/shareService';
import type { PublicShare } from '@/types';

const SharePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicShare | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const movies = Array.isArray(data.movies) ? data.movies : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-surface border border-border-default rounded-3xl p-6 mb-8 flex items-center gap-4 shadow-sm">
          {data.photoURL ? (
            <img
              src={data.photoURL}
              alt={data.displayName}
              className="w-16 h-16 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {(data.displayName || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-text-main tracking-tight">{data.displayName}</h1>
            <p className="text-sm text-text-muted">{data.totalCount} phim đã xem</p>
          </div>
        </div>

        {movies.length === 0 ? (
          <EmptyState
            icon={Film}
            title="Chưa có phim nào"
            description="Danh sách chia sẻ này chưa có phim nào."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => {
              const poster = movie.poster_path ? getTMDBImageUrl(movie.poster_path, 'w500') : PLACEHOLDER_IMAGE;
              const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
              return (
                <div
                  key={String(movie.id)}
                  className="bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="aspect-[2/3] bg-black/5 dark:bg-white/5">
                    <img
                      src={poster}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-text-main truncate">{movie.title}</p>
                    {movie.title_vi && movie.title_vi !== movie.title && (
                      <p className="text-xs text-text-muted italic truncate">{movie.title_vi}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                      {year && <span>{year}</span>}
                      {!!movie.rating && movie.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400" fill="currentColor" />
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
      </div>
    </div>
  );
};

export default SharePage;

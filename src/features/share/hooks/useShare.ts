import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import { buildShareMovies, getPublicShare, setShareEnabled, upsertPublicShare } from '../services/shareService';
export const useShare = () => {
  const { user } = useAuth();
  const { movies } = useMovieStore();
  const { showToast } = useToastStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const uid = user?.uid || '';
  const shareUrl = uid ? `${window.location.origin}/share/${uid}` : '';
  useEffect(() => {
    const load = async () => {
      if (!uid) { setLoading(false); return; }
      try {
        const data = await getPublicShare(uid);
        if (data) {
          setIsEnabled(data.isEnabled);
          const ts = data.updatedAt as unknown as { toDate?: () => Date };
          setLastUpdated(ts && typeof ts.toDate === 'function' ? ts.toDate() : (data.updatedAt as Date));
        }
      } catch { showToast('Không tải được trạng thái chia sẻ', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, [uid, showToast]);
  const refreshSnapshot = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const shareMovies = buildShareMovies(movies);
      await upsertPublicShare(user.uid, { displayName: user.displayName || 'CineMOB User', photoURL: user.photoURL || '', isEnabled: true, totalCount: shareMovies.length, movies: shareMovies });
      setIsEnabled(true); setLastUpdated(new Date()); showToast('Đã cập nhật link chia sẻ', 'success');
    } catch { showToast('Cập nhật link thất bại', 'error'); }
    finally { setSyncing(false); }
  }, [movies, showToast, user]);
  const toggleShare = useCallback(async () => {
    if (!user) return;
    if (!isEnabled) { await refreshSnapshot(); return; }
    try { await setShareEnabled(user.uid, false); setIsEnabled(false); showToast('Đã tắt chia sẻ công khai', 'info'); }
    catch { showToast('Đổi trạng thái chia sẻ thất bại', 'error'); }
  }, [isEnabled, refreshSnapshot, showToast, user]);
  const copyLink = useCallback(async () => {
    try { await navigator.clipboard.writeText(shareUrl); showToast('Đã copy link chia sẻ', 'success'); }
    catch {
      const ta = document.createElement('textarea'); ta.value = shareUrl; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Đã copy link chia sẻ', 'success');
    }
  }, [shareUrl, showToast]);
  return { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, refreshSnapshot, copyLink };
};

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import { buildShareMovies, getPublicShare, setShareEnabled, upsertPublicShare } from '../services/shareService';
export const useShare = (isOpen = true) => {
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
    if (!isOpen) {
      setLoading(false);
      return;
    }

    setIsEnabled(false);
    setLastUpdated(null);
    setLoading(true);
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
  }, [isOpen, uid, showToast]);
  const refreshSnapshot = useCallback(async () => {
    if (!user) return;
    if (syncing) return;
    setSyncing(true);
    try {
      const shareMovies = buildShareMovies(movies);
      await upsertPublicShare(user.uid, { displayName: user.displayName || 'CineMOB User', photoURL: user.photoURL || '', isEnabled: true, totalCount: shareMovies.length, movies: shareMovies });
      setIsEnabled(true); setLastUpdated(new Date()); showToast('Đã bật chia sẻ công khai', 'success');
    } catch { showToast('Không thể bật chia sẻ công khai', 'error'); }
    finally { setSyncing(false); }
  }, [movies, showToast, user, syncing]);
  const toggleShare = useCallback(async () => {
    if (!user) return;
    if (syncing) return;
    if (!isEnabled) { await refreshSnapshot(); return; }
    setSyncing(true);
    try { await setShareEnabled(user.uid, false); setIsEnabled(false); setLastUpdated(null); showToast('Đã tắt chia sẻ công khai', 'info'); }
    catch { showToast('Đổi trạng thái chia sẻ thất bại', 'error'); }
    finally { setSyncing(false); }
  }, [isEnabled, refreshSnapshot, showToast, user, syncing]);
  const copyLink = useCallback(async () => {
    if (!shareUrl) { showToast('Chưa có link chia sẻ', 'error'); return; }
    try { await navigator.clipboard.writeText(shareUrl); showToast('Đã copy link chia sẻ', 'success'); }
    catch {
      const ta = document.createElement('textarea'); ta.value = shareUrl; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Đã copy link chia sẻ', 'success');
    }
  }, [shareUrl, showToast]);
  return { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, copyLink };
};

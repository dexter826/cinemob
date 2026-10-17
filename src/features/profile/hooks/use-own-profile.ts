import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/components/auth-provider';
import useMovieStore from '@/features/movies/stores/movie-store';
import useToastStore from '@/shared/stores/toast-store';
import { clearPublicProfileCache } from '@/features/profile/hooks/use-user-search';
import {
  getMemberProfile,
  saveProfileDetails,
  setMovieListHidden,
  validateBio,
  validateDob,
  validateGender,
} from '../services/member-profile-service';
import type { MemberGender, MemberProfile } from '@/types';

export interface OwnProfileDetails {
  bio: string;
  gender: MemberGender | '';
  dob: string;
}

/** Nạp và lưu phần hồ sơ chính chủ chỉnh sửa trên trang cá nhân. */
export const useOwnProfile = () => {
  const { user } = useAuth();
  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
    activeUid: moviesUid,
  } = useMovieStore();
  const { showToast } = useToastStore();
  const uid = user?.uid || '';
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedUid, setLoadedUid] = useState('');
  const [retryNonce, setRetryNonce] = useState(0);
  const activeUid = useRef(uid);
  activeUid.current = uid;
  const ready = !!uid && loadedUid === uid && !loading && !error;
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const refresh = useCallback(async () => {
    if (!uid) return;
    const next = await getMemberProfile(uid);
    if (activeUid.current === uid) setProfile(next);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setLoadedUid('');
    setProfile(null);
    getMemberProfile(uid)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setLoadedUid(uid);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được hồ sơ. Thử lại.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid, retryNonce]);

  const saveDetails = useCallback(
    async (details: OwnProfileDetails): Promise<boolean> => {
      if (!ready || activeUid.current !== uid || saving) return false;
      setSaving(true);
      try {
        await saveProfileDetails(uid, {
          bio: validateBio(details.bio) || undefined,
          gender: validateGender(details.gender) || undefined,
          dob: validateDob(details.dob) || undefined,
        });
        clearPublicProfileCache();
        await refresh();
        showToast('Đã cập nhật hồ sơ', 'success');
        return true;
      } catch {
        showToast('Lưu hồ sơ thất bại', 'error');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [ready, refresh, saving, showToast, uid],
  );

  const canToggle = ready && !moviesLoading && !moviesError && moviesUid === uid;
  const toggleMovieListHidden = useCallback(async (): Promise<boolean> => {
    if (!canToggle || activeUid.current !== uid || toggling) return false;
    const next = !(profile?.isMovieListHidden ?? false);
    setToggling(true);
    try {
      await setMovieListHidden(uid, next, movies);
      clearPublicProfileCache();
      await refresh();
      showToast(next ? 'Đã ẩn danh sách phim' : 'Danh sách phim đã hiện lại', 'success');
      return true;
    } catch {
      showToast('Đổi trạng thái danh sách phim thất bại', 'error');
      return false;
    } finally {
      setToggling(false);
    }
  }, [canToggle, movies, profile?.isMovieListHidden, refresh, showToast, toggling, uid]);

  return {
    profile: loadedUid === uid ? profile : null,
    loading: !!uid && (loading || (loadedUid !== uid && !error)),
    error,
    ready,
    retry: () => setRetryNonce((n) => n + 1),
    saving,
    toggling,
    canToggle,
    saveDetails,
    toggleMovieListHidden,
  };
};

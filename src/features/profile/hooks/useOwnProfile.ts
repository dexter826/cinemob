import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import useMovieStore from '@/features/movies/stores/movieStore';
import useToastStore from '@/shared/stores/toastStore';
import { clearPublicProfileCache } from '@/features/profile/hooks/useUserSearch';
import {
  getMemberProfile,
  saveProfileDetails,
  setMovieListHidden,
  validateBio,
  validateDob,
  validateGender,
} from '../services/memberProfileService';
import type { MemberGender, MemberProfile } from '@/types';

export interface OwnProfileDetails {
  bio: string;
  gender: MemberGender | '';
  dob: string;
}

/** Nạp và lưu phần hồ sơ chính chủ chỉnh sửa trên trang cá nhân. */
export const useOwnProfile = () => {
  const { user } = useAuth();
  const { movies } = useMovieStore();
  const { showToast } = useToastStore();
  const uid = user?.uid || '';
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const refresh = useCallback(async () => {
    if (!uid) return;
    const next = await getMemberProfile(uid);
    setProfile(next);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMemberProfile(uid)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const saveDetails = useCallback(
    async (details: OwnProfileDetails): Promise<boolean> => {
      if (!uid || saving) return false;
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
    [refresh, saving, showToast, uid],
  );

  const toggleMovieListHidden = useCallback(async (): Promise<boolean> => {
    if (!uid || toggling) return false;
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
  }, [movies, profile?.isMovieListHidden, refresh, showToast, toggling, uid]);

  return { profile, loading, saving, toggling, saveDetails, toggleMovieListHidden };
};

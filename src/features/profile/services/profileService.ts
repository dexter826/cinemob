import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEMBER_PROFILE_COLLECTION } from './memberProfileService';

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;
export const FALLBACK_DISPLAY_NAME = 'CineMOB User';

export type ValidateResult = { ok: true; value: string } | { ok: false; error: string };

export function validateDisplayName(raw: string): ValidateResult {
  const value = raw.trim();
  if (value.length < DISPLAY_NAME_MIN) {
    return { ok: false, error: 'Tên hiển thị tối thiểu 2 ký tự' };
  }
  if (value.length > DISPLAY_NAME_MAX) {
    return { ok: false, error: 'Tên hiển thị tối đa 50 ký tự' };
  }
  return { ok: true, value };
}

// Cập nhật displayName Auth + đồng bộ hồ sơ thành viên nếu doc đã có.
export const updateDisplayName = async (user: User, rawName: string): Promise<string> => {
  const checked = validateDisplayName(rawName);
  if (!checked.ok) {
    throw new Error(checked.error);
  }
  const displayName = checked.value;
  try {
    await updateProfile(user, { displayName });
  } catch (error) {
    console.error('Không thể cập nhật tên hiển thị:', error);
    throw new Error('Không thể cập nhật tên hiển thị, vui lòng thử lại');
  }
  try {
    const profileRef = doc(db, MEMBER_PROFILE_COLLECTION, user.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      await updateDoc(profileRef, { displayName });
    }
  } catch (error) {
    console.error('Không thể cập nhật tên trong hồ sơ thành viên:', error);
  }
  return displayName;
};

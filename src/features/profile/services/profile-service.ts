import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;
export const FALLBACK_DISPLAY_NAME = 'Thành viên CineMOB';

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

// Chỉ cập nhật Firebase Auth; tên trong hồ sơ thành viên do saveProfileDetails ghi cùng lượt.
export const updateDisplayName = async (user: User, rawName: string): Promise<string> => {
  const checked = validateDisplayName(rawName);
  if (!checked.ok) {
    throw new Error(checked.error);
  }
  try {
    await updateProfile(user, { displayName: checked.value });
  } catch (error) {
    console.error('Không thể cập nhật tên hiển thị:', error);
    throw new Error('Không cập nhật được tên hiển thị. Thử lại.');
  }
  return checked.value;
};

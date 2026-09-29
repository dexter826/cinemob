import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEMBER_PROFILE_COLLECTION } from '@/features/profile/services/memberProfileService';
import { uploadToCloudinary } from './cloudinaryService';

// Đồng bộ ảnh đại diện sang hồ sơ thành viên. Lỗi ở đây không chặn việc đổi ảnh.
const syncProfilePhotoURL = async (uid: string, photoURL: string): Promise<void> => {
  try {
    const profileRef = doc(db, MEMBER_PROFILE_COLLECTION, uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      await updateDoc(profileRef, { photoURL });
    }
  } catch (error) {
    console.error('Không thể cập nhật avatar trong hồ sơ thành viên:', error);
  }
};

// Tải ảnh lên Cloudinary và đồng bộ thông tin người dùng.
export const updateUserAvatar = async (user: User, fileOrBlob: File | Blob): Promise<string> => {
  const secureUrl = await uploadToCloudinary(fileOrBlob, 'avatars');

  await updateProfile(user, { photoURL: secureUrl });
  await syncProfilePhotoURL(user.uid, secureUrl);

  return secureUrl;
};

// Lấy ảnh đại diện gốc từ nhà cung cấp Google.
export const getOriginalGoogleAvatar = (user: User): string | null => {
  const googleProvider = user.providerData.find((p) => p.providerId === 'google.com');
  return googleProvider?.photoURL || user.providerData[0]?.photoURL || null;
};

// Khôi phục ảnh đại diện về ảnh gốc tài khoản Google.
export const revertToGoogleAvatar = async (user: User): Promise<string | null> => {
  const originalPhotoURL = getOriginalGoogleAvatar(user);

  await updateProfile(user, { photoURL: originalPhotoURL });
  await syncProfilePhotoURL(user.uid, originalPhotoURL || '');

  return originalPhotoURL;
};

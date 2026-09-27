import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from './cloudinaryService';

// Đồng bộ ảnh đại diện sang bản chia sẻ công khai. Lỗi ở đây không chặn việc đổi ảnh.
const syncPublicSharePhotoURL = async (uid: string, photoURL: string): Promise<void> => {
  try {
    const shareRef = doc(db, 'public_shares', uid);
    const shareSnap = await getDoc(shareRef);
    if (shareSnap.exists()) {
      await updateDoc(shareRef, { photoURL });
    }
  } catch (error) {
    console.error('Không thể cập nhật avatar trong public share:', error);
  }
};

// Tải ảnh lên Cloudinary và đồng bộ thông tin người dùng.
export const updateUserAvatar = async (user: User, fileOrBlob: File | Blob): Promise<string> => {
  const secureUrl = await uploadToCloudinary(fileOrBlob, 'avatars');

  await updateProfile(user, { photoURL: secureUrl });
  await syncPublicSharePhotoURL(user.uid, secureUrl);

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
  await syncPublicSharePhotoURL(user.uid, originalPhotoURL || '');

  return originalPhotoURL;
};

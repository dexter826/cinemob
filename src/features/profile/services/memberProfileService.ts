import { deleteField, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MemberGender, MemberProfile, Movie, ProfileMovie } from '@/types';

// Collection Firestore của hồ sơ thành viên.
export const MEMBER_PROFILE_COLLECTION = 'member_profiles';

export const BIO_MAX_LENGTH = 300;
export const GENDER_OPTIONS = ['male', 'female', 'other'] as const;

export const validateBio = (raw: string): string => raw.trim().slice(0, BIO_MAX_LENGTH);

export const validateGender = (raw: string): MemberGender | undefined =>
  (GENDER_OPTIONS as readonly string[]).includes(raw) ? (raw as MemberGender) : undefined;

export const validateDob = (raw: string): string | undefined => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  if (new Date(`${raw}T23:59:59`) > new Date()) return undefined;
  return raw;
};

// Cache hồ sơ theo uid 5 phút để mở lại trang cá nhân hiện ngay.
const PROFILE_CACHE_TTL = 5 * 60 * 1000;
const profileDocCache = new Map<string, { data: MemberProfile | null; at: number }>();

// Ghi xong phải gọi để lần đọc sau luôn lấy dữ liệu mới.
export const clearMemberProfileCache = (uid?: string): void => {
  if (uid) profileDocCache.delete(uid);
  else profileDocCache.clear();
};

const readMemberProfile = async (uid: string): Promise<MemberProfile | null> => {
  const ref = doc(db, MEMBER_PROFILE_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const raw: unknown = snap.data();
  if (typeof raw !== 'object' || raw === null) return null;
  const data = raw as Partial<MemberProfile>;
  const movies = Array.isArray(data.movies)
    ? data.movies.filter(
        (m): m is ProfileMovie =>
          typeof m === 'object' &&
          m !== null &&
          (typeof (m as ProfileMovie).id === 'string' ||
            typeof (m as ProfileMovie).id === 'number') &&
          typeof (m as ProfileMovie).title === 'string',
      )
    : [];
  return {
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
    email: typeof data.email === 'string' ? data.email : undefined,
    bio: typeof data.bio === 'string' && data.bio.length > 0 ? data.bio : undefined,
    gender: validateGender(data.gender ?? ''),
    dob: validateDob(data.dob ?? ''),
    isMovieListHidden: data.isMovieListHidden === true,
    updatedAt: (data.updatedAt as MemberProfile['updatedAt']) ?? new Date(),
    totalCount: typeof data.totalCount === 'number' ? data.totalCount : movies.length,
    movies,
  };
};

// Ưu tiên cache còn hạn, hết hạn mới đọc lại Firestore.
export const getMemberProfile = async (uid: string): Promise<MemberProfile | null> => {
  const cached = profileDocCache.get(uid);
  if (cached && Date.now() - cached.at < PROFILE_CACHE_TTL) return cached.data;
  const data = await readMemberProfile(uid);
  profileDocCache.set(uid, { data, at: Date.now() });
  return data;
};

// Sync định danh (tên/avatar/email từ Auth) và danh sách phim; giữ nguyên bio/gender/dob
// đang có trên doc vì các trường đó chỉ do chính chủ sửa qua trang cá nhân.
export const syncMemberProfile = async (
  uid: string,
  identity: { displayName: string; photoURL: string; email: string },
  movies: Movie[],
): Promise<boolean> => {
  const current = await readMemberProfile(uid);

  const profileMovies = buildProfileMovies(movies);
  const moviesChanged =
    current?.totalCount !== profileMovies.length ||
    !sameProfileMovies(current?.movies, profileMovies);
  const identityChanged =
    current?.displayName !== identity.displayName ||
    (current?.photoURL || '') !== identity.photoURL ||
    (current?.email || '') !== identity.email;
  if (!moviesChanged && !identityChanged && current) return false;

  const payload: Record<string, unknown> = {
    displayName: identity.displayName,
    photoURL: identity.photoURL,
    email: identity.email,
    isMovieListHidden: current?.isMovieListHidden ?? false,
    totalCount: profileMovies.length,
    updatedAt: serverTimestamp(),
  };
  if (current?.bio) payload.bio = current.bio;
  if (current?.gender) payload.gender = current.gender;
  if (current?.dob) payload.dob = current.dob;
  if (current?.isMovieListHidden) payload.movies = deleteField();
  else payload.movies = profileMovies;

  await setDoc(doc(db, MEMBER_PROFILE_COLLECTION, uid), payload, { merge: true });
  clearMemberProfileCache(uid);
  return true;
};

// Ẩn tận dữ liệu: bật ẩn là gỡ mảng movies khỏi doc; tắt ẩn dựng lại từ collection movies.
export const setMovieListHidden = async (
  uid: string,
  hidden: boolean,
  movies: Movie[],
): Promise<void> => {
  const payload: Record<string, unknown> = {
    isMovieListHidden: hidden,
    updatedAt: serverTimestamp(),
  };
  if (hidden) payload.movies = deleteField();
  else {
    const profileMovies = buildProfileMovies(movies);
    payload.movies = profileMovies;
    payload.totalCount = profileMovies.length;
  }
  await setDoc(doc(db, MEMBER_PROFILE_COLLECTION, uid), payload, { merge: true });
  clearMemberProfileCache(uid);
};

// Lưu bio/gender/dob từ trang cá nhân; bỏ trống là gỡ field, không lưu chuỗi rỗng.
export const saveProfileDetails = async (
  uid: string,
  details: { bio?: string; gender?: MemberGender; dob?: string },
): Promise<void> => {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  payload.bio = details.bio ? details.bio : deleteField();
  payload.gender = details.gender ? details.gender : deleteField();
  payload.dob = details.dob ? details.dob : deleteField();
  await setDoc(doc(db, MEMBER_PROFILE_COLLECTION, uid), payload, { merge: true });
  clearMemberProfileCache(uid);
};

export const buildProfileMovies = (movies: Movie[]): ProfileMovie[] => {
  return movies
    .filter((m) => (m.status || 'history') === 'history')
    .slice(0, 500)
    .map((m) => ({
      id: m.id,
      title: m.title,
      title_vi: m.title_vi ?? '',
      poster_path: m.poster_path ?? '',
      media_type: m.media_type ?? ('movie' as const),
      release_date: m.release_date ?? '',
      rating: m.rating ?? 0,
    }));
};

// Hai danh sách phim hồ sơ giống nhau từng trường; tránh stringify mỗi lần sync.
const sameProfileMovies = (a: ProfileMovie[] | undefined, b: ProfileMovie[]): boolean =>
  !!a &&
  a.length === b.length &&
  a.every(
    (m, i) =>
      m.id === b[i].id &&
      m.title === b[i].title &&
      m.title_vi === b[i].title_vi &&
      m.poster_path === b[i].poster_path &&
      m.media_type === b[i].media_type &&
      m.release_date === b[i].release_date &&
      m.rating === b[i].rating,
  );

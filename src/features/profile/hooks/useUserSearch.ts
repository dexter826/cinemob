import { useCallback, useMemo, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MEMBER_PROFILE_COLLECTION } from '@/features/profile/services/memberProfileService';
import type { MemberProfile } from '@/types';

export interface PublicProfileSummary {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  totalCount: number;
}

const CACHE_TTL = 5 * 60 * 1000;

let profileCache: { profiles: PublicProfileSummary[]; fetchedAt: number } | null = null;

// Fetch một lần mỗi phiên, cache 5 phút.
const fetchPublicProfiles = async (): Promise<PublicProfileSummary[]> => {
  if (profileCache && Date.now() - profileCache.fetchedAt < CACHE_TTL) {
    return profileCache.profiles;
  }
  const snap = await getDocs(collection(db, MEMBER_PROFILE_COLLECTION));
  const profiles = snap.docs
    .map((d) => {
      const data = d.data() as Partial<MemberProfile>;
      return {
        uid: d.id,
        displayName: typeof data.displayName === 'string' ? data.displayName : '',
        photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
        email: typeof data.email === 'string' ? data.email : undefined,
        totalCount: typeof data.totalCount === 'number' ? data.totalCount : 0,
      };
    })
    .filter((p) => p.displayName.length > 0);
  profileCache = { profiles, fetchedAt: Date.now() };
  return profiles;
};

// Gọi sau khi đổi hồ sơ hoặc bật/tắt ẩn danh sách phim.
export const clearPublicProfileCache = (): void => {
  profileCache = null;
};

/** Tìm hồ sơ thành viên theo email */
export const useUserSearch = (excludeUid?: string) => {
  const [searchText, setSearchText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [profiles, setProfiles] = useState<PublicProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchRef = useRef<Promise<PublicProfileSummary[]> | null>(null);

  const ensureProfiles = useCallback(async () => {
    if (!fetchRef.current) {
      setLoading(true);
      setError(false);
      fetchRef.current = fetchPublicProfiles()
        .then((data) => {
          setProfiles(data);
          return data;
        })
        .catch((err) => {
          fetchRef.current = null;
          setError(true);
          throw err;
        })
        .finally(() => {
          setLoading(false);
        });
    }
    return fetchRef.current;
  }, []);

  const submit = async () => {
    const query = searchText.trim().toLowerCase();
    try {
      await ensureProfiles();
      setSubmittedQuery(query);
    } catch {
    }
  };

  const results = useMemo(() => {
    if (!submittedQuery) return [];
    return profiles
      .filter((p) => p.uid !== excludeUid && (p.email || '').toLowerCase() === submittedQuery)
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [profiles, submittedQuery, excludeUid]);

  return {
    searchText,
    setSearchText,
    submit,
    results,
    loading,
    error,
    submittedQuery,
  };
};

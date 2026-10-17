import { useCallback, useMemo, useRef, useState } from 'react';
import {
  fetchPublicProfiles,
  type PublicProfileSummary,
} from '@/features/profile/services/member-profile-service';

export type { PublicProfileSummary } from '@/features/profile/services/member-profile-service';
export { clearPublicProfileCache } from '@/features/profile/services/member-profile-service';

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
    } catch (error) {
      // Lookup lỗi (mạng/quyền) → kết quả trống thay vì dừng app; log để truy vết.
      console.warn('[member-search] ensureProfiles thất bại:', error);
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

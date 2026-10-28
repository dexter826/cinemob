import { useCallback, useState } from 'react';
import {
  lookupMemberByEmail,
  type PublicProfileSummary,
} from '@/features/profile/services/member-profile-service';

export type { PublicProfileSummary } from '@/features/profile/services/member-profile-service';

export const useUserSearch = (excludeUid?: string) => {
  const [searchText, setSearchText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<PublicProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const submit = useCallback(async () => {
    const query = searchText.trim().toLowerCase();
    setSubmittedQuery(query);
    setError(false);
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const profile = await lookupMemberByEmail(query);
      setResults(profile && profile.uid !== excludeUid ? [profile] : []);
    } catch (err) {
      // Lookup lỗi (mạng/quyền) → kết quả trống thay vì dừng app; log để truy vết.
      console.warn('[member-search] lookup thất bại:', err);
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, excludeUid]);

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

import { useRef } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Dialog, DialogBody, DialogHeader } from '@/shared/components/ui/dialog';
import SearchField from '@/shared/components/ui/search-field';
import { ErrorState } from '@/shared/components/ui/error-state';
import Skeleton from '@/shared/components/ui/skeleton';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import { useUserSearch } from '../../hooks/use-user-search';
import UserCard from './user-card';

interface MemberSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

function MemberSearchModal({ isOpen, onClose, onExited }: MemberSearchModalProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const { searchText, setSearchText, submit, results, loading, error, submittedQuery } =
    useUserSearch(user?.uid);
  const settled = submittedQuery.length > 0 && searchText.trim().toLowerCase() === submittedQuery;
  const showSkeleton = useDelayedSkeleton(loading && results.length === 0);

  // Điều hướng sang hồ sơ do Link trong UserCard đảm nhiệm.
  const openProfile = () => {
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="member-search-title"
      presentation="dialog"
      size="md"
      className="h-[min(24rem,calc(100dvh-8rem))] sm:h-72"
      initialFocusRef={isMobile ? undefined : inputRef}
      onExitComplete={onExited}
    >
      <DialogHeader titleId="member-search-title" title="Tìm thành viên" onClose={onClose} />
      <DialogBody className="flex flex-col gap-4">
        <form
          className="shrink-0"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <SearchField
            ref={inputRef}
            variant="boxed"
            id="member-search-input"
            type="email"
            value={searchText}
            onChange={setSearchText}
            placeholder="Tìm theo email…"
            label="Tìm thành viên theo email"
          />
        </form>

        {loading && results.length === 0 ? (
          showSkeleton ? (
            <div aria-busy="true" className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-dialog border border-border"
                >
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : null
        ) : error ? (
          <ErrorState
            compact
            blocking
            className="flex-1"
            title="Không tải được danh sách"
            description="Không tải được danh sách thành viên. Thử lại."
            retry={{ label: 'Thử lại', onClick: () => void submit() }}
          />
        ) : !settled ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <Users size={22} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
            <p className="text-body text-text-secondary">Kết quả sẽ hiển thị ở đây.</p>
          </div>
        ) : results.length === 0 ? (
          <p aria-live="polite" className="py-8 text-center text-body text-text-secondary">
            Không có thành viên nào với email “{searchText.trim()}”.
          </p>
        ) : (
          <div
            aria-live="polite"
            aria-busy={loading}
            aria-label="Kết quả tìm kiếm thành viên"
            className="space-y-3"
          >
            {results.map((profile) => (
              <UserCard key={profile.uid} profile={profile} onClick={openProfile} />
            ))}
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}

export default MemberSearchModal;

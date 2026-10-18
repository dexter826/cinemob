import { useRef } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Dialog, DialogBody, DialogHeader } from '@/shared/components/ui/dialog';
import SearchField from '@/shared/components/ui/search-field';
import EmptyState from '@/shared/components/ui/empty-state';
import Loading from '@/shared/components/ui/loading';
import { useUserSearch } from '../../hooks/use-user-search';
import UserCard from './user-card';

interface MemberSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Modal tìm thành viên mở từ nút Users trên navbar. */
function MemberSearchModal({ isOpen, onClose }: MemberSearchModalProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchText, setSearchText, submit, results, loading, error, submittedQuery } =
    useUserSearch(user?.uid);
  const settled = submittedQuery.length > 0 && searchText.trim().toLowerCase() === submittedQuery;

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
      className="h-72"
      initialFocusRef={inputRef}
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

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loading fullScreen={false} />
          </div>
        ) : error ? (
          <EmptyState
            compact
            className="flex-1"
            title="Không tải được danh sách"
            description="Không tải được danh sách thành viên. Thử lại."
          />
        ) : !settled ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <Users size={22} className="text-text-secondary" aria-hidden="true" />
            <p className="text-sm text-text-secondary">Kết quả sẽ hiển thị ở đây.</p>
          </div>
        ) : results.length === 0 ? (
          <p aria-live="polite" className="py-8 text-center text-sm text-text-secondary">
            Không có thành viên nào với email “{searchText.trim()}”.
          </p>
        ) : (
          <div aria-live="polite" aria-label="Kết quả tìm kiếm thành viên" className="space-y-3">
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

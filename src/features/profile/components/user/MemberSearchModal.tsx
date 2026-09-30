import { useRef } from 'react';
import { Search, Users, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Dialog, DialogBody, DialogHeader } from '@/shared/components/ui/Dialog';
import EmptyState from '@/shared/components/ui/EmptyState';
import Loading from '@/shared/components/ui/Loading';
import { useUserSearch } from '../../hooks/useUserSearch';
import UserCard from './UserCard';

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
          className="relative shrink-0"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <label htmlFor="member-search-input" className="sr-only">
            Tìm thành viên theo email
          </label>
          <input
            id="member-search-input"
            ref={inputRef}
            type="email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo email…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-surface border border-border rounded-2xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition-colors"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={15} />
            </button>
          )}
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
            description="Đã có lỗi khi tải danh sách thành viên. Vui lòng thử lại sau."
          />
        ) : !settled ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <Users size={22} className="text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">Kết quả sẽ hiển thị ở đây.</p>
          </div>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">
            Không có thành viên nào với email &quot;{searchText.trim()}&quot;.
          </p>
        ) : (
          <div className="space-y-3">
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

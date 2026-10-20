import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { PublicProfileSummary } from '../../hooks/use-user-search';

interface UserCardProps {
  profile: PublicProfileSummary;
  /** Việc phụ khi bấm thẻ (đóng modal); điều hướng do Link đảm nhiệm. */
  onClick?: () => void;
}

function UserCard({ profile, onClick }: UserCardProps) {
  return (
    <Link
      to={`/profile/${profile.uid}`}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 bg-surface border border-border rounded-card text-left hover:border-primary/50 transition-colors cursor-pointer group"
    >
      {profile.photoURL ? (
        <img
          src={profile.photoURL}
          alt={profile.displayName}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover border border-border-default shrink-0"
        />
      ) : (
        <span className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-title-md font-bold text-primary shrink-0">
          {profile.displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-body font-bold text-text-primary group-hover:text-primary transition-colors truncate">
          {profile.displayName}
        </span>
        {profile.email && profile.email !== profile.displayName && (
          <span className="block text-body-sm text-text-secondary truncate">{profile.email}</span>
        )}
        <span className="block text-body-sm text-text-secondary mt-0.5">
          {profile.totalCount} phim đã xem
        </span>
      </span>
      <ChevronRight
        size={18}
        strokeWidth={1.5}
        className="text-text-secondary group-hover:text-primary transition-colors shrink-0"
        aria-hidden="true"
      />
    </Link>
  );
}

export default UserCard;

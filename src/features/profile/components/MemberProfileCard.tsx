import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import ProfileMeta from './ProfileMeta';
import type { MemberProfile } from '@/types';

interface MemberProfileCardProps {
  profile: MemberProfile;
}

// Thẻ định danh của thành viên khác trên trang cá nhân (chỉ xem).
function MemberProfileCard({ profile }: MemberProfileCardProps) {
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [profile.photoURL]);

  return (
    <div className="bg-surface border border-border rounded-dialog p-5 sm:p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-primary/20 shrink-0">
        {profile.photoURL && !isAvatarLoadFailed ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            onError={() => setIsAvatarLoadFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold">
            {profile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <h1 className="mt-2 text-xl sm:text-2xl font-bold text-text-primary tracking-tight font-display">
        {profile.displayName}
      </h1>
      {profile.email && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary max-w-full">
          <Mail size={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.email}</span>
        </p>
      )}

      <ProfileMeta gender={profile.gender} dob={profile.dob} className="mt-1 items-center" />

      {profile.bio ? (
        <p className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line break-words max-w-prose">
          {profile.bio}
        </p>
      ) : (
        <p className="mt-3 text-sm text-text-secondary italic">Chưa có giới thiệu.</p>
      )}
    </div>
  );
}

export default MemberProfileCard;

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import ProfileMeta from './profile-meta';
import type { MemberProfile } from '@/types';

interface MemberProfileCardProps {
  profile: MemberProfile;
}

function MemberProfileCard({ profile }: MemberProfileCardProps) {
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [profile.photoURL]);

  return (
    <div className="bg-surface border border-border rounded-dialog p-5 sm:p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-border shrink-0">
        {profile.photoURL && !isAvatarLoadFailed ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            width={80}
            height={80}
            onError={() => setIsAvatarLoadFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-display-lg">
            {profile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <h2 className="mt-2 text-display-md text-text-primary tracking-tight">
        {profile.displayName}
      </h2>
      {profile.email && (
        <p className="mt-1 inline-flex items-center gap-1.5 text-body-sm text-text-secondary max-w-full">
          <Mail size={12} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.email}</span>
        </p>
      )}

      <ProfileMeta gender={profile.gender} dob={profile.dob} className="mt-1 items-center" />

      {profile.bio ? (
        <p className="mt-3 text-body text-text-secondary leading-relaxed whitespace-pre-line break-words max-w-prose">
          {profile.bio}
        </p>
      ) : (
        <p className="mt-3 text-body text-text-secondary italic">Chưa có giới thiệu.</p>
      )}
    </div>
  );
}

export default MemberProfileCard;

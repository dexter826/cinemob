import { Cake, User } from 'lucide-react';
import { classNames } from '@/shared/utils/class-names';
import { GENDER_LABELS, formatDob } from '../utils/profile-format';
import type { MemberGender } from '@/types';

interface ProfileMetaProps {
  gender?: MemberGender | '';
  dob?: string;
  className?: string;
}

function ProfileMeta({ gender, dob, className }: ProfileMetaProps) {
  if (!gender && !dob) return null;
  return (
    <div className={classNames('flex flex-col items-start gap-1', className)}>
      {gender && (
        <p className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
          <User size={12} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
          {GENDER_LABELS[gender]}
        </p>
      )}
      {dob && (
        <p className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
          <Cake size={12} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
          {formatDob(dob)}
        </p>
      )}
    </div>
  );
}

export default ProfileMeta;

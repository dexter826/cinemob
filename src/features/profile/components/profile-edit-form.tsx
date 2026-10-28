import { useId } from 'react';
import type { RefObject } from 'react';
import { Button } from '@/shared/components/ui/button';
import DatePicker from '@/shared/components/ui/date-picker';
import Dropdown from '@/shared/components/ui/dropdown';
import { BIO_MAX_LENGTH, GENDER_OPTIONS } from '../services/member-profile-service';
import { GENDER_LABELS } from '../utils/profile-format';

const GENDER_DROPDOWN_OPTIONS = [
  ...GENDER_OPTIONS.map((value) => ({ value, label: GENDER_LABELS[value] })),
  { value: '', label: 'Không cập nhật' },
];

interface ProfileEditFormProps {
  name: string;
  bio: string;
  gender: string;
  dob: string;
  nameError: string | null;
  nameInputRef: RefObject<HTMLInputElement | null>;
  ready: boolean;
  isBusy: boolean;
  saving: boolean;
  onChangeName: (value: string) => void;
  onChangeBio: (value: string) => void;
  onChangeGender: (value: string) => void;
  onChangeDob: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

function ProfileEditForm({
  name,
  bio,
  gender,
  dob,
  nameError,
  nameInputRef,
  ready,
  isBusy,
  saving,
  onChangeName,
  onChangeBio,
  onChangeGender,
  onChangeDob,
  onSubmit,
  onCancel,
}: ProfileEditFormProps) {
  const nameErrorId = useId();

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block">
        <span className="block text-label-caps text-text-secondary mb-1">Tên hiển thị</span>
        <input
          ref={nameInputRef}
          name="display-name"
          autoComplete="nickname"
          value={name}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Nhập tên hiển thị…"
          maxLength={50}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? nameErrorId : undefined}
          className="w-full px-3 h-10 rounded-control border border-border bg-surface-elevated text-body text-text-primary focus-visible:border-primary focus-ring"
        />
        {nameError && (
          <p id={nameErrorId} role="alert" className="mt-1.5 text-body-sm text-danger">
            {nameError}
          </p>
        )}
      </label>

      <label className="block">
        <span className="block text-label-caps text-text-secondary mb-1">Giới thiệu</span>
        <textarea
          name="bio"
          value={bio}
          onChange={(event) => onChangeBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
          rows={3}
          maxLength={BIO_MAX_LENGTH}
          placeholder="Thêm vài dòng giới thiệu về bạn…"
          className="w-full px-3 py-2 rounded-control border border-border bg-surface-elevated text-body text-text-primary focus-visible:border-primary focus-ring resize-none"
        />
        <span className="block text-right text-body-sm text-text-secondary">
          {bio.length}/{BIO_MAX_LENGTH}
        </span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label>
          <span className="block text-label-caps text-text-secondary mb-1">Giới tính</span>
          <Dropdown
            options={GENDER_DROPDOWN_OPTIONS}
            value={gender}
            onChange={(value) => onChangeGender(String(value))}
            placeholder="Chọn giới tính…"
          />
        </label>
        <label>
          <span className="block text-label-caps text-text-secondary mb-1">Ngày sinh</span>
          <DatePicker value={dob} onChange={onChangeDob} className="min-w-0" />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" size="md" onClick={onCancel} disabled={isBusy}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isBusy || !ready}
          loading={saving}
        >
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}

export default ProfileEditForm;

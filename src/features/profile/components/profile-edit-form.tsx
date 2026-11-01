import type { RefObject } from 'react';
import { Button } from '@/shared/components/ui/button';
import { TextField, TextArea } from '@/shared/components/ui';
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
  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        ref={nameInputRef}
        id="profile-display-name"
        name="display-name"
        autoComplete="nickname"
        label="Tên hiển thị"
        value={name}
        onChange={(event) => onChangeName(event.target.value)}
        placeholder="Nhập tên hiển thị…"
        maxLength={50}
        error={nameError || undefined}
        variant="boxed"
        inputClassName="h-10 bg-surface-elevated"
      />

      <TextArea
        id="profile-bio"
        name="bio"
        label="Giới thiệu"
        value={bio}
        onChange={(event) => onChangeBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
        rows={3}
        maxLength={BIO_MAX_LENGTH}
        showCount
        placeholder="Thêm vài dòng giới thiệu về bạn…"
        variant="boxed"
        textareaClassName="bg-surface-elevated"
      />

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

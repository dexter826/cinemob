import { useState, type FormEvent } from 'react';
import Button from '@/shared/components/ui/button';
import PasswordField from './password-field';
import { PASSWORD_HINT, validatePassword } from '../utils/auth-validation';

interface AccountPasswordFormProps {
  hasPassword: boolean;
  busy: boolean;
  onSave: (
    password: string,
    currentPassword: string | undefined,
    onSuccess: () => void,
  ) => Promise<boolean>;
}

export default function AccountPasswordForm({
  hasPassword,
  busy,
  onSave,
}: AccountPasswordFormProps) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const clear = () => {
    setCurrent('');
    setPassword('');
    setConfirmation('');
    setErrors({});
    setEditing(false);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const nextErrors = {
      current: hasPassword && !current ? 'Nhập mật khẩu hiện tại để xác thực lại.' : undefined,
      password: validatePassword(password),
      confirmation: password === confirmation ? undefined : 'Mật khẩu nhập lại chưa khớp.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    await onSave(password, hasPassword ? current : undefined, clear);
  };
  if (!editing)
    return (
      <Button variant="secondary" className="mt-4" disabled={busy} onClick={() => setEditing(true)}>
        {hasPassword ? 'Đổi mật khẩu' : 'Thêm mật khẩu'}
      </Button>
    );
  return (
    <form onSubmit={submit} className="mt-4 max-w-md space-y-4" noValidate>
      <fieldset disabled={busy} className="space-y-4">
        {hasPassword && (
          <PasswordField
            id="account-current-password"
            label="Mật khẩu hiện tại"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            error={errors.current}
          />
        )}
        <PasswordField
          id="account-new-password"
          label="Mật khẩu mới"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          aria-describedby={
            errors.password ? 'account-new-password-error' : 'account-password-hint'
          }
        />
        <p id="account-password-hint" className="text-body-sm text-text-secondary">
          {PASSWORD_HINT}
        </p>
        <PasswordField
          id="account-confirm-password"
          label="Nhập lại mật khẩu mới"
          autoComplete="new-password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          error={errors.confirmation}
        />
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={busy}>
          Lưu mật khẩu
        </Button>
        <Button variant="secondary" disabled={busy} onClick={clear}>
          Hủy thay đổi
        </Button>
      </div>
    </form>
  );
}

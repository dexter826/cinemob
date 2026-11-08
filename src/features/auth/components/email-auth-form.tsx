import { useState, type FormEvent } from 'react';
import Button from '@/shared/components/ui/button';
import TextField from '@/shared/components/ui/text-field';
import PasswordField from './password-field';
import { useAuth } from './auth-provider';
import { validateDisplayName } from '@/features/profile/services/profile-service';
import { PASSWORD_HINT, validateEmail, validatePassword } from '../utils/auth-validation';
import { getAuthErrorMessage } from '../utils/auth-errors';
import { requestPasswordReset } from '../services/auth-service';

export default function EmailAuthForm({
  disabled,
  onBusyChange,
}: {
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const { signInWithEmail, register, pendingGoogleEmail, cancelGoogleLink } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const isRegister = mode === 'register';
  const isReset = mode === 'reset';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || disabled) return;
    const nextErrors: Record<string, string | undefined> = {
      email: validateEmail(email),
      password: isReset || password ? undefined : 'Nhập mật khẩu để đăng nhập.',
    };
    if (isRegister) {
      const checkedName = validateDisplayName(name);
      nextErrors.name = checkedName.ok ? undefined : checkedName.error;
      nextErrors.password = validatePassword(password);
      nextErrors.confirmation =
        password === confirmation ? undefined : 'Mật khẩu nhập lại chưa khớp.';
    }
    setErrors(nextErrors);
    setFormError('');
    setNotice('');
    if (Object.values(nextErrors).some(Boolean)) return;
    setBusy(true);
    onBusyChange(true);
    try {
      if (isReset) {
        await requestPasswordReset(email);
        setNotice(
          'Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu. Kiểm tra hộp thư và thư mục spam.',
        );
      } else if (isRegister) await register(name, email, password);
      else await signInWithEmail(email, password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  return (
    <div className="mt-8">
      {pendingGoogleEmail && (
        <div className="mb-4 space-y-2">
          <p role="status" className="text-body-sm text-text-secondary break-words">
            Để kết nối Google cho {pendingGoogleEmail}, đăng nhập bằng phương thức đã dùng trước
            đây. Không có tài khoản nào được tự động gộp.
          </p>
          <Button variant="link" disabled={busy || disabled} onClick={cancelGoogleLink}>
            Hủy liên kết Google
          </Button>
        </div>
      )}
      <div className="flex gap-4 mb-6" aria-label="Chọn cách đăng nhập">
        {(['login', 'register'] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? 'primary' : 'secondary'}
            disabled={busy || disabled || (!!pendingGoogleEmail && value === 'register')}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setErrors({});
              setFormError('');
              setNotice('');
              setPassword('');
              setConfirmation('');
            }}
          >
            {value === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
        ))}
      </div>
      <form className="space-y-4" onSubmit={submit} noValidate>
        <fieldset className="space-y-4" disabled={busy || disabled}>
          {isRegister && (
            <TextField
              id="auth-name"
              label="Tên hiển thị"
              autoComplete="nickname"
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
            />
          )}
          <TextField
            id="auth-email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            inputMode="email"
            placeholder="ban@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          {!isReset && (
            <PasswordField
              id="auth-password"
              name="password"
              label="Mật khẩu"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              aria-describedby={
                errors.password ? 'auth-password-error' : isRegister ? 'password-hint' : undefined
              }
            />
          )}
          {isRegister && (
            <>
              <p id="password-hint" className="text-body-sm text-text-secondary">
                {PASSWORD_HINT}
              </p>
              <PasswordField
                id="auth-confirmation"
                label="Nhập lại mật khẩu"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                error={errors.confirmation}
              />
            </>
          )}
        </fieldset>
        {formError && (
          <p role="alert" className="text-body-sm text-danger">
            {formError}
          </p>
        )}
        {notice && (
          <p role="status" className="text-body-sm text-text-secondary">
            {notice}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={disabled}>
          {isReset ? 'Gửi email đặt lại mật khẩu' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </Button>
      </form>
      {!isRegister && (
        <Button
          variant="link"
          className="mt-4"
          disabled={busy || disabled}
          onClick={() => {
            setMode(isReset ? 'login' : 'reset');
            setErrors({});
            setFormError('');
            setNotice('');
            setPassword('');
          }}
        >
          {isReset ? 'Quay lại đăng nhập' : 'Quên mật khẩu?'}
        </Button>
      )}
    </div>
  );
}

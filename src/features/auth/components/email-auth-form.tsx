import { useState, type FormEvent } from 'react';
import Button from '@/shared/components/ui/button';
import TextField from '@/shared/components/ui/text-field';
import PasswordField from './password-field';
import { useAuth } from './auth-provider';
import { validateDisplayName } from '@/features/profile/services/profile-service';
import { PASSWORD_HINT, validateEmail, validatePassword } from '../utils/auth-validation';
import { getAuthErrorMessage } from '../utils/auth-errors';

export default function EmailAuthForm({ disabled }: { disabled: boolean }) {
  const { signInWithEmail, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || disabled) return;
    const nextErrors: Record<string, string | undefined> = {
      email: validateEmail(email),
      password: password ? undefined : 'Nhập mật khẩu để đăng nhập.',
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
    if (Object.values(nextErrors).some(Boolean)) return;
    setBusy(true);
    try {
      if (isRegister) await register(name, email, password);
      else await signInWithEmail(email, password);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-6" aria-label="Chọn cách đăng nhập">
        {(['login', 'register'] as const).map((value) => (
          <Button
            key={value}
            variant={mode === value ? 'primary' : 'secondary'}
            disabled={busy || disabled}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setErrors({});
              setFormError('');
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
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={disabled}>
          {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </Button>
      </form>
    </div>
  );
}

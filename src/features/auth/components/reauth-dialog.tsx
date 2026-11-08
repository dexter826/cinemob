import { useState, type FormEvent } from 'react';
import Dialog, { DialogBody, DialogHeader } from '@/shared/components/ui/dialog';
import Button from '@/shared/components/ui/button';
import PasswordField from './password-field';

interface ReauthDialogProps {
  open: boolean;
  busy: boolean;
  error: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => Promise<void>;
}

export default function ReauthDialog(props: ReauthDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} titleId="reauth-title" size="sm">
      <DialogHeader titleId="reauth-title" title="Xác thực lại tài khoản" onClose={props.onClose} />
      <DialogBody>{props.open && <ReauthForm {...props} />}</DialogBody>
    </Dialog>
  );
}

function ReauthForm({
  busy,
  error,
  hasPassword,
  hasGoogle,
  onClose,
  onConfirm,
}: ReauthDialogProps) {
  const [password, setPassword] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password && !busy) void onConfirm(password);
  };
  return (
    <div className="space-y-4">
      <p className="text-body-sm text-text-secondary">
        Đăng nhập lại để tiếp tục thao tác bảo mật.
      </p>
      {hasPassword && (
        <form onSubmit={submit} className="space-y-4">
          <PasswordField
            id="reauth-password"
            label="Mật khẩu hiện tại"
            autoComplete="current-password"
            variant="boxed"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
            required
          />
          <Button type="submit" className="w-full" loading={busy} disabled={!password}>
            {busy ? 'Đang xác thực…' : 'Xác thực bằng mật khẩu'}
          </Button>
        </form>
      )}
      {hasGoogle && (
        <Button
          variant="secondary"
          className="w-full"
          loading={busy}
          onClick={() => void onConfirm()}
        >
          {busy ? 'Đang xác thực…' : 'Xác thực bằng Google'}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-body-sm text-danger">
          {error}
        </p>
      )}
      <Button variant="ghost" disabled={busy} onClick={onClose}>
        Hủy thao tác
      </Button>
    </div>
  );
}

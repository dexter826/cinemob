import { useRef, useState } from 'react';
import { useAuth } from '../components/auth-provider';
import {
  connectGoogle,
  reauthenticateAccount,
  requireAccount,
  saveAccountPassword,
  unlinkAccountMethod,
} from '../services/account-service';
import { getAuthErrorMessage } from '../utils/auth-errors';
import useToastStore from '@/shared/stores/toast-store';

interface AccountAction {
  run: () => Promise<void>;
  success: string;
  onSuccess?: () => void;
}

export function useAccountSecurity() {
  const { user, refreshUser } = useAuth();
  const uid = user?.uid ?? '';
  const showToast = useToastStore((state) => state.showToast);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<AccountAction | null>(null);
  const actionLock = useRef(false);

  const execute = async (action: AccountAction): Promise<boolean> => {
    if (actionLock.current) return false;
    actionLock.current = true;
    setBusy(true);
    setError('');
    try {
      requireAccount(uid);
      await action.run();
      await refreshUser();
      showToast(action.success, 'success');
      action.onSuccess?.();
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === 'auth/requires-recent-login') {
        setPendingAction(action);
      } else {
        setError(getAuthErrorMessage(error, 'Không cập nhật được phương thức đăng nhập. Thử lại.'));
      }
      return false;
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const reauthenticate = async (password?: string) => {
    if (!pendingAction || actionLock.current) return;
    const action = pendingAction;
    actionLock.current = true;
    setBusy(true);
    setError('');
    try {
      await reauthenticateAccount(uid, password);
    } catch (error) {
      setError(getAuthErrorMessage(error));
      return;
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
    setPendingAction(null);
    await execute(action);
  };

  return {
    busy,
    error,
    needsReauth: !!pendingAction,
    reauthenticate,
    cancelReauth: () => {
      if (!actionLock.current) {
        setPendingAction(null);
        setError('');
      }
    },
    connectGoogle: () => execute({ run: () => connectGoogle(uid), success: 'Đã kết nối Google' }),
    savePassword: (password: string, currentPassword: string | undefined, onSuccess: () => void) =>
      execute({
        run: () => saveAccountPassword(uid, password, currentPassword),
        success: 'Đã lưu mật khẩu',
        onSuccess,
      }),
    unlinkMethod: (providerId: string) => {
      if (actionLock.current || pendingAction) return;
      setError('');
      setPendingAction({
        run: () => unlinkAccountMethod(uid, providerId),
        success: providerId === 'google.com' ? 'Đã gỡ liên kết Google' : 'Đã gỡ mật khẩu',
      });
    },
  };
}

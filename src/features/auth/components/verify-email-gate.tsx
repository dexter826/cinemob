import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, MailCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import CineMobSymbol from '@/shared/components/ui/cinemob-symbol';
import { useAuth } from '@/features/auth/components/auth-provider';
import { getAuthErrorMessage } from '@/features/auth/utils/auth-errors';
import { MESSAGES } from '@/constants/messages';
import useToastStore from '@/shared/stores/toast-store';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailGate() {
  const { user, logout, refreshUser, resendVerificationEmail, registrationProfilePending } =
    useAuth();
  const { showToast } = useToastStore();
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const checkVerification = useCallback(
    async (silent: boolean) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      if (!silent) {
        setIsChecking(true);
        setNotice(null);
      }
      try {
        const verified = await refreshUser();
        if (!verified && !silent) setNotice(MESSAGES.AUTH.VERIFICATION_NOT_FOUND);
      } catch (error) {
        if (!silent) {
          setNotice(getAuthErrorMessage(error, MESSAGES.AUTH.VERIFICATION_CHECK_ERROR));
        }
      } finally {
        checkingRef.current = false;
        if (!silent) setIsChecking(false);
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    const handleFocus = () => {
      void checkVerification(true);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void checkVerification(true);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVerification]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setNotice(null);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      showToast(MESSAGES.AUTH.VERIFICATION_RESENT, 'success');
    } catch (error) {
      showToast(getAuthErrorMessage(error, MESSAGES.AUTH.VERIFICATION_RESEND_ERROR), 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col bg-background text-text-primary">
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <CineMobSymbol className="h-8 w-8 text-primary shrink-0" />
            <p className="text-display-lg">
              Cine<span className="text-primary">MOB</span>
            </p>
          </div>

          <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-card border border-border bg-surface-elevated text-primary"
            >
              <MailCheck size={24} strokeWidth={1.5} />
            </span>

            <h1 className="text-display-xl mt-5">Xác minh email để tiếp tục</h1>
            <p className="mt-3 text-body text-text-secondary leading-relaxed">
              Mở liên kết xác minh trong hộp thư{' '}
              <span className="font-semibold text-text-primary break-all">{user?.email}</span> rồi
              quay lại đây. Nếu chưa nhận được email, chọn gửi lại bên dưới.
            </p>

            {registrationProfilePending && (
              <p role="status" className="mt-4 text-body-sm text-warning">
                Tên hiển thị chưa được lưu. Chọn “Tôi đã xác minh” để thử lưu lại và kiểm tra email.
              </p>
            )}

            {notice && (
              <p role="status" className="mt-4 text-body-sm text-warning leading-relaxed">
                {notice}
              </p>
            )}

            <div className="mt-6 space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={isChecking}
                onClick={() => void checkVerification(false)}
              >
                {isChecking ? 'Đang kiểm tra…' : 'Tôi đã xác minh'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                loading={isResending}
                disabled={cooldown > 0}
                onClick={() => void handleResend()}
              >
                {isResending
                  ? 'Đang gửi email…'
                  : cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : 'Gửi lại email xác minh'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => void logout()}
              className="mt-6 mx-auto flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition-colors hover:text-text-primary focus-ring focus-visible:outline-none cursor-pointer"
            >
              <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
              Đăng xuất
            </button>
          </div>

          <p className="mt-4 text-center text-body-sm text-text-secondary leading-relaxed">
            Không thấy email? Kiểm tra thư mục spam hoặc gửi lại.
          </p>
        </div>
      </div>
    </main>
  );
}

export default VerifyEmailGate;

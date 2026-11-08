import PageHeader from '@/shared/components/ui/page-header';
import Button from '@/shared/components/ui/button';
import { useAuth } from '../components/auth-provider';
import ReauthDialog from '../components/reauth-dialog';
import AccountPasswordForm from '../components/account-password-form';
import { useAccountSecurity } from '../hooks/use-account-security';
import { hasProvider } from '../services/account-service';
import useAlertStore from '@/shared/stores/alert-store';

export default function AccountSecurityPage() {
  const { user, pendingGoogleEmail, cancelGoogleLink } = useAuth();
  const security = useAccountSecurity();
  const showAlert = useAlertStore((state) => state.showAlert);
  if (!user) return null;
  const hasGoogle = hasProvider(user, 'google.com');
  const hasPassword = hasProvider(user, 'password');
  const canUnlink = hasGoogle && hasPassword;
  const confirmUnlink = (providerId: string) => {
    const isGoogle = providerId === 'google.com';
    showAlert({
      title: isGoogle ? 'Gỡ liên kết Google?' : 'Gỡ mật khẩu?',
      message: isGoogle
        ? 'Bạn sẽ chỉ đăng nhập được bằng email/mật khẩu. Bạn cần xác thực lại trước khi gỡ.'
        : 'Bạn sẽ chỉ đăng nhập được bằng Google. Bạn cần xác thực lại trước khi gỡ.',
      type: 'danger',
      confirmText: isGoogle ? 'Gỡ liên kết Google' : 'Gỡ mật khẩu',
      cancelText: 'Giữ lại',
      onConfirm: () => security.unlinkMethod(providerId),
    });
  };
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="Tài khoản & bảo mật"
        description="Quản lý phương thức đăng nhập của bạn."
      />
      <section
        className="py-6 border-b border-border-default"
        aria-labelledby="account-email-title"
      >
        <h2 id="account-email-title" className="text-label-caps text-text-secondary">
          Email tài khoản
        </h2>
        <p className="mt-2 text-body break-all">{user.email}</p>
        <p className="mt-1 text-body-sm text-success">Đã xác minh email</p>
      </section>
      <section className="py-6 space-y-6" aria-labelledby="account-methods-title">
        {pendingGoogleEmail && (
          <div className="space-y-3 border-b border-border-default pb-6">
            <p className="text-body-sm text-text-secondary break-words">
              Bạn có yêu cầu kết nối Google cho {pendingGoogleEmail}. Xác nhận để hoàn tất liên kết.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={security.busy || security.needsReauth}
                onClick={() => void security.finishGoogleLink()}
              >
                Hoàn tất liên kết Google
              </Button>
              <Button
                variant="secondary"
                disabled={security.busy || security.needsReauth}
                onClick={cancelGoogleLink}
              >
                Hủy liên kết
              </Button>
            </div>
          </div>
        )}
        <h2 id="account-methods-title" className="text-title-md">
          Phương thức đăng nhập
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-body font-semibold">Google</h3>
            <p className="mt-1 text-body-sm text-text-secondary">
              {hasGoogle
                ? `Đã kết nối · ${user.providerData.find((provider) => provider.providerId === 'google.com')?.email ?? user.email}`
                : 'Chưa kết nối'}
            </p>
          </div>
          {!hasGoogle && (
            <Button
              variant="secondary"
              loading={security.busy}
              onClick={() => void security.connectGoogle()}
            >
              Kết nối Google
            </Button>
          )}
          {hasGoogle && (
            <Button
              variant="secondary"
              disabled={!canUnlink || security.busy || security.needsReauth}
              onClick={() => confirmUnlink('google.com')}
            >
              Gỡ liên kết Google
            </Button>
          )}
        </div>
        <div className="border-t border-border-default pt-6">
          <h3 className="text-body font-semibold">Email/mật khẩu</h3>
          <p className="mt-1 text-body-sm text-text-secondary">
            {hasPassword ? `Đã có mật khẩu · ${user.email}` : 'Chưa có mật khẩu'}
          </p>
          <AccountPasswordForm
            hasPassword={hasPassword}
            busy={security.busy || security.needsReauth}
            onSave={security.savePassword}
          />
          {hasPassword && (
            <Button
              variant="secondary"
              className="mt-4 sm:ml-3"
              disabled={!canUnlink || security.busy || security.needsReauth}
              onClick={() => confirmUnlink('password')}
            >
              Gỡ mật khẩu
            </Button>
          )}
        </div>
        {!canUnlink && (
          <p className="text-body-sm text-text-secondary">
            Không thể gỡ phương thức đăng nhập cuối cùng. Thêm phương thức khác để có thể gỡ.
          </p>
        )}
        {security.error && !security.needsReauth && (
          <p role="alert" className="text-body-sm text-danger">
            {security.error}
          </p>
        )}
      </section>
      <ReauthDialog
        open={security.needsReauth}
        busy={security.busy}
        error={security.error}
        hasPassword={hasPassword}
        hasGoogle={hasGoogle}
        onClose={security.cancelReauth}
        onConfirm={security.reauthenticate}
      />
    </div>
  );
}

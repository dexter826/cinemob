import PageHeader from '@/shared/components/ui/page-header';
import Button from '@/shared/components/ui/button';
import { useAuth } from '../components/auth-provider';
import ReauthDialog from '../components/reauth-dialog';
import { useAccountSecurity } from '../hooks/use-account-security';
import { hasProvider } from '../services/account-service';

export default function AccountSecurityPage() {
  const { user } = useAuth();
  const security = useAccountSecurity();
  if (!user) return null;
  const hasGoogle = hasProvider(user, 'google.com');
  const hasPassword = hasProvider(user, 'password');
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
        </div>
        <div className="border-t border-border-default pt-6">
          <h3 className="text-body font-semibold">Email/mật khẩu</h3>
          <p className="mt-1 text-body-sm text-text-secondary">
            {hasPassword ? `Đã có mật khẩu · ${user.email}` : 'Chưa có mật khẩu'}
          </p>
        </div>
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

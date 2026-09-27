import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, Camera, User } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import PageHeader from '@/shared/components/ui/PageHeader';
import { IconButton } from '@/shared/components/ui/IconButton';
import useToastStore from '@/shared/stores/toastStore';
import { updateDisplayName, validateDisplayName, FALLBACK_DISPLAY_NAME } from '../services/profileService';

const ChangeAvatarModal = lazy(() => import('@/features/auth/components/ChangeAvatarModal').then((m) => ({ default: m.ChangeAvatarModal })));

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return 'Không rõ';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  if (!user) return null;
  const displayName = user.displayName || FALLBACK_DISPLAY_NAME;
  const joinDate = formatJoinDate(user.metadata?.creationTime);

  const startEdit = () => {
    setDraft(displayName);
    setFieldError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFieldError(null);
  };

  const saveEdit = async () => {
    const checked = validateDisplayName(draft);
    if (!checked.ok) {
      setFieldError(checked.error);
      return;
    }
    if (checked.value === displayName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    setFieldError(null);
    try {
      await updateDisplayName(user, checked.value);
      await refreshUser();
      showToast('Đã cập nhật tên hiển thị', 'success');
      setIsEditing(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật tên';
      setFieldError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">
      <PageHeader
        title="Hồ sơ"
        description="Thông tin tài khoản CineMOB của bạn."
        onBack={() => navigate('/')}
      />
      <section aria-labelledby="profile-info-title" className="bg-surface border border-border rounded-3xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAvatarOpen(true)}
              aria-label="Đổi ảnh đại diện"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elevated hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Camera size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">Tên hiển thị</p>
            {!isEditing ? (
              <div className="flex items-center gap-2 min-w-0">
                <h2 id="profile-info-title" className="text-lg font-bold text-text-primary truncate">{displayName}</h2>
                <IconButton label="Sửa tên hiển thị" onClick={startEdit} size="sm">
                  <Pencil size={15} aria-hidden="true" />
                </IconButton>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    maxLength={50}
                    disabled={isSaving}
                    aria-label="Tên hiển thị mới"
                    className="flex-1 min-w-0 px-3 h-10 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary outline-none focus:border-primary"
                  />
                  <IconButton label="Lưu tên" onClick={saveEdit} disabled={isSaving} size="sm">
                    <Check size={15} aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Hủy sửa tên" onClick={cancelEdit} disabled={isSaving} size="sm">
                    <X size={15} aria-hidden="true" />
                  </IconButton>
                </div>
                {fieldError && <p role="alert" className="mt-2 text-xs text-danger">{fieldError}</p>}
              </div>
            )}
            <p className="mt-2 text-sm text-text-secondary truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary bg-black/5 dark:bg-white/5 border border-border rounded-full px-2.5 py-1">
                <User size={12} aria-hidden="true" /> Google
              </span>
              <span className="text-xs text-text-secondary">Tham gia {joinDate}</span>
            </div>
          </div>
        </div>
      </section>
      <Suspense fallback={null}>
        <ChangeAvatarModal isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} />
      </Suspense>
    </main>
  );
}

export default ProfilePage;

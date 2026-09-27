import { useState } from 'react';
import { Pencil, Check, X, Camera, Mail, CalendarDays } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Dialog, DialogBody } from '@/shared/components/ui/Dialog';
import { IconButton } from '@/shared/components/ui/IconButton';
import useToastStore from '@/shared/stores/toastStore';
import { updateDisplayName, validateDisplayName, FALLBACK_DISPLAY_NAME } from '../services/profileService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeAvatar: () => void;
}

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return 'Không rõ';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ProfileModal({ isOpen, onClose, onChangeAvatar }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="profile-title"
      descriptionId="profile-description"
      presentation="dialog"
      className="sm:max-w-sm"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="min-w-0">
          <h2 id="profile-title" className="text-base font-semibold text-text-primary">Hồ sơ</h2>
          <p id="profile-description" className="text-xs text-text-secondary">Thông tin tài khoản CineMOB của bạn.</p>
        </div>
        <IconButton label="Đóng hộp thoại hồ sơ" onClick={onClose} disabled={isSaving} size="sm">
          <span aria-hidden="true" className="text-lg leading-none">×</span>
        </IconButton>
      </div>

      <DialogBody>
        <div className="flex flex-col items-center text-center">
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold ring-4 ring-primary/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={onChangeAvatar}
              aria-label="Đổi ảnh đại diện"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elevated hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <Camera size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 w-full">
            {!isEditing ? (
              <div className="flex items-center justify-center gap-2 min-w-0">
                <p className="text-lg font-bold text-text-primary truncate font-display">{displayName}</p>
                <IconButton label="Sửa tên hiển thị" onClick={startEdit} size="sm">
                  <Pencil size={14} aria-hidden="true" />
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
                    className="flex-1 min-w-0 px-3 h-10 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary outline-none focus:border-primary text-center"
                  />
                  <IconButton label="Lưu tên" onClick={saveEdit} disabled={isSaving} size="sm">
                    <Check size={14} aria-hidden="true" />
                  </IconButton>
                  <IconButton label="Hủy sửa tên" onClick={cancelEdit} disabled={isSaving} size="sm">
                    <X size={14} aria-hidden="true" />
                  </IconButton>
                </div>
                {fieldError && <p role="alert" className="mt-2 text-xs text-danger">{fieldError}</p>}
              </div>
            )}
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary max-w-full">
            <Mail size={13} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{user.email}</span>
          </p>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
            <CalendarDays size={12} aria-hidden="true" /> Tham gia {joinDate}
          </p>
        </div>
      </DialogBody>
    </Dialog>
  );
}

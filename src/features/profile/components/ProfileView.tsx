import { useState } from 'react';
import type { DragEvent } from 'react';
import { CalendarDays, Camera, Check, Mail, Pencil, Upload, X } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { IconButton } from '@/shared/components/ui/IconButton';
import useToastStore from '@/shared/stores/toastStore';
import { classNames } from '@/shared/utils/classNames';
import { FALLBACK_DISPLAY_NAME, updateDisplayName, validateDisplayName } from '../services/profileService';

interface ProfileViewProps {
  avatarError: string | null;
  canDeleteAvatar: boolean;
  isAvatarBusy: boolean;
  isDragOverAvatar: boolean;
  onPickAvatar: () => void;
  onAvatarDragOver: (event: DragEvent<HTMLElement>) => void;
  onAvatarDragLeave: (event: DragEvent<HTMLElement>) => void;
  onAvatarDrop: (event: DragEvent<HTMLElement>) => void;
  onDeleteAvatar: () => void;
}

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return 'Không rõ';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Không rõ';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Nội dung hồ sơ: ảnh đại diện, tên hiển thị, email và ngày tham gia.
export function ProfileView({
  avatarError,
  canDeleteAvatar,
  isAvatarBusy,
  isDragOverAvatar,
  onPickAvatar,
  onAvatarDragOver,
  onAvatarDragLeave,
  onAvatarDrop,
  onDeleteAvatar,
}: ProfileViewProps) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  if (!user) return null;
  const displayName = user.displayName || FALLBACK_DISPLAY_NAME;

  const startNameEdit = () => {
    setDraftName(displayName);
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelNameEdit = () => {
    setIsEditingName(false);
    setNameError(null);
  };

  const saveName = async () => {
    const checked = validateDisplayName(draftName);
    if (!checked.ok) {
      setNameError(checked.error);
      return;
    }
    if (checked.value === displayName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    setNameError(null);
    try {
      await updateDisplayName(user, checked.value);
      await refreshUser();
      showToast('Đã cập nhật tên hiển thị', 'success');
      setIsEditingName(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật tên';
      setNameError(message);
      showToast(message, 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={onPickAvatar}
          onDragOver={onAvatarDragOver}
          onDragLeave={onAvatarDragLeave}
          onDrop={onAvatarDrop}
          disabled={isAvatarBusy}
          aria-label="Chọn ảnh đại diện"
          className={classNames(
            'relative block w-20 h-20 rounded-full overflow-hidden cursor-pointer transition-shadow',
            isDragOverAvatar ? 'ring-4 ring-primary' : 'ring-4 ring-primary/20',
            isAvatarBusy && 'opacity-50 cursor-not-allowed'
          )}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="Ảnh đại diện" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          {isDragOverAvatar && (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-primary/85 text-white"
            >
              <Upload size={22} />
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onPickAvatar}
          disabled={isAvatarBusy}
          aria-label="Đổi ảnh đại diện"
          className="absolute bottom-0 right-0 z-10 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elevated hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={14} aria-hidden="true" />
        </button>
      </div>

      {canDeleteAvatar && (
        <button
          type="button"
          onClick={onDeleteAvatar}
          disabled={isAvatarBusy}
          className="mt-2 text-xs font-medium text-danger hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Xóa ảnh đại diện
        </button>
      )}

      {avatarError && (
        <p
          role="alert"
          className="w-full mt-2 p-2.5 text-xs rounded-xl bg-danger/10 border border-danger/20 text-danger text-center"
        >
          {avatarError}
        </p>
      )}

      <div className="mt-3 w-full">
        {!isEditingName ? (
          <div className="flex items-center justify-center gap-2 min-w-0">
            <p className="text-lg font-bold text-text-primary truncate font-display">{displayName}</p>
            <IconButton label="Sửa tên hiển thị" onClick={startNameEdit} size="sm">
              <Pencil size={14} aria-hidden="true" />
            </IconButton>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void saveName();
                  if (e.key === 'Escape') cancelNameEdit();
                }}
                maxLength={50}
                disabled={isSavingName}
                aria-label="Tên hiển thị mới"
                className="flex-1 min-w-0 px-3 h-10 rounded-xl border border-border bg-surface-elevated text-sm text-text-primary outline-none focus:border-primary text-center"
              />
              <IconButton label="Lưu tên" onClick={() => void saveName()} disabled={isSavingName} size="sm">
                <Check size={14} aria-hidden="true" />
              </IconButton>
              <IconButton label="Hủy sửa tên" onClick={cancelNameEdit} disabled={isSavingName} size="sm">
                <X size={14} aria-hidden="true" />
              </IconButton>
            </div>
            {nameError && <p role="alert" className="mt-2 text-xs text-danger">{nameError}</p>}
          </div>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary max-w-full">
        <Mail size={13} className="shrink-0" aria-hidden="true" />
        <span className="truncate">{user.email || 'Chưa có email'}</span>
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
        <CalendarDays size={12} aria-hidden="true" /> Tham gia {formatJoinDate(user.metadata?.creationTime)}
      </p>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CalendarDays, Eye, EyeOff, Mail, Pencil, RotateCcw, Upload, X } from 'lucide-react';
import { AvatarCropView } from '@/features/auth/components/avatar/AvatarCropView';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/components/ui/Button';
import DatePicker from '@/shared/components/ui/DatePicker';
import Dropdown from '@/shared/components/ui/Dropdown';
import IconButton from '@/shared/components/ui/IconButton';
import Switch from '@/shared/components/ui/Switch';
import useToastStore from '@/shared/stores/toastStore';
import useAlertStore from '@/shared/stores/alertStore';
import { classNames } from '@/shared/utils/classNames';
import { ACCEPTED_IMAGE_TYPES, CROP_SIZE } from '../constants/avatarEditor';
import { useAvatarCrop } from '../hooks/useAvatarCrop';
import { formatJoinDate, GENDER_LABELS } from '../utils/profileFormat';
import { BIO_MAX_LENGTH, GENDER_OPTIONS } from '../services/memberProfileService';
import {
  FALLBACK_DISPLAY_NAME,
  updateDisplayName,
  validateDisplayName,
} from '../services/profileService';
import ProfileMeta from './ProfileMeta';
import type { OwnProfileDetails } from '../hooks/useOwnProfile';
import type { MemberProfile } from '@/types';

interface OwnProfileEditorProps {
  profile: MemberProfile | null;
  loading?: boolean;
  saving: boolean;
  toggling: boolean;
  onSaveDetails: (details: OwnProfileDetails) => Promise<boolean>;
  onToggleHidden: () => Promise<boolean>;
}

const GENDER_DROPDOWN_OPTIONS = [
  ...GENDER_OPTIONS.map((value) => ({ value, label: GENDER_LABELS[value] })),
  { value: '', label: 'Không cập nhật' },
];

// Thẻ hồ sơ chính chủ: mặc định là chế độ xem, nút "Chỉnh sửa" mới bật form.
function OwnProfileEditor({
  profile,
  loading = false,
  saving,
  toggling,
  onSaveDetails,
  onToggleHidden,
}: OwnProfileEditorProps) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();
  const crop = useAvatarCrop({ isOpen: true });

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [draftGender, setDraftGender] = useState('');
  const [draftDob, setDraftDob] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);
  const avatarMenuButtonRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isAvatarMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const isInsideButton = avatarMenuButtonRef.current?.contains(target) ?? false;
      const isInsideMenu = avatarMenuRef.current?.contains(target) ?? false;
      if (!isInsideButton && !isInsideMenu) setIsAvatarMenuOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, [isAvatarMenuOpen]);

  useEffect(() => {
    if (isAvatarMenuOpen) firstMenuItemRef.current?.focus();
  }, [isAvatarMenuOpen]);

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [user?.photoURL]);

  // Cảnh báo khi đóng/refresh trang trong lúc form hồ sơ còn thay đổi chưa lưu.
  useEffect(() => {
    if (!isEditing) return;
    const originalName = user?.displayName || FALLBACK_DISPLAY_NAME;
    const hasDraftChanges =
      draftName !== originalName ||
      draftBio !== (profile?.bio ?? '') ||
      draftGender !== (profile?.gender ?? '') ||
      draftDob !== (profile?.dob ?? '');
    if (!hasDraftChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isEditing, draftName, draftBio, draftGender, draftDob, profile, user]);

  if (!user) return null;
  const displayName = user.displayName || FALLBACK_DISPLAY_NAME;
  const isHidden = profile?.isMovieListHidden ?? false;
  const isEditingDirty =
    draftName !== displayName ||
    draftBio !== (profile?.bio ?? '') ||
    draftGender !== (profile?.gender ?? '') ||
    draftDob !== (profile?.dob ?? '');

  // useFocusTrap bắt Escape ở tầng document, phải chặn trước khi sự kiện nổi lên đó.
  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    setIsAvatarMenuOpen(false);
    avatarMenuButtonRef.current?.focus();
  };

  const startEditing = () => {
    setDraftName(displayName);
    setDraftBio(profile?.bio ?? '');
    setDraftGender(profile?.gender ?? '');
    setDraftDob(profile?.dob ?? '');
    setNameError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (crop.isBusy) return;
    if (!isEditingDirty) {
      crop.cancelCrop();
      setIsEditing(false);
      return;
    }
    showAlert({
      title: 'Bỏ thay đổi hồ sơ?',
      message: 'Các thay đổi chưa lưu sẽ mất nếu bạn thoát khỏi chế độ chỉnh sửa.',
      type: 'warning',
      confirmText: 'Bỏ thay đổi',
      onConfirm: () => {
        crop.cancelCrop();
        setIsEditing(false);
      },
    });
  };

  const submitEditing = async () => {
    const checked = validateDisplayName(draftName);
    if (!checked.ok) {
      setNameError(checked.error);
      nameInputRef.current?.focus();
      return;
    }
    setIsSubmitting(true);
    setNameError(null);
    try {
      if (checked.value !== displayName) {
        await updateDisplayName(user, checked.value);
        await refreshUser();
      }
      const detailsSaved = await onSaveDetails({
        bio: draftBio,
        gender: draftGender as OwnProfileDetails['gender'],
        dob: draftDob,
      });
      if (detailsSaved) setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ';
      setNameError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || saving || crop.isBusy;

  return (
    <div className="bg-surface border border-border rounded-dialog p-5 sm:p-6">
      <input
        ref={crop.fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={crop.handleFileChange}
        className="hidden"
      />

      {crop.imageSrc ? (
        <div className="flex flex-col items-center">
          <AvatarCropView
            imageSrc={crop.imageSrc}
            imgRef={crop.imgRef}
            renderedWidth={crop.renderedWidth}
            renderedHeight={crop.renderedHeight}
            pan={crop.pan}
            cropSize={CROP_SIZE}
            zoom={crop.zoom}
            isDragging={crop.isDraggingPan}
            isUploading={crop.isUploading}
            onWheelZoom={crop.handleWheelZoom}
            onKeyboardPan={crop.handleKeyboardPan}
            onPointerDown={crop.handlePointerDown}
            onPointerMove={crop.handlePointerMove}
            onPointerUp={crop.handlePointerUp}
            onZoomChange={crop.handleZoomChange}
          />

          {crop.errorMessage && (
            <p
              role="alert"
              className="w-full mt-4 p-2.5 text-xs rounded-control bg-danger/10 border border-danger/20 text-danger text-center"
            >
              {crop.errorMessage}
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <IconButton
              label="Hủy căn chỉnh ảnh"
              onClick={crop.cancelCrop}
              disabled={crop.isBusy}
              size="md"
            >
              <X size={16} aria-hidden="true" />
            </IconButton>
            <IconButton
              label="Chọn ảnh khác"
              onClick={crop.pickAnother}
              disabled={crop.isBusy}
              size="md"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </IconButton>
            <Button
              variant="primary"
              size="md"
              onClick={() => void crop.handleSave()}
              loading={crop.isUploading}
            >
              Lưu ảnh
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div
                onDragOver={isEditing ? crop.handleDragOver : undefined}
                onDragLeave={isEditing ? crop.handleDragLeave : undefined}
                onDrop={isEditing ? crop.handleDrop : undefined}
                className={classNames(
                  'relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-shadow',
                  isEditing && 'ring-4',
                  isEditing && !crop.isDragOverAvatar && 'ring-primary/20',
                  crop.isDragOverAvatar && 'ring-4 ring-primary',
                )}
              >
                {user.photoURL && !isAvatarLoadFailed ? (
                  <img
                    src={user.photoURL}
                    alt="Ảnh đại diện"
                    onError={() => setIsAvatarLoadFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                {crop.isDragOverAvatar && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-primary/85 text-white"
                  >
                    <Upload size={26} />
                  </span>
                )}
              </div>

              {isEditing && (
                <button
                  ref={avatarMenuButtonRef}
                  type="button"
                  onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
                  disabled={crop.isBusy}
                  aria-label="Tuỳ chọn ảnh đại diện"
                  aria-haspopup="menu"
                  aria-expanded={isAvatarMenuOpen}
                  className="absolute bottom-0 right-0 z-10 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-elevated hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
              )}
              {isEditing && isAvatarMenuOpen && (
                <div
                  ref={avatarMenuRef}
                  role="menu"
                  onKeyDown={handleMenuKeyDown}
                  className="absolute left-1/2 top-[calc(100%+0.75rem)] z-20 w-[220px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-card border border-border bg-surface-elevated py-1 shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    ref={firstMenuItemRef}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      crop.openFilePicker();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    <Upload size={14} className="text-primary shrink-0" aria-hidden="true" />
                    <span>Tải ảnh mới</span>
                  </button>

                  {crop.canRevertToGoogle && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsAvatarMenuOpen(false);
                        crop.handleDelete();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer border-t border-border/50"
                    >
                      <RotateCcw size={14} className="shrink-0" aria-hidden="true" />
                      <span>Khôi phục ảnh gốc</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate tracking-tight font-display">
                    {displayName}
                  </h2>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-text-secondary max-w-full">
                    <Mail size={12} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{user.email || 'Chưa có email'}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                    <CalendarDays size={12} aria-hidden="true" /> Tham gia{' '}
                    {formatJoinDate(user.metadata?.creationTime)}
                  </p>
                </div>

                {!isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={startEditing}
                    leadingIcon={<Pencil size={14} aria-hidden="true" />}
                    className="shrink-0"
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>

              {!isEditing && (
                <div className="mt-1">
                  {loading ? (
                    <div aria-hidden="true" className="space-y-2 max-w-prose">
                      <div className="h-3 w-32 rounded-md bg-black/5 dark:bg-white/5 motion-safe:animate-pulse motion-reduce:animate-none" />
                      <div className="h-3 w-3/4 rounded-md bg-black/5 dark:bg-white/5 motion-safe:animate-pulse motion-reduce:animate-none" />
                      <div className="h-3 w-1/2 rounded-md bg-black/5 dark:bg-white/5 motion-safe:animate-pulse motion-reduce:animate-none" />
                    </div>
                  ) : (
                    <>
                      <ProfileMeta gender={profile?.gender} dob={profile?.dob} />
                      {profile?.bio ? (
                        <p className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-line max-w-prose">
                          {profile.bio}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-text-secondary italic">
                          Chưa có giới thiệu.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary mb-1">
                  Tên hiển thị
                </span>
                <input
                  ref={nameInputRef}
                  name="display-name"
                  autoComplete="nickname"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  maxLength={50}
                  aria-invalid={nameError ? true : undefined}
                  className="w-full px-3 h-10 rounded-control border border-border bg-surface-elevated text-sm text-text-primary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
                />
                {nameError && (
                  <p role="alert" className="mt-1.5 text-xs text-danger">
                    {nameError}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-text-secondary mb-1">
                  Giới thiệu
                </span>
                <textarea
                  name="bio"
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
                  rows={3}
                  maxLength={BIO_MAX_LENGTH}
                  placeholder="Thêm vài dòng giới thiệu về bạn…"
                  className="w-full px-3 py-2 rounded-control border border-border bg-surface-elevated text-sm text-text-primary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 resize-none"
                />
                <span className="block text-right text-xs text-text-secondary">
                  {draftBio.length}/{BIO_MAX_LENGTH}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="block text-xs font-semibold text-text-secondary mb-1">
                    Giới tính
                  </span>
                  <Dropdown
                    options={GENDER_DROPDOWN_OPTIONS}
                    value={draftGender}
                    onChange={(val) => setDraftGender(String(val))}
                    placeholder="Chọn giới tính…"
                  />
                </label>
                <label>
                  <span className="block text-xs font-semibold text-text-secondary mb-1">
                    Ngày sinh
                  </span>
                  <DatePicker value={draftDob} onChange={setDraftDob} />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="secondary" size="md" onClick={cancelEditing} disabled={isBusy}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => void submitEditing()}
                  disabled={isBusy}
                  loading={isSubmitting || saving}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  {isHidden ? (
                    <EyeOff size={13} className="text-text-secondary shrink-0" aria-hidden="true" />
                  ) : (
                    <Eye size={13} className="text-primary shrink-0" aria-hidden="true" />
                  )}
                  Ẩn danh sách phim
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {isHidden
                    ? 'Danh sách phim đã bị gỡ khỏi dữ liệu, không ai xem được.'
                    : 'Danh sách phim đã xem hiển thị với mọi thành viên.'}
                </p>
              </div>
              <Switch
                checked={isHidden}
                onToggle={() => void onToggleHidden()}
                label="Ẩn danh sách phim"
                disabled={toggling}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OwnProfileEditor;

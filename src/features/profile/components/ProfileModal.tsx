import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { AvatarCropView } from '@/features/auth/components/avatar/AvatarCropView';
import { Dialog, DialogBody, DialogFooter } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { ACCEPTED_IMAGE_TYPES, CROP_SIZE } from '../constants/avatarEditor';
import { useAvatarCrop } from '../hooks/useAvatarCrop';
import { ProfileView } from './ProfileView';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hộp thoại hồ sơ, tự chuyển sang chế độ căn chỉnh ảnh khi đang thay avatar.
export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const crop = useAvatarCrop({ isOpen });
  const isCropping = crop.imageSrc !== null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="profile-title"
      descriptionId="profile-description"
      presentation="dialog"
      size="sm"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isCropping && (
            <IconButton label="Chọn ảnh khác" onClick={crop.pickAnother} disabled={crop.isBusy} size="sm">
              <ArrowLeft size={16} aria-hidden="true" />
            </IconButton>
          )}
          <div className="min-w-0">
            <h2 id="profile-title" className="text-base font-semibold text-text-primary">
              {isCropping ? 'Căn chỉnh ảnh đại diện' : 'Hồ sơ'}
            </h2>
            <p id="profile-description" className="text-xs text-text-secondary">
              {isCropping ? 'Kéo để căn góc, cuộn để phóng to.' : 'Thông tin tài khoản CineMOB của bạn.'}
            </p>
          </div>
        </div>
        <IconButton label="Đóng hộp thoại hồ sơ" onClick={onClose} disabled={crop.isBusy} size="sm">
          <span aria-hidden="true" className="text-lg leading-none">×</span>
        </IconButton>
      </div>

      <DialogBody>
        <input
          ref={crop.fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={crop.handleFileChange}
          className="hidden"
        />

        {!crop.imageSrc ? (
          <ProfileView
            avatarError={crop.errorMessage}
            canDeleteAvatar={crop.canRevertToGoogle}
            isAvatarBusy={crop.isBusy}
            isDragOverAvatar={crop.isDragOverAvatar}
            onPickAvatar={crop.openFilePicker}
            onAvatarDragOver={crop.handleDragOver}
            onAvatarDragLeave={crop.handleDragLeave}
            onAvatarDrop={crop.handleDrop}
            onDeleteAvatar={crop.handleDelete}
          />
        ) : (
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
              onPointerDown={crop.handlePointerDown}
              onPointerMove={crop.handlePointerMove}
              onPointerUp={crop.handlePointerUp}
              onZoomChange={crop.handleZoomChange}
            />

            {crop.errorMessage && (
              <p
                role="alert"
                className="w-full mt-4 p-2.5 text-xs rounded-xl bg-danger/10 border border-danger/20 text-danger text-center"
              >
                {crop.errorMessage}
              </p>
            )}
          </div>
        )}
      </DialogBody>

      {isCropping && (
        <DialogFooter>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={crop.cancelCrop} disabled={crop.isBusy}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={crop.handleSave}
              disabled={crop.isBusy}
              loading={crop.isUploading}
              leadingIcon={
                crop.isUploading ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Check size={14} aria-hidden="true" />
                )
              }
            >
              {crop.isUploading ? 'Đang tải lên…' : 'Lưu ảnh'}
            </Button>
          </div>
        </DialogFooter>
      )}
    </Dialog>
  );
}

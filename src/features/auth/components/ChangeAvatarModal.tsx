import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { updateUserAvatar, getOriginalGoogleAvatar, revertToGoogleAvatar } from '../services/avatarService';
import { getCroppedImgBlob } from '../services/cloudinaryService';
import useToastStore from '@/shared/stores/toastStore';
import { Dialog, DialogBody, DialogFooter } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { AvatarPickView } from './avatar/AvatarPickView';
import { AvatarCropView } from './avatar/AvatarCropView';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CROP_SIZE = 220;

export function ChangeAvatarModal({ isOpen, onClose }: ChangeAvatarModalProps) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [isUploading, setIsUploading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isDragOverPick, setIsDragOverPick] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Đặt lại toàn bộ trạng thái chọn và crop ảnh.
  const handleReset = useCallback(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setSelectedFile(null);
    setImageSrc(null);
    setImageMeta(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setErrorMessage(null);
    setIsUploading(false);
  }, [imageSrc]);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen, handleReset]);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Tính tỷ lệ cơ sở để ảnh phủ kín khung crop tròn.
  const getBaseScale = useCallback(() => {
    if (!imageMeta) return 1;
    return Math.max(CROP_SIZE / imageMeta.width, CROP_SIZE / imageMeta.height);
  }, [imageMeta]);

  // Giới hạn toạ độ pan không để lộ khoảng trống trong vòng tròn.
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (!imageMeta) return { x: 0, y: 0 };
      const currentScale = getBaseScale() * currentZoom;
      const renderedWidth = imageMeta.width * currentScale;
      const renderedHeight = imageMeta.height * currentScale;

      const maxPanX = Math.max(0, (renderedWidth - CROP_SIZE) / 2);
      const maxPanY = Math.max(0, (renderedHeight - CROP_SIZE) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y))
      };
    },
    [imageMeta, getBaseScale]
  );

  // Kiểm tra file hợp lệ và đọc kích thước ảnh gốc.
  const handleValidateFile = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh tối đa 10MB');
      return;
    }

    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      setImageMeta({ width: probe.naturalWidth, height: probe.naturalHeight });
      setSelectedFile(file);
      setImageSrc(objectUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage('Không thể đọc tệp ảnh');
    };
    probe.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateFile(file);
    }
    e.target.value = '';
  };

  // Xử lý kéo thả chuột hoặc ngón tay để căn góc ảnh.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isUploading) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDraggingPan(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPan) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextPan = clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoom);
    setPan(nextPan);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingPan) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Bỏ qua lỗi trình duyệt nếu con trỏ đã tự động nhả.
      }
      setIsDraggingPan(false);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);
    setPan((prev) => clampPan(prev.x, prev.y, clampedZoom));
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomChange(zoom + delta);
  };

  // Cắt ảnh theo vùng chọn và tải lên lưu trữ.
  const handleSaveCropped = async () => {
    if (!user || !imgRef.current) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const croppedBlob = await getCroppedImgBlob(imgRef.current, {
        pan,
        zoom,
        cropSize: CROP_SIZE,
        outputSize: 300,
        quality: 0.88
      });

      await updateUserAvatar(user, croppedBlob);
      await refreshUser();
      showToast('Đổi ảnh đại diện thành công!', 'success');
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error && error.message ? error.message : 'Không thể cập nhật ảnh đại diện';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Khôi phục avatar về ảnh gốc của Google.
  const handleRevertToGoogle = async () => {
    if (!user || isReverting || isUploading) return;

    setIsReverting(true);
    setErrorMessage(null);

    try {
      await revertToGoogleAvatar(user);
      await refreshUser();
      showToast('Đã khôi phục ảnh đại diện Google', 'success');
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error && error.message ? error.message : 'Không thể khôi phục ảnh đại diện';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsReverting(false);
    }
  };

  const googleAvatarUrl = user ? getOriginalGoogleAvatar(user) : null;
  const canRevertToGoogle = Boolean(
    googleAvatarUrl && user?.photoURL && user.photoURL !== googleAvatarUrl
  );

  const baseScale = getBaseScale();
  const currentScale = baseScale * zoom;
  const renderedWidth = imageMeta ? imageMeta.width * currentScale : CROP_SIZE;
  const renderedHeight = imageMeta ? imageMeta.height * currentScale : CROP_SIZE;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="change-avatar-title"
      descriptionId="change-avatar-description"
      presentation="dialog"
      className="sm:max-w-sm"
    >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {imageSrc && (
                  <IconButton
                    label="Chọn lại ảnh"
                    onClick={handleReset}
                    disabled={isUploading}
                    size="sm"
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                  </IconButton>
                )}
                <div className="min-w-0">
                  <h2 id="change-avatar-title" className="text-base font-semibold text-text-primary">
                    {imageSrc ? 'Căn chỉnh ảnh đại diện' : 'Đổi ảnh đại diện'}
                  </h2>
                  <p id="change-avatar-description" className="text-xs text-text-secondary">
                    {imageSrc ? 'Kéo để căn góc, cuộn để phóng to.' : 'Chọn ảnh JPG, PNG hoặc WEBP tối đa 10MB.'}
                  </p>
                </div>
              </div>
              <IconButton label="Đóng hộp thoại đổi ảnh" onClick={onClose} disabled={isUploading} size="sm">
                <span aria-hidden="true" className="text-lg leading-none">×</span>
              </IconButton>
            </div>

            <DialogBody>
              <div className="flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imageSrc ? (
                <AvatarPickView
                  photoURL={user?.photoURL ?? null}
                  displayInitial={user?.displayName?.charAt(0) || 'U'}
                  isDragOver={isDragOverPick}
                  isUploading={isUploading}
                  isReverting={isReverting}
                  canRevert={canRevertToGoogle}
                  onPickClick={() => fileInputRef.current?.click()}
                  onDragStateChange={setIsDragOverPick}
                  onDropFile={handleValidateFile}
                  onRevert={handleRevertToGoogle}
                />
              ) : (
                <AvatarCropView
                  imageSrc={imageSrc}
                  imgRef={imgRef}
                  renderedWidth={renderedWidth}
                  renderedHeight={renderedHeight}
                  pan={pan}
                  cropSize={CROP_SIZE}
                  zoom={zoom}
                  isDragging={isDraggingPan}
                  isUploading={isUploading}
                  onWheelZoom={handleWheelZoom}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onZoomChange={handleZoomChange}
                />
              )}

              {errorMessage && (
                <p role="alert" className="w-full mt-4 p-2.5 text-xs rounded-xl bg-danger/10 border border-danger/20 text-danger text-center">
                  {errorMessage}
                </p>
              )}
              </div>
            </DialogBody>

            <DialogFooter>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Hủy
                </Button>

                {imageSrc && (
                  <Button
                    variant="primary"
                    onClick={handleSaveCropped}
                    disabled={isUploading}
                    loading={isUploading}
                    leadingIcon={isUploading
                      ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      : <Check size={14} aria-hidden="true" />}
                  >
                    {isUploading ? 'Đang tải lên…' : 'Lưu ảnh'}
                  </Button>
                )}
              </div>
            </DialogFooter>
    </Dialog>
  );
};

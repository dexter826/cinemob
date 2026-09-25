import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Loader2, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';
import { updateUserAvatar, getOriginalGoogleAvatar, revertToGoogleAvatar } from '../services/avatarService';
import { getCroppedImgBlob } from '../services/cloudinaryService';
import useToastStore from '@/shared/stores/toastStore';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import { MODAL_VARIANTS, OVERLAY_VARIANTS } from '@/constants';
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

  usePreventScroll(isOpen);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
          onClick={onClose}
        >
          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface border border-border-default rounded-3xl w-full max-w-sm overflow-hidden shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border-default bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {imageSrc && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isUploading}
                    aria-label="Chọn lại ảnh"
                    className="p-1 -ml-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h2 className="text-base font-semibold text-text-main">
                  {imageSrc ? 'Căn chỉnh ảnh đại diện' : 'Đổi ảnh đại diện'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                aria-label="Đóng hộp thoại"
                className="p-1.5 -mr-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center">
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

              {/* Thông báo lỗi nếu có */}
              {errorMessage && (
                <div className="w-full mt-4 p-2.5 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-in fade-in">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-default bg-surface/50 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>

              {imageSrc && (
                <button
                  type="button"
                  onClick={handleSaveCropped}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Lưu ảnh</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

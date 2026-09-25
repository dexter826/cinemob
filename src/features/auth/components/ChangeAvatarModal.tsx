import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Camera, Upload, Loader2, Check, ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';
import { updateUserAvatar, getOriginalGoogleAvatar, revertToGoogleAvatar } from '../services/avatarService';
import { getCroppedImgBlob } from '../services/cloudinaryService';
import useToastStore from '@/shared/stores/toastStore';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import { MODAL_VARIANTS, OVERLAY_VARIANTS } from '@/constants';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CROP_SIZE = 220;

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  usePreventScroll(isOpen);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  // Đặt lại toàn bộ trạng thái chọn và crop ảnh.
  const handleReset = () => {
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
  };

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
    } catch (error: any) {
      const msg = error?.message || 'Không thể cập nhật ảnh đại diện';
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
    } catch (error: any) {
      const msg = error?.message || 'Không thể khôi phục ảnh đại diện';
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
                /* Màn hình chọn ảnh */
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Chọn hoặc kéo thả ảnh đại diện mới"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverPick(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOverPick(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverPick(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleValidateFile(file);
                    }}
                    className={`relative w-36 h-36 rounded-full cursor-pointer select-none transition-all duration-200 outline-none group ${
                      isDragOverPick
                        ? 'ring-4 ring-primary scale-105 shadow-xl'
                        : 'ring-2 ring-border-default hover:ring-primary/80 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-[0.98]'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Ảnh đại diện"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-primary">
                          {user?.displayName?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>

                    <div
                      className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                        isDragOverPick
                          ? 'bg-primary/80 text-white opacity-100 backdrop-blur-xs'
                          : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 backdrop-blur-xs'
                      }`}
                    >
                      {isDragOverPick ? (
                        <>
                          <Upload size={26} className="animate-bounce" />
                          <span className="text-xs font-semibold mt-1">Thả ảnh vào đây</span>
                        </>
                      ) : (
                        <>
                          <Camera size={24} />
                          <span className="text-xs font-medium mt-1">Chọn ảnh</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 text-center flex flex-col items-center">
                    <p className="text-xs text-text-muted">Nhấp hoặc kéo thả ảnh vào vòng tròn</p>
                    <p className="text-[11px] text-text-muted/70 mt-1">
                      JPG, PNG, WEBP · Tối đa 10MB
                    </p>

                    {canRevertToGoogle && (
                      <button
                        type="button"
                        onClick={handleRevertToGoogle}
                        disabled={isReverting || isUploading}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/10 border border-border-default transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                        title="Đặt lại ảnh đại diện về ảnh gốc tài khoản Google"
                      >
                        {isReverting ? (
                          <Loader2 size={13} className="animate-spin text-primary" />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        <span>Dùng lại ảnh Google</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Màn hình Cắt & Căn chỉnh ảnh (Crop View) */
                <div className="w-full flex flex-col items-center select-none">
                  {/* Viewport cắt ảnh */}
                  <div
                    style={{ width: CROP_SIZE, height: CROP_SIZE }}
                    onWheel={handleWheelZoom}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className={`relative rounded-full overflow-hidden ring-4 ring-primary/40 shadow-xl touch-none bg-black/80 ${
                      isDraggingPan ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Ảnh căn chỉnh"
                      draggable={false}
                      style={{
                        width: renderedWidth,
                        height: renderedHeight,
                        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                        left: '50%',
                        top: '50%',
                        position: 'absolute',
                        maxWidth: 'none',
                        userSelect: 'none'
                      }}
                    />

                    {/* Lưới định tâm nhẹ nhàng */}
                    <div className="absolute inset-0 pointer-events-none rounded-full border border-white/20" />
                  </div>

                  {/* Thanh điều khiển phóng to/thu nhỏ */}
                  <div className="w-full mt-5 px-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(zoom - 0.2)}
                      disabled={zoom <= 1 || isUploading}
                      aria-label="Thu nhỏ"
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <ZoomOut size={16} />
                    </button>

                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      disabled={isUploading}
                      aria-label="Mức phóng to"
                      className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />

                    <button
                      type="button"
                      onClick={() => handleZoomChange(zoom + 0.2)}
                      disabled={zoom >= 3 || isUploading}
                      aria-label="Phóng to"
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer disabled:opacity-30"
                    >
                      <ZoomIn size={16} />
                    </button>

                    <span className="text-xs font-mono text-text-muted w-9 text-right">
                      {zoom.toFixed(1)}x
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted/70 mt-2 text-center">
                    Kéo ảnh để căn góc mặt, cuộn chuột để phóng to
                  </p>
                </div>
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

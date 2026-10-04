import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { getCroppedImgBlob } from '@/features/auth/services/cloudinaryService';
import {
  getOriginalGoogleAvatar,
  revertToGoogleAvatar,
  updateUserAvatar,
} from '@/features/auth/services/avatarService';
import useAlertStore from '@/shared/stores/alertStore';
import useToastStore from '@/shared/stores/toastStore';
import {
  CROP_SIZE,
  MAX_FILE_BYTES,
  MAX_ZOOM,
  MIN_ZOOM,
  OUTPUT_SIZE,
  WEBP_QUALITY,
  WHEEL_ZOOM_STEP,
} from '../constants/avatarEditor';

interface ImageMeta {
  width: number;
  height: number;
}

export interface UseAvatarCropResult {
  imageSrc: string | null;
  renderedWidth: number;
  renderedHeight: number;
  zoom: number;
  pan: { x: number; y: number };
  isDraggingPan: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  isBusy: boolean;
  isDragOverAvatar: boolean;
  errorMessage: string | null;
  canRevertToGoogle: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  imgRef: RefObject<HTMLImageElement | null>;
  openFilePicker: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (event: DragEvent<HTMLElement>) => void;
  handleDragLeave: (event: DragEvent<HTMLElement>) => void;
  handleDrop: (event: DragEvent<HTMLElement>) => void;
  pickAnother: () => void;
  cancelCrop: () => void;
  handleSave: () => Promise<void>;
  handleDelete: () => void;
  handlePointerDown: (event: ReactPointerEvent) => void;
  handlePointerMove: (event: ReactPointerEvent) => void;
  handlePointerUp: (event: ReactPointerEvent) => void;
  handleZoomChange: (zoom: number) => void;
  handleWheelZoom: (event: globalThis.WheelEvent) => void;
  handleKeyboardPan: (dx: number, dy: number) => void;
}

// Tỷ lệ co để ảnh gốc phủ kín khung crop vuông.
function getBaseScale(imageMeta: ImageMeta | null): number {
  if (!imageMeta) return 1;
  return Math.max(CROP_SIZE / imageMeta.width, CROP_SIZE / imageMeta.height);
}

// Quản lý chọn ảnh, căn chỉnh, cắt và tải lên ảnh đại diện.
export function useAvatarCrop({ isOpen }: { isOpen: boolean }): UseAvatarCropResult {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToastStore();
  const { showAlert } = useAlertStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const panDragOriginRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = isUploading || isDeleting;

  const releaseImage = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    releaseImage();
    setImageSrc(null);
    setImageMeta(null);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    setIsDraggingPan(false);
    setIsDragOverAvatar(false);
    setErrorMessage(null);
    setIsUploading(false);
  }, [releaseImage]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => releaseImage, [releaseImage]);

  // Giới hạn toạ độ pan không để lộ khoảng trống trong vòng tròn.
  const clampPan = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (!imageMeta) return { x: 0, y: 0 };
      const currentScale = getBaseScale(imageMeta) * currentZoom;
      const maxPanX = Math.max(0, (imageMeta.width * currentScale - CROP_SIZE) / 2);
      const maxPanY = Math.max(0, (imageMeta.height * currentScale - CROP_SIZE) / 2);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, y)),
      };
    },
    [imageMeta],
  );

  // Kiểm tra tệp hợp lệ rồi nạp vào khung crop.
  const selectFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WEBP)');
        return;
      }

      if (file.size > MAX_FILE_BYTES) {
        setErrorMessage('Kích thước ảnh tối đa 10\u00A0MB');
        return;
      }

      releaseImage();
      const objectUrl = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        objectUrlRef.current = objectUrl;
        setImageMeta({ width: probe.naturalWidth, height: probe.naturalHeight });
        setImageSrc(objectUrl);
        setZoom(MIN_ZOOM);
        setPan({ x: 0, y: 0 });
      };
      probe.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage('Không đọc được tệp ảnh. Hãy thử chọn ảnh khác.');
      };
      probe.src = objectUrl;
    },
    [releaseImage],
  );

  const openFilePicker = useCallback(() => {
    if (isBusy) return;
    fileInputRef.current?.click();
  }, [isBusy]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) selectFile(file);
      event.target.value = '';
    },
    [selectFile],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOverAvatar(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOverAvatar(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragOverAvatar(false);
      const file = event.dataTransfer.files?.[0];
      if (file) selectFile(file);
    },
    [selectFile],
  );

  const pickAnother = useCallback(() => {
    reset();
    fileInputRef.current?.click();
  }, [reset]);

  const cancelCrop = reset;

  // Kéo chuột hoặc ngón tay để căn góc ảnh.
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (isBusy) return;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      setIsDraggingPan(true);
      panDragOriginRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    },
    [isBusy, pan.x, pan.y],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!isDraggingPan) return;
      const dx = event.clientX - panDragOriginRef.current.x;
      const dy = event.clientY - panDragOriginRef.current.y;
      setPan(
        clampPan(panDragOriginRef.current.panX + dx, panDragOriginRef.current.panY + dy, zoom),
      );
    },
    [isDraggingPan, clampPan, zoom],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent) => {
      if (!isDraggingPan) return;
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {
        // Bỏ qua lỗi trình duyệt nếu con trỏ đã tự động nhả.
      }
      setIsDraggingPan(false);
    },
    [isDraggingPan],
  );

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      setZoom(clampedZoom);
      setPan((prev) => clampPan(prev.x, prev.y, clampedZoom));
    },
    [clampPan],
  );

  const handleWheelZoom = useCallback(
    (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP;
      handleZoomChange(zoom + delta);
    },
    [handleZoomChange, zoom],
  );

  // Pan bằng phím mũi tên — kênh bàn phím thay cho thao tác kéo bằng chuột.
  const handleKeyboardPan = useCallback(
    (dx: number, dy: number) => {
      setPan((prev) => clampPan(prev.x + dx, prev.y + dy, zoom));
    },
    [clampPan, zoom],
  );

  const handleSave = useCallback(async () => {
    const img = imgRef.current;
    if (!user || !img) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const croppedBlob = await getCroppedImgBlob(img, {
        pan,
        zoom,
        cropSize: CROP_SIZE,
        outputSize: OUTPUT_SIZE,
        quality: WEBP_QUALITY,
      });

      await updateUserAvatar(user, croppedBlob);
      await refreshUser();
      showToast('Đổi ảnh đại diện thành công!', 'success');
      reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message ? error.message : 'Không thể cập nhật ảnh đại diện';
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsUploading(false);
    }
  }, [user, refreshUser, showToast, pan, zoom, reset]);

  // Xác nhận rồi khôi phục ảnh gốc tài khoản Google.
  const handleDelete = useCallback(() => {
    if (!user || isBusy) return;

    showAlert({
      title: 'Xóa ảnh đại diện',
      message:
        'Bạn có chắc chắn muốn xóa ảnh này? Ảnh đại diện sẽ được khôi phục về ảnh gốc từ tài khoản Google.',
      type: 'danger',
      confirmText: 'Xóa ảnh',
      cancelText: 'Hủy',
      onConfirm: async () => {
        setIsDeleting(true);
        setErrorMessage(null);

        try {
          await revertToGoogleAvatar(user);
          await refreshUser();
          showToast('Đã khôi phục ảnh đại diện Google', 'success');
        } catch (error: unknown) {
          const message =
            error instanceof Error && error.message ? error.message : 'Không thể xóa ảnh đại diện';
          setErrorMessage(message);
          showToast(message, 'error');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  }, [user, isBusy, refreshUser, showToast, showAlert]);

  const googleAvatarUrl = user ? getOriginalGoogleAvatar(user) : null;
  const canRevertToGoogle = Boolean(
    googleAvatarUrl && user?.photoURL && user.photoURL !== googleAvatarUrl,
  );

  const currentScale = getBaseScale(imageMeta) * zoom;

  return {
    imageSrc,
    renderedWidth: imageMeta ? imageMeta.width * currentScale : CROP_SIZE,
    renderedHeight: imageMeta ? imageMeta.height * currentScale : CROP_SIZE,
    zoom,
    pan,
    isDraggingPan,
    isUploading,
    isDeleting,
    isBusy,
    isDragOverAvatar,
    errorMessage,
    canRevertToGoogle,
    fileInputRef,
    imgRef,
    openFilePicker,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    pickAnother,
    cancelCrop,
    handleSave,
    handleDelete,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleZoomChange,
    handleWheelZoom,
    handleKeyboardPan,
  };
}

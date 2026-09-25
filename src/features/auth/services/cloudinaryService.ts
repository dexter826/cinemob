import { CLOUDINARY_CONFIG } from '@/constants/config';

export interface CropParams {
  pan: { x: number; y: number };
  zoom: number;
  cropSize: number;
  outputSize?: number;
  quality?: number;
}

// Cắt và nén ảnh theo toạ độ di chuyển và mức phóng to.
export const getCroppedImgBlob = (
  img: HTMLImageElement,
  params: CropParams
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const { pan, zoom, cropSize, outputSize = 256, quality = 0.85 } = params;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Không thể khởi tạo canvas'));
      return;
    }

    const baseScale = Math.max(cropSize / img.naturalWidth, cropSize / img.naturalHeight);
    const currentScale = baseScale * zoom;

    const renderedWidth = img.naturalWidth * currentScale;
    const renderedHeight = img.naturalHeight * currentScale;

    const maxPanX = Math.max(0, (renderedWidth - cropSize) / 2);
    const maxPanY = Math.max(0, (renderedHeight - cropSize) / 2);

    const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, pan.x));
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, pan.y));

    const cropWidthInNatural = cropSize / currentScale;
    const cropHeightInNatural = cropSize / currentScale;

    const centerXInNatural = (img.naturalWidth / 2) - (clampedPanX / currentScale);
    const centerYInNatural = (img.naturalHeight / 2) - (clampedPanY / currentScale);

    const sx = Math.max(0, Math.min(img.naturalWidth - cropWidthInNatural, centerXInNatural - cropWidthInNatural / 2));
    const sy = Math.max(0, Math.min(img.naturalHeight - cropHeightInNatural, centerYInNatural - cropHeightInNatural / 2));

    ctx.drawImage(
      img,
      sx,
      sy,
      cropWidthInNatural,
      cropHeightInNatural,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Lỗi xuất ảnh đã cắt'));
      },
      'image/webp',
      quality
    );
  });
};

// Tải ảnh lên Cloudinary qua unsigned upload.
export const uploadToCloudinary = async (fileOrBlob: Blob | File, folder = 'avatars'): Promise<string> => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;

  if (!cloudName || !uploadPreset) {
    throw new Error('Chưa cấu hình Cloudinary Cloud Name hoặc Upload Preset trong .env');
  }

  const formData = new FormData();
  formData.append('file', fileOrBlob);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.error?.message || 'Tải ảnh lên Cloudinary thất bại';
    throw new Error(message);
  }

  const data = await response.json();
  return data.secure_url;
};

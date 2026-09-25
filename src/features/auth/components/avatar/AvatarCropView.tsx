import type { PointerEvent as RPointerEvent, RefObject, WheelEvent as RWheelEvent } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarCropViewProps {
  imageSrc: string;
  imgRef: RefObject<HTMLImageElement | null>;
  renderedWidth: number;
  renderedHeight: number;
  pan: { x: number; y: number };
  cropSize: number;
  zoom: number;
  isDragging: boolean;
  isUploading: boolean;
  onWheelZoom: (e: RWheelEvent) => void;
  onPointerDown: (e: RPointerEvent) => void;
  onPointerMove: (e: RPointerEvent) => void;
  onPointerUp: (e: RPointerEvent) => void;
  onZoomChange: (zoom: number) => void;
}

// Màn hình cắt & căn chỉnh ảnh (kéo để căn góc, cuộn để phóng to).
export function AvatarCropView({
  imageSrc,
  imgRef,
  renderedWidth,
  renderedHeight,
  pan,
  cropSize,
  zoom,
  isDragging,
  isUploading,
  onWheelZoom,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onZoomChange,
}: AvatarCropViewProps) {
  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Viewport cắt ảnh */}
      <div
        style={{ width: cropSize, height: cropSize }}
        onWheel={onWheelZoom}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`relative rounded-full overflow-hidden ring-4 ring-primary/40 shadow-xl touch-none bg-black/80 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
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
          onClick={() => onZoomChange(zoom - 0.2)}
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
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          disabled={isUploading}
          aria-label="Mức phóng to"
          className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <button
          type="button"
          onClick={() => onZoomChange(zoom + 0.2)}
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
  );
}

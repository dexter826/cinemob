import { useEffect, useRef } from 'react';
import type {
  KeyboardEvent as RKeyboardEvent,
  PointerEvent as RPointerEvent,
  RefObject,
} from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '@/features/profile/constants/avatarEditor';

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
  /** Native wheel handler — được gắn non-passive để chặn scroll trang khi zoom. */
  onWheelZoom: (event: globalThis.WheelEvent) => void;
  onKeyboardPan: (dx: number, dy: number) => void;
  onPointerDown: (e: RPointerEvent) => void;
  onPointerMove: (e: RPointerEvent) => void;
  onPointerUp: (e: RPointerEvent) => void;
  onZoomChange: (zoom: number) => void;
}

const PAN_STEP_PX = 8;

// Màn hình cắt & căn chỉnh ảnh (kéo hoặc phím mũi tên để căn góc, cuộn/trượt để phóng to).
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
  onKeyboardPan,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onZoomChange,
}: AvatarCropViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // React gắn listener wheel ở chế độ passive nên preventDefault bị vô hiệu;
  // gắn trực tiếp listener non-passive để zoom bằng chuột không cuộn trang.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const handler = (event: WheelEvent) => onWheelZoom(event);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [onWheelZoom]);

  const handleViewportKeyDown = (event: RKeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-PAN_STEP_PX, 0],
      ArrowRight: [PAN_STEP_PX, 0],
      ArrowUp: [0, -PAN_STEP_PX],
      ArrowDown: [0, PAN_STEP_PX],
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    onKeyboardPan(step[0], step[1]);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Viewport cắt ảnh */}
      <div
        ref={viewportRef}
        role="application"
        aria-label="Vùng căn chỉnh ảnh. Dùng phím mũi tên để di chuyển ảnh."
        aria-describedby="avatar-crop-hint"
        tabIndex={isUploading ? -1 : 0}
        style={{ width: cropSize, height: cropSize }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={handleViewportKeyDown}
        className={`relative rounded-full overflow-hidden ring-4 ring-primary/40 shadow-xl touch-none bg-black/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
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
            userSelect: 'none',
          }}
        />
        {/* Lưới định tâm nhẹ nhàng */}
        <div className="absolute inset-0 pointer-events-none rounded-full border border-white/20" />
      </div>

      {/* Thanh điều khiển phóng to/thu nhỏ */}
      <div className="w-full mt-5 px-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onZoomChange(zoom - ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM || isUploading}
          aria-label="Thu nhỏ"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-30"
        >
          <ZoomOut size={16} aria-hidden="true" />
        </button>

        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          disabled={isUploading}
          aria-label="Mức phóng to"
          className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        <button
          type="button"
          onClick={() => onZoomChange(zoom + ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM || isUploading}
          aria-label="Phóng to"
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-30"
        >
          <ZoomIn size={16} aria-hidden="true" />
        </button>

        <span className="text-xs font-mono text-text-secondary w-9 text-right tabular-nums">
          {zoom.toFixed(1)}x
        </span>
      </div>

      <p id="avatar-crop-hint" className="text-[11px] text-text-secondary/70 mt-2 text-center">
        Kéo ảnh hoặc dùng phím mũi tên để căn góc, thanh trượt để phóng to
      </p>
    </div>
  );
}

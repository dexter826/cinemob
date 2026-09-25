import { Camera, Loader2, RotateCcw, Upload } from 'lucide-react';

interface AvatarPickViewProps {
  photoURL: string | null;
  displayInitial: string;
  isDragOver: boolean;
  isUploading: boolean;
  isReverting: boolean;
  canRevert: boolean;
  onPickClick: () => void;
  onDragStateChange: (over: boolean) => void;
  onDropFile: (file: File) => void;
  onRevert: () => void;
}

// Màn hình chọn ảnh đại diện (nhấp / kéo thả / dùng lại ảnh Google).
export function AvatarPickView({
  photoURL,
  displayInitial,
  isDragOver,
  isUploading,
  isReverting,
  canRevert,
  onPickClick,
  onDragStateChange,
  onDropFile,
  onRevert,
}: AvatarPickViewProps) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Chọn hoặc kéo thả ảnh đại diện mới"
        onClick={onPickClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPickClick();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragStateChange(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          onDragStateChange(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDragStateChange(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onDropFile(file);
        }}
        className={`relative w-36 h-36 rounded-full cursor-pointer select-none transition-all duration-200 outline-none group ${
          isDragOver
            ? 'ring-4 ring-primary scale-105 shadow-xl'
            : 'ring-2 ring-border-default hover:ring-primary/80 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-[0.98]'
        }`}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Ảnh đại diện"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-primary">
              {displayInitial}
            </span>
          )}
        </div>

        <div
          className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
            isDragOver
              ? 'bg-primary/80 text-white opacity-100 backdrop-blur-xs'
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 backdrop-blur-xs'
          }`}
        >
          {isDragOver ? (
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

        {canRevert && (
          <button
            type="button"
            onClick={onRevert}
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
  );
}

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
      <button
        type="button"
        aria-label="Chọn hoặc kéo thả ảnh đại diện mới"
        onClick={onPickClick}
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
        className={`relative w-36 h-36 rounded-full cursor-pointer select-none transition-colors group p-0 bg-transparent border-0 ${
          isDragOver
            ? 'ring-4 ring-primary'
            : 'ring-2 ring-border hover:ring-primary/80'
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
          aria-hidden="true"
          className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-opacity ${
            isDragOver
              ? 'bg-primary/80 text-white opacity-100'
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          }`}
        >
          {isDragOver ? (
            <>
              <Upload size={26} />
              <span className="text-xs font-semibold mt-1">Thả ảnh vào đây</span>
            </>
          ) : (
            <>
              <Camera size={24} />
              <span className="text-xs font-medium mt-1">Chọn ảnh</span>
            </>
          )}
        </div>
      </button>

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
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 border border-border transition-colors cursor-pointer disabled:opacity-50"
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

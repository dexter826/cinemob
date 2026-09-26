import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

interface AvatarPickViewProps {
  photoURL: string | null;
  displayInitial: string;
  isDragOver: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  canDelete: boolean;
  onPickClick: () => void;
  onDragStateChange: (over: boolean) => void;
  onDropFile: (file: File) => void;
  onDelete: () => void;
}

// Quản lý ảnh đại diện qua menu hành động.
export function AvatarPickView({
  photoURL,
  displayInitial,
  isDragOver,
  isUploading,
  isDeleting,
  canDelete,
  onPickClick,
  onDragStateChange,
  onDropFile,
  onDelete,
}: AvatarPickViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleAvatarClick = () => {
    if (isUploading || isDeleting) return;
    if (canDelete) {
      setIsMenuOpen((prev) => !prev);
    } else {
      onPickClick();
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          aria-label={canDelete ? 'Tùy chọn ảnh đại diện' : 'Chọn ảnh đại diện'}
          aria-haspopup={canDelete ? 'menu' : undefined}
          aria-expanded={canDelete ? isMenuOpen : undefined}
          onClick={handleAvatarClick}
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
          className={`relative group w-36 h-36 rounded-full cursor-pointer select-none transition-all p-0 bg-transparent border-0 overflow-hidden ${
            isDragOver
              ? 'ring-4 ring-primary scale-[1.02]'
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
            className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-opacity backdrop-blur-[1px] ${
              isDragOver
                ? 'bg-primary/85 text-white opacity-100'
                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
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
                <span className="text-xs font-medium mt-1">Thay đổi ảnh</span>
              </>
            )}
          </div>
        </button>

        <button
          type="button"
          aria-label={canDelete ? 'Tùy chọn ảnh đại diện' : 'Tải ảnh lên'}
          aria-haspopup={canDelete ? 'menu' : undefined}
          aria-expanded={canDelete ? isMenuOpen : undefined}
          onClick={handleAvatarClick}
          disabled={isUploading || isDeleting}
          className="absolute bottom-1 right-1 p-2.5 rounded-full bg-surface-elevated text-text-primary border border-border shadow-elevated hover:bg-primary hover:text-on-primary hover:border-primary transition-all cursor-pointer disabled:opacity-50"
        >
          <Camera size={16} />
        </button>
      </div>

      <div className="w-full min-h-[82px] mt-3.5 flex flex-col items-center justify-center">
        {isMenuOpen ? (
          <div
            role="menu"
            className="w-full max-w-[210px] py-1 bg-surface-elevated rounded-2xl border border-border shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onPickClick();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <Upload size={14} className="text-primary shrink-0" />
              <span>Tải ảnh mới</span>
            </button>

            {canDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                disabled={isDeleting}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer border-t border-border/50"
              >
                <Trash2 size={14} className="shrink-0" />
                <span>Xóa ảnh</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-text-secondary font-medium">
              Nhấp vào ảnh để thay đổi
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Hỗ trợ JPG, PNG, WEBP · Tối đa 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




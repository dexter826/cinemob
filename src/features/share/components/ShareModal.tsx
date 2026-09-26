import { useState } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, Globe, ShieldAlert } from 'lucide-react';
import { useShare } from '@/features/share/hooks/useShare';
import { Dialog, DialogBody } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Short dialog managing the public library link. Snapshot behavior unchanged. */
function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, refreshSnapshot, copyLink } = useShare();
  const [copied, setCopied] = useState(false);
  const busy = loading || syncing;

  const handleCopy = async () => {
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      titleId="share-modal-title"
      descriptionId="share-modal-description"
      presentation="dialog"
    >
      <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div>
            <h2 id="share-modal-title" className="text-base sm:text-lg font-bold text-text-primary tracking-tight truncate font-display">Chia sẻ thư viện</h2>
            <p id="share-modal-description" className="text-xs text-text-secondary truncate">Quản lý link xem công khai bộ sưu tập</p>
          </div>
        </div>
        <IconButton label="Đóng hộp thoại chia sẻ" onClick={onClose} variant="ghost">
          <span aria-hidden="true" className="text-lg leading-none">×</span>
        </IconButton>
      </div>

      <DialogBody>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-card bg-black/5 dark:bg-white/5 border border-border">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-text-primary">Trạng thái chia sẻ</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    isEnabled
                      ? 'text-success border-success/30 bg-success/10'
                      : 'text-text-secondary border-border bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-success' : 'bg-text-secondary'}`} />
                  {isEnabled ? 'Đang bật' : 'Đang tắt'}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-tight">
                {loading ? 'Đang tải trạng thái…' : isEnabled ? 'Bất kỳ ai có đường link đều có thể xem' : 'Chỉ mình bạn xem được thư viện này'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              disabled={busy}
              onClick={toggleShare}
              className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                isEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
              aria-label="Bật hoặc tắt chia sẻ công khai"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isEnabled ? (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="share-public-url" className="block text-xs font-medium text-text-secondary mb-1.5 sm:mb-2">
                  Đường dẫn công khai
                </label>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-border rounded-card p-1.5 sm:p-2 pl-2.5 sm:pl-3">
                  <Globe size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <input
                    id="share-public-url"
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-text-primary focus:outline-none truncate select-all"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopy}
                    disabled={busy}
                    aria-label={copied ? 'Đã sao chép đường dẫn' : 'Sao chép đường dẫn chia sẻ'}
                    leadingIcon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  >
                    {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-control border border-border text-xs sm:text-sm font-semibold text-text-primary hover:border-primary/50 hover:text-primary transition-colors text-center"
                >
                  <ExternalLink size={15} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">Xem thử trang chia sẻ</span>
                </a>

                <Button
                  variant="secondary"
                  onClick={refreshSnapshot}
                  disabled={busy}
                  loading={syncing}
                  leadingIcon={<RefreshCw size={15} className={`shrink-0 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />}
                >
                  {syncing ? 'Đang đồng bộ…' : 'Cập nhật dữ liệu mới'}
                </Button>
              </div>

              {lastUpdated && (
                <p className="text-xs text-text-secondary text-center pt-0.5">
                  Dữ liệu công khai cập nhật lúc: {lastUpdated.toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-card bg-warning/5 border border-warning/20 flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-text-primary">Chưa bật chia sẻ</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Khi bật, hệ thống sẽ tạo một bản snapshot công khai chứa danh sách phim bạn đã xem. Bạn có thể tắt tính năng bất cứ lúc nào để ngắt quyền truy cập.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogBody>

      <div className="flex justify-end p-3.5 sm:p-4 border-t border-border shrink-0">
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Dialog>
  );
}

export default ShareModal;

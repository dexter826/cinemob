import { useState } from 'react';
import { Check, Copy, Link2, ShieldAlert } from 'lucide-react';
import { useShare } from '@/features/share/hooks/useShare';
import { Dialog, DialogBody, DialogHeader } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Dialog managing the public library link. */
function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, copyLink } = useShare(isOpen);
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
      <DialogHeader
        titleId="share-modal-title"
        title="Chia sẻ thư viện"
        descriptionId="share-modal-description"
        description="Chia sẻ danh sách phim đã xem qua một đường link."
        onClose={onClose}
      />

      <DialogBody className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">Chia sẻ công khai</p>
              <p className="text-xs text-text-secondary mt-1">
                {loading ? 'Đang kiểm tra trạng thái…' : isEnabled ? 'Ai có đường link đều có thể xem' : 'Link đang tắt'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`text-xs font-semibold ${isEnabled ? 'text-success' : 'text-text-secondary'}`}>
                {isEnabled ? 'Đang bật' : 'Đang tắt'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                disabled={busy}
                onClick={toggleShare}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
                aria-label="Bật hoặc tắt chia sẻ công khai"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {isEnabled ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="share-public-url" className="text-sm font-semibold text-text-primary">
                    Link chia sẻ
                  </label>
                  {lastUpdated && (
                    <span className="text-[11px] text-text-secondary text-right">
                      Cập nhật gần nhất {lastUpdated.toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-control border border-border bg-black/5 dark:bg-white/5 p-1.5 pl-3">
                  <Link2 size={16} className="text-text-secondary shrink-0" aria-hidden="true" />
                  <input
                    id="share-public-url"
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-text-primary focus:outline-none truncate select-all"
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
            </div>
          ) : (
            <div className="flex items-start gap-3 pt-1">
              <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Link đang tắt</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Bật chia sẻ để tạo link công khai cho danh sách phim đã xem.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
}

export default ShareModal;

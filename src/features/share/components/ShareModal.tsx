import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, RefreshCw, Globe, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShare } from '@/features/share/hooks/useShare';
import { usePreventScroll } from '@/shared/hooks/usePreventScroll';
import { MODAL_VARIANTS, OVERLAY_VARIANTS } from '@/constants';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Modal quản lý và chia sẻ thư viện phim ra link công khai */
const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  usePreventScroll(isOpen);
  const { isEnabled, loading, syncing, shareUrl, lastUpdated, toggleShare, refreshSnapshot, copyLink } = useShare();
  const [copied, setCopied] = useState(false);
  const busy = loading || syncing;

  const handleCopy = async () => {
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75"
          onClick={onClose}
        >
          <motion.div
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface border border-border-default rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Share2 size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-text-main tracking-tight truncate font-display">Chia sẻ thư viện</h2>
                  <p className="text-xs text-text-muted truncate">Quản lý link xem công khai bộ sưu tập</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer text-text-muted shrink-0"
                aria-label="Đóng modal"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto custom-scrollbar">
              {/* Toggle Switch Card */}
              <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 border border-border-default">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-text-main">Trạng thái chia sẻ</span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        isEnabled
                          ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-text-muted border-border-default bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                      {isEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-tight">
                    {loading ? 'Đang tải trạng thái…' : isEnabled ? 'Bất kỳ ai có đường link đều có thể xem' : 'Chỉ mình bạn xem được thư viện này'}
                  </p>
                </div>

                {/* Switch Button */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={busy}
                  onClick={toggleShare}
                  className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnabled ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                  aria-label="Bật hoặc tắt chia sẻ công khai"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Link Section */}
              {isEnabled ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5 sm:mb-2">
                      Đường dẫn công khai
                    </label>
                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-border-default rounded-xl sm:rounded-2xl p-1.5 sm:p-2 pl-2.5 sm:pl-3">
                      <Globe size={16} className="text-primary shrink-0" />
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-text-main focus:outline-none truncate select-all"
                      />
                      <button
                        onClick={handleCopy}
                        disabled={busy}
                        aria-label={copied ? "Đã sao chép đường dẫn" : "Sao chép đường dẫn chia sẻ"}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shrink-0 active:scale-95"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        <span className="hidden xs:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                        <span className="xs:hidden">{copied ? 'Đã chép' : 'Chép'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons Grid for Mobile & Desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-border-default text-xs sm:text-sm font-semibold text-text-main hover:border-primary/50 hover:text-primary transition-colors text-center active:scale-[0.98]"
                    >
                      <ExternalLink size={15} className="shrink-0" />
                      <span className="truncate">Xem thử trang chia sẻ</span>
                    </a>

                    <button
                      onClick={refreshSnapshot}
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-2xl border border-border-default text-xs sm:text-sm font-semibold text-text-main hover:border-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center active:scale-[0.98]"
                    >
                      <RefreshCw size={15} className={`shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                      <span className="truncate">{syncing ? 'Đang đồng bộ…' : 'Cập nhật dữ liệu mới'}</span>
                    </button>
                  </div>

                  {lastUpdated && (
                    <p className="text-xs text-text-muted text-center pt-0.5">
                      Dữ liệu công khai cập nhật lúc: {lastUpdated.toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 sm:gap-3">
                  <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-text-main">Chưa bật chia sẻ</p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Khi bật, hệ thống sẽ tạo một bản snapshot công khai chứa danh sách phim bạn đã xem. Bạn có thể tắt tính năng bất cứ lúc nào để ngắt quyền truy cập.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-3.5 sm:p-4 border-t border-border-default bg-surface/50 backdrop-blur-md shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 sm:py-2.5 rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;

import { useCallback, useEffect, useId, useState, type ComponentType } from 'react';
import { Dialog, DialogHeader, DialogBody, type DialogSize } from './dialog';
import Loading from './loading';
import ErrorState from './error-state';
import ErrorBoundary from '../feedback/error-boundary';
interface LazyDialogProps<P extends object> {
  open: boolean;
  onClose: () => void;
  title: string;
  loader: () => Promise<{ default: ComponentType<P> }>;
  componentProps: P;
  size?: DialogSize;
  presentation?: 'dialog' | 'sheet' | 'fullscreen-mobile';
}
/** Nạp code dialog theo nhu cầu; luôn giữ fallback có thể đóng trong lúc chờ. */
export default function LazyDialog<P extends object>({
  open,
  onClose,
  title,
  loader,
  componentProps,
  size,
  presentation,
}: LazyDialogProps<P>) {
  const titleId = useId();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{
    loader: typeof loader;
    Component: ComponentType<P>;
  } | null>(null);
  const [error, setError] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  useEffect(() => {
    if (open) setShouldRender(true);
  }, [open]);
  useEffect(() => {
    if (!open || loaded?.loader === loader) return;
    let cancelled = false;
    setError(false);
    loader()
      .then(({ default: Component }) => {
        if (!cancelled) setLoaded({ loader, Component });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, loader, loaded, attempt]);
  const handleExited = useCallback(() => setShouldRender(false), []);
  if (!shouldRender && !open) return null;
  const retry = () => {
    setLoaded(null);
    setError(false);
    setAttempt((n) => n + 1);
  };
  const shell = (failed: boolean) => (
    <Dialog
      open={open}
      onClose={onClose}
      titleId={titleId}
      size={size}
      presentation={presentation}
      onExitComplete={handleExited}
    >
      <DialogHeader titleId={titleId} title={title} onClose={onClose} />
      <DialogBody>
        {failed ? (
          <ErrorState
            title="Không mở được hộp thoại"
            description="Thử lại hoặc đóng hộp thoại."
            retry={{ label: 'Thử lại', onClick: retry }}
            compact
          />
        ) : (
          <Loading text="Đang mở hộp thoại…" />
        )}
      </DialogBody>
    </Dialog>
  );
  if (loaded?.loader !== loader) return shell(error);
  const WithExit = loaded.Component as ComponentType<P & { onExited?: () => void }>;
  return (
    <ErrorBoundary key={attempt} fallback={shell(true)}>
      <WithExit {...componentProps} onExited={handleExited} />
    </ErrorBoundary>
  );
}

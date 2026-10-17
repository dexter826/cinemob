import { useEffect, useId, useState, type ComponentType } from 'react';
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
/** Loads dialog code on demand, while keeping a closeable fallback visible. */
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
  if (!open) return null;
  const retry = () => {
    setLoaded(null);
    setError(false);
    setAttempt((n) => n + 1);
  };
  const shell = (failed: boolean) => (
    <Dialog open onClose={onClose} titleId={titleId} size={size} presentation={presentation}>
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
  const Component = loaded.Component;
  return (
    <ErrorBoundary key={attempt} fallback={shell(true)}>
      <Component {...componentProps} />
    </ErrorBoundary>
  );
}

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Chặn crash render lan toàn app, tránh trắng trang khi 1 page/modal lỗi.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error('ErrorBoundary caught:', error);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-lg font-bold">Đã xảy ra lỗi hiển thị</p>
          <p className="text-sm text-text-muted">Thử tải lại trang hoặc quay về trang chủ.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="rounded-lg border border-border-default px-4 py-2 text-sm font-bold"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

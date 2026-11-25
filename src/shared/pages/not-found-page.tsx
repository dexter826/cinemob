import { ButtonLink } from '@/shared/components/ui';

function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
      <p
        className="text-display-404 leading-none text-text-primary tabular-nums"
        aria-hidden="true"
      >
        4<span className="text-primary">0</span>4
      </p>
      <h1 className="mt-4 text-title-md text-text-primary">Không tìm thấy trang yêu cầu</h1>
      <p className="mt-2 text-body text-text-secondary max-w-md mx-auto">
        Địa chỉ bạn truy cập không tồn tại hoặc đã được chuyển sang đường dẫn khác.
      </p>
      <div className="mt-8 flex justify-center">
        <ButtonLink to="/" variant="secondary" size="md">
          Về Thư viện
        </ButtonLink>
      </div>
    </div>
  );
}

export default NotFoundPage;

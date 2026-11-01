import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
      <p className="text-display-404 leading-none text-text-primary tabular-nums" aria-hidden="true">
        4<span className="text-primary">0</span>4
      </p>
      <h1 className="mt-4 text-title-md text-text-primary">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="mt-2 text-body text-text-secondary max-w-md mx-auto">
        Địa chỉ bạn truy cập không tồn tại hoặc đã được chuyển sang đường dẫn khác.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center font-semibold cursor-pointer transition px-4 py-2.5 text-body-sm gap-2 rounded-control bg-transparent text-text-primary border border-border hover:border-primary hover:text-primary focus-ring focus-visible:outline-none"
        >
          Về Thư viện
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

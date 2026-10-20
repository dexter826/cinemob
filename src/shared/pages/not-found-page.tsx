import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
      <p className="text-display-404 leading-none text-text-primary tabular-nums">
        4<span className="text-primary">0</span>4
      </p>
      <p className="mt-4 text-label-caps text-text-secondary">
        Không tìm thấy trang — đường link sai hoặc không còn tồn tại
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center font-semibold cursor-pointer transition px-4 py-2.5 text-body-sm gap-2 rounded-control bg-transparent text-text-primary border border-border hover:border-primary hover:text-primary"
        >
          Về Thư viện
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

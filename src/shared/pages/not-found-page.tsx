import { Link } from 'react-router-dom';
import Button from '@/shared/components/ui/button';

// Trang báo khi đường link sai hoặc không còn tồn tại — editorial.
function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
      <p className="font-display leading-none text-7xl md:text-9xl text-text-primary tabular-nums">
        4<span className="text-primary">0</span>4
      </p>
      <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-text-secondary">
        Không tìm thấy trang — đường link sai hoặc không còn tồn tại
      </p>
      <div className="mt-8 flex justify-center">
        <Link to="/">
          <Button variant="secondary">Về Thư viện</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

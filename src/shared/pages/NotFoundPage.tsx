import { Link2Off } from 'lucide-react';
import EmptyState from '@/shared/components/ui/EmptyState';

// Trang báo khi đường link sai hoặc không còn tồn tại.
function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
      <EmptyState
        icon={Link2Off}
        title="Không tìm thấy trang"
        description="Đường link sai hoặc không còn tồn tại."
        action={{ label: 'Về trang chủ', to: '/' }}
      />
    </div>
  );
}

export default NotFoundPage;

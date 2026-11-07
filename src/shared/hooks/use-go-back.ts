import { useNavigate } from 'react-router-dom';

/**
 * Quay lại trang trước nếu còn lịch sử điều hướng trong app; không thì về Thư viện.
 * Tránh nút "về" chết hoặc thoát hẳn site khi mở thẳng deep-link.
 */
export function useGoBackOrHome() {
  const navigate = useNavigate();
  return () => {
    // react-router (BrowserRouter) ghi vị trí hiện tại vào history.state.idx.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };
}

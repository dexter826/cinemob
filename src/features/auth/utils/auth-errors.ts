import { MESSAGES } from '@/constants/messages';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/incorrect-current-password': 'Mật khẩu hiện tại chưa đúng. Nhập lại mật khẩu rồi thử lại.',
  'auth/google-email-mismatch':
    'Email Google không trùng email tài khoản. Chọn tài khoản Google có cùng email để kết nối.',
  'auth/user-mismatch':
    'Tài khoản không khớp với phiên hiện tại. Đăng nhập lại đúng tài khoản rồi thử lại.',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập. Mở lại để tiếp tục.',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy. Thử lại với một cửa sổ đăng nhập.',
  'auth/popup-blocked':
    'Trình duyệt đã chặn cửa sổ đăng nhập. Cho phép cửa sổ bật lên rồi thử lại.',
  'auth/requires-recent-login': 'Phiên đăng nhập cần được xác thực lại. Đăng nhập lại để tiếp tục.',
  'auth/provider-already-linked': 'Phương thức này đã được liên kết. Tải lại trang để cập nhật.',
  'auth/credential-already-in-use':
    'Phương thức này đã thuộc tài khoản khác. Đăng nhập đúng tài khoản rồi thử lại.',
  'auth/invalid-user-token': 'Phiên đăng nhập đã hết hạn. Đăng xuất rồi đăng nhập lại.',
  'auth/user-token-expired': 'Phiên đăng nhập đã hết hạn. Đăng xuất rồi đăng nhập lại.',
  'auth/email-already-in-use':
    'Không tạo được tài khoản với email này. Thử đăng nhập hoặc đặt lại mật khẩu.',
  'auth/weak-password': 'Mật khẩu cần tối thiểu 8 ký tự, bao gồm chữ và số.',
  'auth/password-does-not-meet-requirements':
    'Mật khẩu chưa đáp ứng yêu cầu bảo mật. Chọn mật khẩu mạnh hơn rồi thử lại.',
  'auth/invalid-email': 'Email chưa đúng định dạng. Kiểm tra lại địa chỉ email.',
  'auth/invalid-credential':
    'Email hoặc mật khẩu chưa đúng. Kiểm tra lại, hoặc tiếp tục với Google nếu bạn đã đăng ký bằng Google.',
  'auth/wrong-password':
    'Email hoặc mật khẩu chưa đúng. Kiểm tra lại, hoặc tiếp tục với Google nếu bạn đã đăng ký bằng Google.',
  'auth/user-not-found':
    'Email hoặc mật khẩu chưa đúng. Kiểm tra lại, hoặc tiếp tục với Google nếu bạn đã đăng ký bằng Google.',
  'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Chờ vài phút rồi thử lại.',
  'auth/network-request-failed':
    'Không kết nối được do mất mạng. Kiểm tra đường truyền rồi thử lại.',
  'auth/user-disabled': 'Tài khoản này đã bị khóa. Liên hệ hỗ trợ để biết thêm.',
  'auth/operation-not-allowed':
    'Phương thức đăng nhập này chưa được bật. Thử lại bằng Google hoặc liên hệ hỗ trợ.',
};

export const getAuthErrorMessage = (
  error: unknown,
  fallback: string = MESSAGES.AUTH.LOGIN_ERROR,
): string => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';
  return AUTH_ERROR_MESSAGES[code] ?? fallback;
};

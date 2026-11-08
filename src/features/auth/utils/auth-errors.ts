import { MESSAGES } from '@/constants/messages';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
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

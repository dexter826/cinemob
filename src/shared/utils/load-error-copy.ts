import { MESSAGES } from '@/constants/messages';

/** Mô tả lỗi tải dữ liệu: thiết bị mất mạng thì ưu tiên báo ngoại tuyến. */
export const loadErrorCopy = (fallback: string): string =>
  navigator.onLine ? fallback : MESSAGES.COMMON.OFFLINE_STATUS;

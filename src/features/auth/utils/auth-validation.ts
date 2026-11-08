export const PASSWORD_HINT = 'Mật khẩu cần tối thiểu 8 ký tự, bao gồm chữ và số.';

export const validatePassword = (password: string): string | undefined =>
  password.length >= 8 && /\p{L}/u.test(password) && /[0-9]/.test(password)
    ? undefined
    : PASSWORD_HINT;

export const validateEmail = (email: string): string | undefined =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? undefined
    : 'Email chưa đúng định dạng. Kiểm tra lại địa chỉ email.';

export const validatePasswordConfirmation = (
  password: string,
  confirmation: string,
): string | undefined => (password === confirmation ? undefined : 'Mật khẩu nhập lại chưa khớp.');

export const sameAccountEmail = (
  first: string | null | undefined,
  second: string | null | undefined,
): boolean => !!first && !!second && first.trim().toLowerCase() === second.trim().toLowerCase();

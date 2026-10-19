export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

// bcrypt hanya memakai 72 byte pertama, jadi dibatasi 72 karakter.
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const PASSWORD_MESSAGE = 'password harus mengandung huruf dan angka';

// ============================================================
// Validasi input form
// ============================================================
export const validator = {
  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  minLength(value, len) {
    return typeof value === 'string' && value.length >= len;
  },
  isRequired(value) {
    return value !== undefined && value !== null && String(value).trim() !== '';
  },
  validateRegister({ email, password, name }) {
    if (!this.isRequired(name))     return 'Nama wajib diisi';
    if (!this.isEmail(email))       return 'Format email tidak valid';
    if (!this.minLength(password, 6)) return 'Password minimal 6 karakter';
    return null;
  },
  validateLogin({ email, password }) {
    if (!this.isEmail(email))       return 'Format email tidak valid';
    if (!this.minLength(password, 6)) return 'Password minimal 6 karakter';
    return null;
  },
};
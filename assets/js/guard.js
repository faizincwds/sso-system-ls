// ============================================================
// Route guard reusable
// Bisa di-import sebagai module di halaman yang butuh proteksi
// ============================================================
import { authService } from './services/authService.js';

export function requireAuth() {
  if (!authService.isLoggedIn()) {
    const redirect = encodeURIComponent(location.pathname);
    location.href = `./index.html?redirect=${redirect}`;
    return false;
  }
  return true;
}

export function requireGuest() {
  if (authService.isLoggedIn()) {
    location.href = './dashboard.html';
    return false;
  }
  return true;
}
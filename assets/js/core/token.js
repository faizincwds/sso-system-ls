// ============================================================
// Generate & verify token sederhana (base64 payload)
// Saat migrasi ke backend, ganti dengan JWT dari server
// ============================================================
import { CONFIG } from '../config/constants.js';

export function generateToken(userId) {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + CONFIG.SESSION_TTL,
    nonce: crypto.randomUUID(),
  };
  return btoa(JSON.stringify(payload));
}

export function verifyToken(token) {
  try {
    const payload = JSON.parse(atob(token));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}
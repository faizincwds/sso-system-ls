// ============================================================
// ⚠️ FILE INI AKAN DIGANTI SAAT MIGRASI KE MySQL
// Saat migrasi: ganti body dengan fetch() ke /api/*
// Kontrak method (get/set/remove) harus tetap sama.
// ============================================================
import { CONFIG } from '../config/constants.js';

export const KEYS = CONFIG.STORAGE_KEYS;

export const storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
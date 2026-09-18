// ============================================================
// Activity Log Service — catat semua aksi user
// Fase 1: localStorage. Fase 2: ganti ke API /activities
// ============================================================
import { storage, KEYS } from '../core/storage.js';
import { getBrowserInfo, fakeIp, fakeLocation } from '../utils/device.js';

// ---------- Jenis aktivitas ----------
export const ACTIVITY_TYPES = {
  LOGIN:              'login',
  LOGOUT:             'logout',
  PROFILE_UPDATE:     'profile_update',
  PASSWORD_CHANGE:    'password_change',
  APP_CONNECT:        'app_connect',
  APP_DISCONNECT:     'app_disconnect',
  APP_OPEN:           'app_open',
  DEVICE_REVOKE:      'device_revoke',
  DEVICE_REVOKE_ALL:  'device_revoke_all',
  HISTORY_CLEAR:      'history_clear',
  ACTIVITY_CLEAR:     'activity_clear',
};

// ---------- Kategori (untuk filter) ----------
export const ACTIVITY_CATEGORIES = {
  SECURITY: 'security',   // login, logout, password, device
  ACCOUNT:  'account',    // profile
  APPS:     'apps',       // connect, disconnect, open
  SYSTEM:   'system',     // clear logs
};

const TYPE_META = {
  [ACTIVITY_TYPES.LOGIN]:             { icon: '🟢', label: 'Login berhasil',              category: ACTIVITY_CATEGORIES.SECURITY, color: 'green'  },
  [ACTIVITY_TYPES.LOGOUT]:            { icon: '🚪', label: 'Logout',                       category: ACTIVITY_CATEGORIES.SECURITY, color: 'slate'  },
  [ACTIVITY_TYPES.PROFILE_UPDATE]:    { icon: '👤', label: 'Perbarui profil',              category: ACTIVITY_CATEGORIES.ACCOUNT,  color: 'blue'   },
  [ACTIVITY_TYPES.PASSWORD_CHANGE]:   { icon: '🔒', label: 'Ubah password',                category: ACTIVITY_CATEGORIES.SECURITY, color: 'amber'  },
  [ACTIVITY_TYPES.APP_CONNECT]:       { icon: '🔌', label: 'Hubungkan aplikasi',           category: ACTIVITY_CATEGORIES.APPS,     color: 'green'  },
  [ACTIVITY_TYPES.APP_DISCONNECT]:    { icon: '⛔', label: 'Cabut akses aplikasi',         category: ACTIVITY_CATEGORIES.APPS,     color: 'red'    },
  [ACTIVITY_TYPES.APP_OPEN]:          { icon: '📱', label: 'Buka aplikasi',                category: ACTIVITY_CATEGORIES.APPS,     color: 'blue'   },
  [ACTIVITY_TYPES.DEVICE_REVOKE]:     { icon: '💻', label: 'Logout perangkat',             category: ACTIVITY_CATEGORIES.SECURITY, color: 'red'    },
  [ACTIVITY_TYPES.DEVICE_REVOKE_ALL]: { icon: '🧹', label: 'Logout semua perangkat lain',   category: ACTIVITY_CATEGORIES.SECURITY, color: 'red'    },
  [ACTIVITY_TYPES.HISTORY_CLEAR]:     { icon: '🗑️', label: 'Hapus riwayat login',          category: ACTIVITY_CATEGORIES.SYSTEM,   color: 'slate'  },
  [ACTIVITY_TYPES.ACTIVITY_CLEAR]:    { icon: '🗑️', label: 'Hapus riwayat aktivitas',      category: ACTIVITY_CATEGORIES.SYSTEM,   color: 'slate'  },
};

export const activityService = {
  /**
   * Catat aktivitas baru.
   * @param {string} userId
   * @param {string} type    - salah satu ACTIVITY_TYPES
   * @param {object} payload - { description?, metadata? }
   */
  log(userId, type, payload = {}) {
    if (!userId || !type) return null;

    const all = storage.get(KEYS.ACTIVITY_LOG) || [];
    const info = getBrowserInfo();
    const meta = TYPE_META[type] || { icon: '•', label: type, category: 'system', color: 'slate' };

    const entry = {
      id: crypto.randomUUID(),
      userId,
      type,
      category: meta.category,
      icon: meta.icon,
      label: payload.description || meta.label,
      metadata: payload.metadata || {},
      device: info.name,
      browser: info.browser,
      os: info.os,
      ip: fakeIp(),
      location: fakeLocation(),
      timestamp: Date.now(),
    };

    storage.set(KEYS.ACTIVITY_LOG, [entry, ...all].slice(0, 500)); // max 500
    return entry;
  },

  /**
   * Ambil semua aktivitas user, urut dari yang terbaru.
   */
  list(userId) {
    const all = storage.get(KEYS.ACTIVITY_LOG) || [];
    return all
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Ringkasan statistik aktivitas.
   */
  stats(userId) {
    const list = this.list(userId);
    const byCategory = {
      security: list.filter((a) => a.category === ACTIVITY_CATEGORIES.SECURITY).length,
      account:  list.filter((a) => a.category === ACTIVITY_CATEGORIES.ACCOUNT).length,
      apps:     list.filter((a) => a.category === ACTIVITY_CATEGORIES.APPS).length,
      system:   list.filter((a) => a.category === ACTIVITY_CATEGORIES.SYSTEM).length,
    };
    return {
      total: list.length,
      byCategory,
      lastActivity: list[0]?.timestamp || null,
    };
  },

  /**
   * Hapus semua aktivitas user.
   */
  clear(userId) {
    const all = storage.get(KEYS.ACTIVITY_LOG) || [];
    storage.set(KEYS.ACTIVITY_LOG, all.filter((a) => a.userId !== userId));
  },

  /**
   * Helper: ambil meta untuk ditampilkan di UI.
   */
  getTypeMeta(type) {
    return TYPE_META[type] || { icon: '•', label: type, category: 'system', color: 'slate' };
  },

  getCategories() {
    return [
      { id: 'all',      label: 'Semua',    icon: '📋' },
      { id: 'security', label: 'Keamanan', icon: '🔐' },
      { id: 'account',  label: 'Akun',     icon: '👤' },
      { id: 'apps',     label: 'Aplikasi', icon: '🔌' },
      { id: 'system',   label: 'Sistem',   icon: '⚙️' },
    ];
  },
};
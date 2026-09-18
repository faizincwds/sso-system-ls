import { storage, KEYS } from '../core/storage.js';

// Daftar aplikasi yang terdaftar di SSO (mirip tabel `apps` di MySQL)
export const REGISTERED_APPS = [
  { id: 'app-a', name: 'App A', description: 'Contoh aplikasi klien', color: 'blue',   icon: '📊', url: './../apps/app-a.html' },
  { id: 'app-b', name: 'App B', description: 'Contoh aplikasi klien', color: 'green',  icon: '📈', url: './../apps/app-b.html' },
];

export const appService = {
  getApps() {
    return REGISTERED_APPS;
  },

  getApp(appId) {
    return REGISTERED_APPS.find((a) => a.id === appId) || null;
  },

  // Daftar app yang user sudah connect
  getUserApps(userId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    return all
      .filter((c) => c.userId === userId)
      .map((c) => ({ ...c, app: this.getApp(c.appId) }))
      .sort((a, b) => b.lastAccess - a.lastAccess);
  },

  isConnected(userId, appId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    return all.some((c) => c.userId === userId && c.appId === appId);
  },

  // Dipanggil saat user pertama kali membuka app
  connect(userId, appId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    const existing = all.find((c) => c.userId === userId && c.appId === appId);
    if (existing) {
      existing.lastAccess = Date.now();
      storage.set(KEYS.CONNECTED_APPS, all);
      return existing;
    }
    const entry = {
      id: crypto.randomUUID(),
      userId,
      appId,
      connectedAt: Date.now(),
      lastAccess: Date.now(),
      scopes: ['profile', 'email'],
    };
    storage.set(KEYS.CONNECTED_APPS, [...all, entry]);
    return entry;
  },

  touch(userId, appId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    const found = all.find((c) => c.userId === userId && c.appId === appId);
    if (found) {
      found.lastAccess = Date.now();
      storage.set(KEYS.CONNECTED_APPS, all);
    }
  },

  disconnect(userId, appId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    storage.set(
      KEYS.CONNECTED_APPS,
      all.filter((c) => !(c.userId === userId && c.appId === appId))
    );
  },

  disconnectAll(userId) {
    const all = storage.get(KEYS.CONNECTED_APPS) || [];
    storage.set(KEYS.CONNECTED_APPS, all.filter((c) => c.userId !== userId));
  },
};
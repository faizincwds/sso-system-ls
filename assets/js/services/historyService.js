import { storage, KEYS } from '../core/storage.js';
import { getBrowserInfo, fakeIp, fakeLocation, getDeviceId } from '../utils/device.js';

export const historyService = {
  add({ userId, email, status }) {
    const all = storage.get(KEYS.LOGIN_HISTORY) || [];
    const info = getBrowserInfo();
    const entry = {
      id: crypto.randomUUID(),
      userId: userId || null,
      email,
      status, // 'success' | 'failed'
      deviceId: getDeviceId(),
      device: info.name,
      browser: info.browser,
      os: info.os,
      ip: fakeIp(),
      location: fakeLocation(),
      timestamp: Date.now(),
    };
    storage.set(KEYS.LOGIN_HISTORY, [entry, ...all].slice(0, 200)); // max 200
    return entry;
  },

  getUserHistory(userId) {
    const all = storage.get(KEYS.LOGIN_HISTORY) || [];
    return all.filter((h) => h.userId === userId);
  },

  getStats(userId) {
    const list = this.getUserHistory(userId);
    const success = list.filter((h) => h.status === 'success').length;
    const failed  = list.filter((h) => h.status === 'failed').length;
    const lastSuccess = list.find((h) => h.status === 'success');
    return { total: list.length, success, failed, lastLogin: lastSuccess?.timestamp || null };
  },

  clearUserHistory(userId) {
    const all = storage.get(KEYS.LOGIN_HISTORY) || [];
    storage.set(KEYS.LOGIN_HISTORY, all.filter((h) => h.userId !== userId));
  },
};
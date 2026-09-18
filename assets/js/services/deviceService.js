import { storage, KEYS } from '../core/storage.js';
import { getBrowserInfo, fakeIp, fakeLocation, getDeviceId } from '../utils/device.js';

export const deviceService = {
  // Dipanggil saat login sukses
  register(userId) {
    const all = storage.get(KEYS.DEVICES) || [];
    const deviceId = getDeviceId();
    const info = getBrowserInfo();

    const existing = all.find((d) => d.deviceId === deviceId && d.userId === userId);
    if (existing) {
      existing.lastActive = Date.now();
      existing.createdAt = existing.createdAt || Date.now();
      storage.set(KEYS.DEVICES, all);
      return existing;
    }

    const device = {
      id: crypto.randomUUID(),
      deviceId,
      userId,
      name: info.name,
      browser: info.browser,
      os: info.os,
      ip: fakeIp(),
      location: fakeLocation(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    storage.set(KEYS.DEVICES, [...all, device]);
    return device;
  },

  getUserDevices(userId) {
    const all = storage.get(KEYS.DEVICES) || [];
    const currentId = getDeviceId();
    return all
      .filter((d) => d.userId === userId)
      .map((d) => ({ ...d, current: d.deviceId === currentId }))
      .sort((a, b) => b.lastActive - a.lastActive);
  },

  touchCurrent(userId) {
    const all = storage.get(KEYS.DEVICES) || [];
    const currentId = getDeviceId();
    let changed = false;
    for (const d of all) {
      if (d.userId === userId && d.deviceId === currentId) {
        d.lastActive = Date.now();
        changed = true;
      }
    }
    if (changed) storage.set(KEYS.DEVICES, all);
  },

  revoke(deviceId) {
    const all = storage.get(KEYS.DEVICES) || [];
    storage.set(KEYS.DEVICES, all.filter((d) => d.id !== deviceId));
  },

  revokeAllExceptCurrent(userId) {
    const all = storage.get(KEYS.DEVICES) || [];
    const currentId = getDeviceId();
    storage.set(
      KEYS.DEVICES,
      all.filter((d) => d.userId !== userId || d.deviceId === currentId)
    );
  },

  removeCurrent(userId) {
    const all = storage.get(KEYS.DEVICES) || [];
    const currentId = getDeviceId();
    storage.set(
      KEYS.DEVICES,
      all.filter((d) => !(d.userId === userId && d.deviceId === currentId))
    );
  },

  isCurrent(device) {
    return device.deviceId === getDeviceId();
  },
};
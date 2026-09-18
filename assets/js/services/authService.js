// ============================================================
// ⚠️ FILE INI AKAN DIGANTI SAAT MIGRASI KE MySQL
// Saat migrasi: arahkan semua method ke API PHP
//   register → POST /api/auth/register.php
//   login    → POST /api/auth/login.php
//   logout   → POST /api/auth/logout.php
//   getSession → GET  /api/auth/me.php
// Kontrak method harus tetap sama agar UI tidak perlu diubah.
// ============================================================
import { storage, KEYS } from '../core/storage.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { generateToken, verifyToken } from '../core/token.js';
import { CONFIG } from '../config/constants.js';
import { historyService } from './historyService.js';
import { deviceService } from './deviceService.js';

export const authService = {
  async register({ email, password, name }) {
    const users = storage.get(KEYS.USERS) || [];
    if (users.some((u) => u.email === email.toLowerCase())) {
      throw new Error('Email sudah terdaftar');
    }
    const { hash, salt } = await hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name: name.trim(),
      hash, salt,
      createdAt: Date.now(),
    };
    storage.set(KEYS.USERS, [...users, user]);
    return { id: user.id, email: user.email, name: user.name };
  },

  async login({ email, password }) {
    const emailLower = email.toLowerCase();
    const users = storage.get(KEYS.USERS) || [];
    const user = users.find((u) => u.email === emailLower);

    // Log failed attempt (user tidak ada)
    if (!user) {
      historyService.add({ userId: null, email: emailLower, status: 'failed' });
      throw new Error('Email atau password salah');
    }

    const ok = await verifyPassword(password, user.salt, user.hash);
    if (!ok) {
      historyService.add({ userId: user.id, email: emailLower, status: 'failed' });
      throw new Error('Email atau password salah');
    }

    const token = generateToken(user.id);
    storage.set(KEYS.SESSION, {
      token, userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + CONFIG.SESSION_TTL,
    });

    historyService.add({ userId: user.id, email: emailLower, status: 'success' });
    deviceService.register(user.id);

    return { token, user: { id: user.id, email: user.email, name: user.name } };
  },

  logout() {
    const session = this.getSession();
    if (session) deviceService.removeCurrent(session.userId);
    storage.remove(KEYS.SESSION);
  },

  getSession() {
    const session = storage.get(KEYS.SESSION);
    if (!session) return null;
    if (!verifyToken(session.token)) {
      storage.remove(KEYS.SESSION);
      return null;
    }
    return session;
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const users = storage.get(KEYS.USERS) || [];
    const user = users.find((u) => u.id === session.userId);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  // ============== Update Profile ==============
  async updateProfile(userId, { name }) {
    const users = storage.get(KEYS.USERS) || [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User tidak ditemukan');
    users[idx].name = name.trim();
    users[idx].updatedAt = Date.now();
    storage.set(KEYS.USERS, users);
    return { id: users[idx].id, email: users[idx].email, name: users[idx].name };
  },

  // ============== Change Password ==============
  async changePassword(userId, oldPassword, newPassword) {
    const users = storage.get(KEYS.USERS) || [];
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User tidak ditemukan');

    const user = users[idx];
    const ok = await verifyPassword(oldPassword, user.salt, user.hash);
    if (!ok) throw new Error('Password lama salah');

    const { hash, salt } = await hashPassword(newPassword);
    users[idx].hash = hash;
    users[idx].salt = salt;
    users[idx].passwordChangedAt = Date.now();
    storage.set(KEYS.USERS, users);
    return true;
  },
};
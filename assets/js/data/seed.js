// ============================================================
// Seed user demo (hanya untuk Fase 1 — localStorage)
// User demo: demo@sso.test / demo123
// ============================================================
import { storage, KEYS } from '../core/storage.js';
import { hashPassword } from '../utils/hash.js';

export async function seedIfEmpty() {
  if (storage.get(KEYS.SEEDED)) return;

  const { hash, salt } = await hashPassword('demo123');

  storage.set(KEYS.USERS, [
    {
      id: crypto.randomUUID(),
      email: 'demo@sso.test',
      name: 'User Demo',
      hash,
      salt,
      createdAt: Date.now(),
    },
  ]);

  storage.set(KEYS.SEEDED, true);
}
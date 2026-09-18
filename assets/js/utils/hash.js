// ============================================================
// Hashing password menggunakan Web Crypto API (SHA-256 + salt)
// ⚠️ Untuk production, gunakan bcrypt di sisi server (PHP)
// ============================================================
export async function hashPassword(password, salt = crypto.randomUUID()) {
  const data = new TextEncoder().encode(password + salt);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  const hash = [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { hash, salt };
}

export async function verifyPassword(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}
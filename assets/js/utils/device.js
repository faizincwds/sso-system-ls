import { storage, KEYS } from '../core/storage.js';

export function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Unknown OS';

  if (/Edg\//.test(ua))                browser = 'Edge';
  else if (/Chrome\//.test(ua))        browser = 'Chrome';
  else if (/Firefox\//.test(ua))       browser = 'Firefox';
  else if (/Safari\//.test(ua))        browser = 'Safari';

  if (/Windows/.test(ua))              os = 'Windows';
  else if (/Mac OS/.test(ua))          os = 'macOS';
  else if (/Android/.test(ua))         os = 'Android';
  else if (/iPhone|iPad/.test(ua))     os = 'iOS';
  else if (/Linux/.test(ua))           os = 'Linux';

  return { browser, os, name: `${browser} on ${os}` };
}

// deviceId persistent per browser (tidak terhapus saat logout)
export function getDeviceId() {
  let id = storage.get(KEYS.DEVICE_ID);
  if (!id) {
    id = crypto.randomUUID();
    storage.set(KEYS.DEVICE_ID, id);
  }
  return id;
}

// Simulasi IP & lokasi dari hash deviceId
const LOCATIONS = ['Jakarta, ID', 'Bandung, ID', 'Surabaya, ID', 'Yogyakarta, ID', 'Medan, ID', 'Denpasar, ID'];
export function fakeIp() {
  const id = getDeviceId();
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `103.${h % 255}.${(h >> 8) % 255}.${(h >> 16) % 255}`;
}
export function fakeLocation() {
  const id = getDeviceId();
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return LOCATIONS[h % LOCATIONS.length];
}
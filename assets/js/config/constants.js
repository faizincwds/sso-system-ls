// ============================================================
// Konfigurasi global SSO
// ============================================================
export const CONFIG = {
  STORAGE_KEYS: {
    USERS:   'sso_users',
    SESSION: 'sso_session',
    APPS:    'sso_apps',
    SEEDED:  'sso_seeded',
    LOGIN_HISTORY:  'sso_login_history',  
    DEVICES:        'sso_devices',        
    CONNECTED_APPS: 'sso_connected_apps',
    ACTIVITY_LOG:   'sso_activity_log',
    DEVICES_ID: 'sso_device_id',
  },
  SESSION_TTL: 60 * 60 * 1000, // 1 jam (ms)
  LOGIN_URL:     '/index.html',
  DASHBOARD_URL: '/dashboard.html',
  APP_NAME:      'SSO System',
};
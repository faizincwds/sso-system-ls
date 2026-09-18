import { escapeHtml } from '../utils/dom.js';

// assets/js/ui/sidebar.js
const MENU = [
  { path: '/',         label: 'Dashboard',     icon: '🏠' },
  { path: '/profile',  label: 'Profil',        icon: '👤' },
  { path: '/security', label: 'Keamanan',      icon: '🔒' },
  { path: '/history',  label: 'Riwayat Login', icon: '📋' },
  { path: '/activity', label: 'Aktivitas',     icon: '📊' },   // 🆕
  { path: '/devices',  label: 'Perangkat',     icon: '💻' },
  { path: '/apps',     label: 'Aplikasi',      icon: '🔌' },
];

export function renderSidebar(container, user) {
  container.innerHTML = `
    <div class="p-4 border-b border-slate-200">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <div>
          <div class="font-bold text-slate-800 text-sm">SSO System</div>
          <div class="text-xs text-slate-500">v1.0</div>
        </div>
      </div>
    </div>

    <nav class="flex-1 p-3 space-y-1" id="sidebar-menu">
      ${MENU.map((m) => `
        <a href="#${m.path}" data-path="${m.path}"
          class="menu-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition">
          <span class="text-lg">${m.icon}</span>
          <span>${escapeHtml(m.label)}</span>
        </a>
      `).join('')}
    </nav>

    <div class="p-3 border-t border-slate-200">
      <div class="px-3 py-2 mb-2">
        <div class="text-xs text-slate-500">Login sebagai</div>
        <div class="text-sm font-medium text-slate-800 truncate">${escapeHtml(user.name)}</div>
        <div class="text-xs text-slate-500 truncate">${escapeHtml(user.email)}</div>
      </div>
      <button id="logout-btn"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
        <span>🚪</span> Logout
      </button>
    </div>
  `;

  // Highlight menu aktif
  const highlight = (path) => {
    container.querySelectorAll('.menu-item').forEach((el) => {
      const isActive = el.dataset.path === path;
      el.classList.toggle('bg-brand-50', isActive);
      el.classList.toggle('text-brand-700', isActive);
      el.classList.toggle('font-medium', isActive);
    });
  };

  window.addEventListener('route-change', (e) => highlight(e.detail.path));
  highlight(location.hash.slice(1) || '/');
}
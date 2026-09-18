import { escapeHtml } from '../utils/dom.js';

export function renderTopbar(container, user) {
  const initial = (user.name || '?').charAt(0).toUpperCase();
  container.innerHTML = `
    <div class="flex-1">
      <h1 id="page-title" class="text-lg font-semibold text-slate-800">Dashboard</h1>
    </div>

    <div class="flex items-center gap-3">
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg hover:bg-slate-100">
        ☰
      </button>
      <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
        <div class="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          ${initial}
        </div>
        <span class="text-sm text-slate-700">${escapeHtml(user.name)}</span>
      </div>
    </div>
  `;

  // Update title per route
  const titles = {
    '/': 'Dashboard', '/profile': 'Profil', '/security': 'Keamanan',
    '/history': 'Riwayat Login', '/devices': 'Perangkat Aktif', '/apps': 'Aplikasi Terhubung',
  };
  window.addEventListener('route-change', (e) => {
    const t = document.getElementById('page-title');
    if (t) t.textContent = titles[e.detail.path] || 'Dashboard';
  });

  // Mobile menu toggle (dispatch event, di-handle dashboard.html)
  container.querySelector('#mobile-menu-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  });
}
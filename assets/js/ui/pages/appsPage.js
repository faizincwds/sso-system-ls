import { authService } from '../../services/authService.js';
import { appService } from '../../services/appService.js';
import { showToast } from '../toast.js';
import { escapeHtml } from '../../utils/dom.js';
import { relativeTime } from '../../utils/format.js';

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

export function render(root) {
  const user = authService.getCurrentUser();

  function draw() {
    const connected = appService.getUserApps(user.id);
    const allApps = appService.getApps();
    const connectedIds = new Set(connected.map((c) => c.appId));

    root.innerHTML = `
      <div class="space-y-6">
        <div>
          <h3 class="font-semibold text-slate-800 mb-1">🔌 Aplikasi Terhubung</h3>
          <p class="text-sm text-slate-500 mb-4">Aplikasi yang memiliki akses ke akun SSO Anda</p>

          ${connected.length === 0 ? `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400">
              Belum ada aplikasi terhubung. Buka salah satu aplikasi di bawah untuk menghubungkan.
            </div>
          ` : `
            <div class="grid gap-4">
              ${connected.map((c) => {
                const app = c.app;
                const color = COLOR_MAP[app?.color] || COLOR_MAP.blue;
                return `
                  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
                    <div class="w-14 h-14 ${color.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                      ${app?.icon || '📦'}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-slate-800">${escapeHtml(app?.name || 'Unknown App')}</div>
                      <div class="text-sm text-slate-500">${escapeHtml(app?.description || '')}</div>
                      <div class="text-xs text-slate-400 mt-1">
                        Terakhir diakses ${relativeTime(c.lastAccess)}
                      </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <a href="${app?.url}" target="_blank"
                        class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-center">
                        Buka
                      </a>
                      <button data-disconnect="${c.appId}"
                        class="disconnect-btn text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">
                        Cabut Akses
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <div>
          <h3 class="font-semibold text-slate-800 mb-1">📦 Aplikasi Tersedia</h3>
          <p class="text-sm text-slate-500 mb-4">Aplikasi yang terdaftar di sistem SSO</p>

          <div class="grid sm:grid-cols-2 gap-4">
            ${allApps.map((app) => {
              const color = COLOR_MAP[app.color] || COLOR_MAP.blue;
              const isConnected = connectedIds.has(app.id);
              return `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div class="flex items-start gap-3 mb-3">
                    <div class="w-12 h-12 ${color.bg} rounded-xl flex items-center justify-center text-xl">
                      ${app.icon}
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-slate-800">${escapeHtml(app.name)}</div>
                      <div class="text-sm text-slate-500">${escapeHtml(app.description)}</div>
                    </div>
                  </div>
                  ${isConnected ? `
                    <div class="text-xs text-green-600 font-medium flex items-center gap-1">
                      ✓ Sudah terhubung
                    </div>
                  ` : `
                    <a href="${app.url}"
                      class="block text-center text-sm bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg font-medium transition">
                      Hubungkan
                    </a>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll('.disconnect-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Cabut akses aplikasi ini?')) return;
        appService.disconnect(user.id, btn.dataset.disconnect);
        showToast('Akses aplikasi dicabut', 'success');
        draw();
      });
    });
  }

  draw();
}
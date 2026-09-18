import { authService } from '../../services/authService.js';
import { deviceService } from '../../services/deviceService.js';
import { showToast } from '../toast.js';
import { escapeHtml } from '../../utils/dom.js';
import { relativeTime } from '../../utils/format.js';

export function render(root) {
  const user = authService.getCurrentUser();

  function draw() {
    const devices = deviceService.getUserDevices(user.id);

    root.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-800">💻 Perangkat Aktif</h3>
            <p class="text-sm text-slate-500">Perangkat yang pernah login ke akun Anda</p>
          </div>
          ${devices.length > 1 ? `
            <button id="revoke-all" class="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
              Logout semua perangkat lain
            </button>
          ` : ''}
        </div>

        ${devices.length === 0 ? `
          <div class="p-12 text-center text-slate-400">Tidak ada perangkat</div>
        ` : `
          <div class="divide-y divide-slate-100">
            ${devices.map((d) => `
              <div class="p-4 flex items-center gap-4">
                <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  ${/Android|iOS/.test(d.os) ? '📱' : '💻'}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-slate-800">${escapeHtml(d.name)}</span>
                    ${d.current ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Perangkat ini</span>' : ''}
                  </div>
                  <div class="text-sm text-slate-500">${escapeHtml(d.location)} · ${escapeHtml(d.ip)}</div>
                  <div class="text-xs text-slate-400 mt-0.5">Aktif ${relativeTime(d.lastActive)}</div>
                </div>
                ${d.current ? '' : `
                  <button data-revoke="${d.id}"
                    class="revoke-btn text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                    Logout
                  </button>
                `}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    root.querySelectorAll('.revoke-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Logout perangkat ini?')) return;
        deviceService.revoke(btn.dataset.revoke);
        showToast('Perangkat berhasil di-logout', 'success');
        draw();
      });
    });

    root.querySelector('#revoke-all')?.addEventListener('click', () => {
      if (!confirm('Logout semua perangkat lain? Anda akan tetap login di perangkat ini.')) return;
      deviceService.revokeAllExceptCurrent(user.id);
      showToast('Semua perangkat lain telah di-logout', 'success');
      draw();
    });
  }

  draw();
}
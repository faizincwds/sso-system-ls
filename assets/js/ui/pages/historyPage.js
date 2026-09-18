import { authService } from '../../services/authService.js';
import { historyService } from '../../services/historyService.js';
import { showToast } from '../toast.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDate } from '../../utils/format.js';

export function render(root) {
  const user = authService.getCurrentUser();
  let filter = 'all'; // 'all' | 'success' | 'failed'

  function draw() {
    const all = historyService.getUserHistory(user.id);
    const list = filter === 'all' ? all : all.filter((h) => h.status === filter);

    root.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h3 class="font-semibold text-slate-800">📋 Riwayat Login</h3>
            <p class="text-sm text-slate-500">Semua aktivitas login akun Anda</p>
          </div>
          <div class="flex gap-2">
            <button data-filter="all"
              class="filter-btn px-3 py-1.5 text-sm rounded-lg ${filter==='all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Semua (${all.length})
            </button>
            <button data-filter="success"
              class="filter-btn px-3 py-1.5 text-sm rounded-lg ${filter==='success' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Sukses (${all.filter(h=>h.status==='success').length})
            </button>
            <button data-filter="failed"
              class="filter-btn px-3 py-1.5 text-sm rounded-lg ${filter==='failed' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
              Gagal (${all.filter(h=>h.status==='failed').length})
            </button>
          </div>
        </div>

        ${list.length === 0 ? `
          <div class="p-12 text-center text-slate-400">
            <div class="text-4xl mb-2">📭</div>
            <div>Tidak ada riwayat</div>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium">Perangkat</th>
                  <th class="px-4 py-3 font-medium">IP / Lokasi</th>
                  <th class="px-4 py-3 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${list.map((h) => `
                  <tr class="hover:bg-slate-50">
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${h.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${h.status === 'success' ? '✓ Sukses' : '✗ Gagal'}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-700">${escapeHtml(h.device)}</td>
                    <td class="px-4 py-3">
                      <div class="text-slate-700">${escapeHtml(h.ip)}</div>
                      <div class="text-xs text-slate-500">${escapeHtml(h.location)}</div>
                    </td>
                    <td class="px-4 py-3 text-slate-500 text-xs">${formatDate(h.timestamp)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        ${all.length > 0 ? `
          <div class="p-4 border-t border-slate-100 flex justify-end">
            <button id="clear-history" class="text-sm text-red-600 hover:underline">
              🗑️ Hapus semua riwayat
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Handler filter
    root.querySelectorAll('.filter-btn').forEach((b) => {
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        draw();
      });
    });

    root.querySelector('#clear-history')?.addEventListener('click', () => {
      if (!confirm('Yakin hapus semua riwayat login?')) return;
      historyService.clearUserHistory(user.id);
      showToast('Riwayat berhasil dihapus', 'success');
      draw();
    });
  }

  draw();
}
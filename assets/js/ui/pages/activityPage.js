// ============================================================
// Activity Page — tampilkan semua aktivitas user
// ============================================================
import { authService } from '../../services/authService.js';
import { activityService, ACTIVITY_CATEGORIES } from '../../services/activityService.js';
import { showToast } from '../toast.js';
import { escapeHtml } from '../../utils/dom.js';
import { formatDate, relativeTime } from '../../utils/format.js';

const COLOR_BG = {
  green: 'bg-green-100 text-green-700',
  blue:  'bg-blue-100 text-blue-700',
  red:   'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function render(root) {
  const user = authService.getCurrentUser();
  let filter = 'all';
  let query = '';

  function draw() {
    const all = activityService.list(user.id);
    const stats = activityService.stats(user.id);

    // Filter berdasarkan kategori + search
    let list = all;
    if (filter !== 'all') {
      list = list.filter((a) => a.category === filter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          a.device.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      );
    }

    root.innerHTML = `
      <div class="space-y-4">
        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${[
            { label: 'Total',    value: stats.total,                   color: 'slate' },
            { label: 'Keamanan', value: stats.byCategory.security,     color: 'green' },
            { label: 'Aplikasi', value: stats.byCategory.apps,         color: 'blue'  },
            { label: 'Akun',     value: stats.byCategory.account,      color: 'purple'},
          ].map((s) => `
            <div class="bg-white rounded-xl p-4 border border-slate-100">
              <div class="text-xs text-slate-500">${s.label}</div>
              <div class="text-2xl font-bold text-${s.color}-600">${s.value}</div>
            </div>
          `).join('')}
        </div>

        <!-- Header & Filter -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div class="p-5 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-3 justify-between mb-4">
              <div>
                <h3 class="font-semibold text-slate-800">📊 Riwayat Aktivitas</h3>
                <p class="text-sm text-slate-500">Semua kegiatan Anda di sistem SSO</p>
              </div>
              ${all.length > 0 ? `
                <button id="clear-activity"
                  class="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
                  🗑️ Hapus Semua
                </button>` : ''}
            </div>

            <!-- Search -->
            <input type="text" id="activity-search" placeholder="🔍 Cari aktivitas..."
              value="${escapeHtml(query)}"
              class="w-full mb-3 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm" />

            <!-- Filter Kategori -->
            <div class="flex flex-wrap gap-2">
              ${activityService.getCategories().map((c) => {
                const count = c.id === 'all'
                  ? stats.total
                  : (stats.byCategory[c.id] || 0);
                const active = filter === c.id;
                return `
                  <button data-filter="${c.id}"
                    class="cat-btn px-3 py-1.5 text-sm rounded-lg transition
                      ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    ${c.icon} ${c.label} <span class="opacity-70">(${count})</span>
                  </button>`;
              }).join('')}
            </div>
          </div>

          <!-- List -->
          ${list.length === 0 ? `
            <div class="p-12 text-center text-slate-400">
              <div class="text-4xl mb-2">📭</div>
              <div>${all.length === 0 ? 'Belum ada aktivitas' : 'Tidak ada hasil'}</div>
            </div>` : `
            <ul class="divide-y divide-slate-100">
              ${list.map((a) => {
                const colorCls = COLOR_BG[a.color] || COLOR_BG.slate;
                const metaLine = [
                  a.device,
                  a.location,
                  a.ip,
                ].filter(Boolean).join(' · ');

                return `
                  <li class="p-4 flex items-start gap-3 hover:bg-slate-50">
                    <div class="w-10 h-10 ${colorCls} rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      ${a.icon}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-slate-800">${escapeHtml(a.label)}</div>
                      <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(metaLine)}</div>
                      ${renderMetadata(a.metadata)}
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="text-xs text-slate-400 whitespace-nowrap">${relativeTime(a.timestamp)}</div>
                      <div class="text-[10px] text-slate-300 mt-0.5">${formatDate(a.timestamp)}</div>
                    </div>
                  </li>`;
              }).join('')}
            </ul>
          `}
        </div>
      </div>
    `;

    // ---------- Event handlers ----------
    root.querySelectorAll('.cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        draw();
      });
    });

    const searchInput = root.querySelector('#activity-search');
    let searchTimer;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const val = e.target.value;
      searchTimer = setTimeout(() => {
        query = val;
        // Simpan posisi cursor
        const pos = e.target.selectionStart;
        draw();
        const newInput = root.querySelector('#activity-search');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(pos, pos);
        }
      }, 250);
    });

    root.querySelector('#clear-activity')?.addEventListener('click', () => {
      if (!confirm('Hapus semua riwayat aktivitas? Tindakan ini tidak dapat dibatalkan.')) return;
      // Catat aksi clear SEBELUM hapus
      activityService.log(user.id, 'activity_clear');
      activityService.clear(user.id);
      showToast('Riwayat aktivitas dihapus', 'success');
      draw();
    });
  }

  draw();
}

// ---------- Tampilkan metadata tambahan (misal nama app) ----------
function renderMetadata(metadata) {
  if (!metadata || Object.keys(metadata).length === 0) return '';
  const parts = [];
  if (metadata.appName)   parts.push(`Aplikasi: <b>${escapeHtml(metadata.appName)}</b>`);
  if (metadata.oldName)   parts.push(`Dari: <b>${escapeHtml(metadata.oldName)}</b>`);
  if (metadata.newName)   parts.push(`Ke: <b>${escapeHtml(metadata.newName)}</b>`);
  if (metadata.deviceName) parts.push(`Perangkat: <b>${escapeHtml(metadata.deviceName)}</b>`);
  if (parts.length === 0) return '';
  return `<div class="text-xs text-slate-400 mt-1">${parts.join(' · ')}</div>`;
}
import { authService } from '../../services/authService.js';
import { historyService } from '../../services/historyService.js';
import { deviceService } from '../../services/deviceService.js';
import { appService } from '../../services/appService.js';
import { escapeHtml } from '../../utils/dom.js';
import { relativeTime, formatDate } from '../../utils/format.js';
import { activityService } from '../../services/activityService.js';

export function render(root) {
  const user = authService.getCurrentUser();
  const stats = historyService.getStats(user.id);
  const devices = deviceService.getUserDevices(user.id);
  const apps = appService.getUserApps(user.id);
  const recent = historyService.getUserHistory(user.id).slice(0, 5);
  const activities = activityService.list(user.id).slice(0, 5);


  const statCard = (label, value, icon, color) => `
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-500">${label}</span>
        <span class="text-2xl">${icon}</span>
      </div>
      <div class="text-3xl font-bold text-${color}-600">${value}</div>
    </div>
  `;

  root.innerHTML = `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${statCard('Aplikasi', apps.length, '🔌', 'blue')}
      ${statCard('Total Login', stats.success, '✅', 'green')}
      ${statCard('Login Gagal', stats.failed, '❌', 'red')}
      ${statCard('Perangkat', devices.length, '💻', 'purple')}
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800">📋 Aktivitas Login Terbaru</h3>
          <a href="#/history" class="text-sm text-brand-600 hover:underline">Lihat semua →</a>
        </div>
        <div class="divide-y divide-slate-100">
          ${recent.length === 0 ? `
            <div class="p-8 text-center text-slate-400 text-sm">Belum ada aktivitas</div>
          ` : recent.map((h) => `
            <div class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${h.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                ${h.status === 'success' ? '✓' : '✗'}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-800 truncate">${escapeHtml(h.device)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(h.location)} · ${escapeHtml(h.ip)}</div>
              </div>
              <div class="text-xs text-slate-400 whitespace-nowrap">${relativeTime(h.timestamp)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
        <!-- 🆕 Aktivitas Terbaru -->
      <div class="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-slate-800">📊 Aktivitas Terbaru</h3>
          <a href="#/activity" class="text-sm text-brand-600 hover:underline">Lihat semua →</a>
        </div>
        <ul class="divide-y divide-slate-100">
          ${activities.length === 0 ? `
            <li class="p-8 text-center text-slate-400 text-sm">Belum ada aktivitas</li>
          ` : activities.map((a) => `
            <li class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                ${a.icon}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-800 truncate">${a.label}</div>
                <div class="text-xs text-slate-500">${a.device} · ${a.location}</div>
              </div>
              <div class="text-xs text-slate-400 whitespace-nowrap">${relativeTime(a.timestamp)}</div>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="p-5 border-b border-slate-100">
          <h3 class="font-semibold text-slate-800">🔐 Info Keamanan</h3>
        </div>
        <div class="p-5 space-y-4 text-sm">
          <div>
            <div class="text-slate-500 mb-1">Login Terakhir</div>
            <div class="font-medium text-slate-800">
              ${stats.lastLogin ? formatDate(stats.lastLogin) : 'Belum pernah login'}
            </div>
          </div>
          <div>
            <div class="text-slate-500 mb-1">Total Percobaan Gagal</div>
            <div class="font-medium ${stats.failed > 3 ? 'text-red-600' : 'text-slate-800'}">
              ${stats.failed} kali
            </div>
          </div>
          <div>
            <div class="text-slate-500 mb-1">Bergabung Sejak</div>
            <div class="font-medium text-slate-800">${formatDate(user.createdAt)}</div>
          </div>
          <a href="#/security" class="block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition">
            Ubah Password →
          </a>
        </div>
      </div>
    </div>
  `;
}

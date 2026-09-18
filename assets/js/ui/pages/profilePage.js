import { authService } from '../../services/authService.js';
import { showToast } from '../toast.js';
import { escapeHtml, formToObject, setLoading } from '../../utils/dom.js';

export function render(root) {
  const user = authService.getCurrentUser();
  const initial = (user.name || '?').charAt(0).toUpperCase();

  root.innerHTML = `
    <div class="max-w-2xl">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            ${initial}
          </div>
          <div>
            <div class="text-xl font-bold text-slate-800">${escapeHtml(user.name)}</div>
            <div class="text-sm text-slate-500">${escapeHtml(user.email)}</div>
          </div>
        </div>
      </div>

      <form id="profile-form" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-semibold text-slate-800 mb-4">Data Pribadi</h3>

        <label class="block mb-4">
          <span class="text-sm font-medium text-slate-700">Nama Lengkap</span>
          <input name="name" type="text" value="${escapeHtml(user.name)}" required
            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
        </label>

        <label class="block mb-6">
          <span class="text-sm font-medium text-slate-700">Email</span>
          <input type="email" value="${escapeHtml(user.email)}" disabled
            class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed" />
          <span class="text-xs text-slate-400 mt-1 block">Email tidak dapat diubah</span>
        </label>

        <button type="submit"
          class="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg font-medium transition">
          Simpan Perubahan
        </button>
      </form>
    </div>
  `;

  const form = document.getElementById('profile-form');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { name } = formToObject(form);
    if (!name.trim()) return showToast('Nama tidak boleh kosong', 'error');

    try {
      setLoading(btn, true, 'Menyimpan...');
      await authService.updateProfile(user.id, { name });
      showToast('Profil berhasil diperbarui', 'success');
      window.dispatchEvent(new CustomEvent('user-updated'));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}
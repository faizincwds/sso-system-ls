import { authService } from '../../services/authService.js';
import { showToast } from '../toast.js';
import { formToObject, setLoading } from '../../utils/dom.js';

export function render(root) {
  const user = authService.getCurrentUser();

  root.innerHTML = `
    <div class="max-w-2xl space-y-6">
      <form id="password-form" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-semibold text-slate-800 mb-1">🔒 Ubah Password</h3>
        <p class="text-sm text-slate-500 mb-4">Gunakan password yang kuat dan unik</p>

        <label class="block mb-3">
          <span class="text-sm font-medium text-slate-700">Password Lama</span>
          <input name="oldPassword" type="password" required
            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
        </label>
        <label class="block mb-3">
          <span class="text-sm font-medium text-slate-700">Password Baru</span>
          <input name="newPassword" type="password" required minlength="6"
            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
        </label>
        <label class="block mb-6">
          <span class="text-sm font-medium text-slate-700">Konfirmasi Password Baru</span>
          <input name="confirmPassword" type="password" required minlength="6"
            class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
        </label>

        <button type="submit"
          class="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg font-medium transition">
          Ubah Password
        </button>
      </form>

      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div class="font-semibold text-amber-800 mb-1">⚠️ Tips Keamanan</div>
        <ul class="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>Gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol</li>
          <li>Jangan gunakan password yang sama dengan akun lain</li>
          <li>Ganti password secara berkala</li>
        </ul>
      </div>
    </div>
  `;

  const form = document.getElementById('password-form');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formToObject(form);

    if (newPassword !== confirmPassword) return showToast('Konfirmasi password tidak cocok', 'error');
    if (newPassword.length < 6) return showToast('Password minimal 6 karakter', 'error');
    if (newPassword === oldPassword) return showToast('Password baru harus berbeda', 'error');

    try {
      setLoading(btn, true, 'Menyimpan...');
      await authService.changePassword(user.id, oldPassword, newPassword);
      showToast('Password berhasil diubah', 'success');
      form.reset();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}
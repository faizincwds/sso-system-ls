import { authService } from '../services/authService.js';
import { showToast } from './toast.js';
import { validator } from '../utils/validator.js';
import { formToObject, setLoading } from '../utils/dom.js';

export function mountRegisterForm(root) {
  root.innerHTML = `
    <form id="register-form"
      class="w-full max-w-sm p-6 bg-white rounded-2xl shadow-lg">
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-brand-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">S</div>
        <h2 class="text-2xl font-bold text-slate-800">Daftar Akun</h2>
        <p class="text-sm text-slate-500">Buat akun SSO baru</p>
      </div>

      <label class="block mb-3">
        <span class="text-sm font-medium text-slate-700">Nama Lengkap</span>
        <input name="name" type="text" required placeholder="Nama Anda"
          class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
      </label>

      <label class="block mb-3">
        <span class="text-sm font-medium text-slate-700">Email</span>
        <input name="email" type="email" required placeholder="nama@email.com"
          class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
      </label>

      <label class="block mb-4">
        <span class="text-sm font-medium text-slate-700">Password</span>
        <input name="password" type="password" required placeholder="Minimal 6 karakter"
          class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
      </label>

      <button type="submit"
        class="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium transition">
        Daftar
      </button>

      <p class="mt-4 text-sm text-center text-slate-600">
        Sudah punya akun?
        <a href="/index.html" class="text-brand-600 hover:underline font-medium">Login</a>
      </p>
    </form>
  `;

  const form = document.getElementById('register-form');
  const btn  = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = formToObject(form);

    const err = validator.validateRegister(data);
    if (err) return showToast(err, 'error');

    try {
      setLoading(btn, true, 'Mendaftar...');
      await authService.register(data);
      showToast('Pendaftaran berhasil! Silakan login.', 'success');
      setTimeout(() => (location.href = '/index.html'), 800);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}
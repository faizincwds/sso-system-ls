import { authService } from '../services/authService.js';
import { showToast } from './toast.js';
import { validator } from '../utils/validator.js';
import { formToObject, setLoading } from '../utils/dom.js';

export function mountLoginForm(root) {
  root.innerHTML = `
    <form id="login-form"
      class="w-full max-w-sm p-6 bg-white rounded-2xl shadow-lg">
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-brand-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">S</div>
        <h2 class="text-2xl font-bold text-slate-800">Login SSO</h2>
        <p class="text-sm text-slate-500">Masuk ke akun Anda</p>
      </div>

      <label class="block mb-3">
        <span class="text-sm font-medium text-slate-700">Email</span>
        <input name="email" type="email" required placeholder="nama@email.com"
          class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
      </label>

      <label class="block mb-4">
        <span class="text-sm font-medium text-slate-700">Password</span>
        <input name="password" type="password" required placeholder="••••••••"
          class="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
      </label>

      <button type="submit"
        class="w-full bg-brand-600 hover:bg-brand-500 text-white py-2.5 rounded-lg font-medium transition">
        Masuk
      </button>

      <p class="mt-4 text-sm text-center text-slate-600">
        Belum punya akun?
        <a href="/register.html" class="text-brand-600 hover:underline font-medium">Daftar</a>
      </p>

      <div class="mt-5 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 leading-relaxed">
        <div class="font-semibold text-slate-700 mb-1">🔑 Akun Demo:</div>
        <div>Email: <code class="text-brand-600">demo@sso.test</code></div>
        <div>Password: <code class="text-brand-600">demo123</code></div>
      </div>
    </form>
  `;

  const form = document.getElementById('login-form');
  const btn  = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = formToObject(form);

    const err = validator.validateLogin(data);
    if (err) return showToast(err, 'error');

    try {
      setLoading(btn, true, 'Masuk...');
      await authService.login(data);
      showToast('Login berhasil!', 'success');

      const redirect = new URLSearchParams(location.search).get('redirect');
      setTimeout(() => (location.href = redirect || '/dashboard.html'), 400);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}
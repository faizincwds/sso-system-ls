// Hash router sederhana untuk SPA
const routes = new Map();
let cleanupFn = null;

export function registerRoute(path, renderFn) {
  routes.set(path, renderFn);
}

export function navigate(path) {
  location.hash = '#' + path;
}

export function startRouter(defaultPath = '/') {
  const handle = async () => {
    const raw = location.hash.slice(1) || defaultPath;
    const [base] = raw.split('?');
    const renderFn = routes.get(base) || routes.get(defaultPath);

    if (cleanupFn) { try { cleanupFn(); } catch {} cleanupFn = null; }

    const root = document.getElementById('page-content');
    if (!root) return;
    root.innerHTML = '<div class="text-slate-400 text-sm">Memuat...</div>';
    root.innerHTML = '';

    const result = await renderFn(root);
    if (typeof result === 'function') cleanupFn = result;

    window.dispatchEvent(new CustomEvent('route-change', { detail: { path: base } }));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  window.addEventListener('hashchange', handle);
  handle();
}
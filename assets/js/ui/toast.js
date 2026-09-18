// ============================================================
// Toast notifikasi ringan (tanpa library)
// ============================================================
export function showToast(message, type = 'info', duration = 3000) {
  const colors = {
    info:    'bg-blue-500',
    error:   'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
  };

  const el = document.createElement('div');
  el.className =
    `fixed top-4 right-4 z-50 ${colors[type] || colors.info} text-white ` +
    `px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300`;
  el.textContent = message;

  document.body.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
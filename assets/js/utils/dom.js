// ============================================================
// Helper manipulasi DOM
// ============================================================
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function setLoading(button, isLoading, text = 'Memproses...') {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = text;
    button.classList.add('opacity-60', 'cursor-not-allowed');
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
    button.classList.remove('opacity-60', 'cursor-not-allowed');
  }
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]));
}
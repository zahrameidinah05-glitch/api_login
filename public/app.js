// Helper bersama untuk semua halaman.
const TOKEN_KEY = 'accessToken';

const store = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (v) => { try { localStorage.setItem(TOKEN_KEY, v); } catch {} },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} },
};

async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Bearer ${store.get()}`;
  let res;
  try {
    res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw { status: 0, messages: ['Tidak dapat terhubung ke server'] };
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const m = data.message;
    const messages = Array.isArray(m) ? m : [m || 'Terjadi kesalahan'];
    throw { status: res.status, messages: res.status === 429 ? ['Terlalu banyak percobaan, coba lagi sebentar lagi'] : messages };
  }
  return data;
}

function showMessage(el, type, messages) {
  el.className = `msg ${type}`;
  el.hidden = false;
  el.replaceChildren();
  const list = [].concat(messages);
  if (list.length === 1) { el.textContent = list[0]; return; }
  const ul = document.createElement('ul');
  for (const m of list) { const li = document.createElement('li'); li.textContent = m; ul.append(li); }
  el.append(ul);
}

// Menghubungkan <form data-form> ke handler async; mengurus tombol & pesan.
function wireForm(form, handler) {
  const box = form.querySelector('.msg');
  const btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    box.hidden = true;
    btn.disabled = true;
    try {
      await handler(Object.fromEntries(new FormData(form)), box, form);
    } catch (err) {
      showMessage(box, 'error', err.messages || ['Terjadi kesalahan']);
    } finally {
      btn.disabled = false;
    }
  });
}

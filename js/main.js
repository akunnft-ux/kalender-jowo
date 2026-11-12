/* main.js — Bootstrap, router hash, dan registry halaman.
 *
 * Pola scalable: menambah fitur baru = buat js/ui/<fitur>.js dengan export render(root),
 * lalu daftarkan di `routes` di bawah. Menghapus fitur = hapus baris route + file UI.
 * Tidak ada framework, tidak ada bundler. Semua path relatif (aman di GitHub Pages sub-path).
 */

import { initState, terapkanTema, state } from './util/state.js';
import { renderKalender } from './ui/kalender.js';
import { renderWeton } from './ui/weton.js';
import { renderWafat } from './ui/wafat.js';
import { renderData } from './ui/data.js';
import { renderTentang } from './ui/tentang.js';

// --- Registry halaman (kunci = hash, value = render function) ---
// Tambahkan fitur baru di sini. Jodoh sengaja dihilangkan sesuai kebutuhan.
const routes = {
  '#/kalender': renderKalender,
  '#/weton': renderWeton,
  '#/wafat': renderWafat,
  '#/data': renderData,
  '#/tentang': renderTentang,
};

const ROUTE_DEFAULT = '#/kalender';
const app = document.getElementById('app');

function parseHash() {
  let hash = window.location.hash || ROUTE_DEFAULT;
  // Pisahkan parameter: #/wafat?d=...&m=s -> route + params
  const [route, q = ''] = hash.split('?');
  const params = {};
  if (q) {
    q.split('&').forEach((part) => {
      const [k, v] = part.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }
  return { route, params };
}

function setAktifNav(route) {
  // Nav desktop
  document.querySelectorAll('.nav-desktop a').forEach((a) => {
    a.classList.toggle('aktif', a.getAttribute('href') === route);
  });
  // Nav seluler
  document.querySelectorAll('.nav-item').forEach((a) => {
    a.classList.toggle('aktif', a.getAttribute('href') === route);
  });
}

function render() {
  const { route, params } = parseHash();
  const renderHalaman = routes[route] || routes[ROUTE_DEFAULT];

  setAktifNav(route);

  if (app) {
    app.innerHTML = '';
    try {
      renderHalaman(app, params);
    } catch (err) {
      console.error('Gagal render halaman:', route, err);
      app.innerHTML = `
        <div class="kartu">
          <h2 class="judul-halaman">Halaman tidak tersedia</h2>
          <p>Rute <code>${escapeHtml(route)}</code> belum diimplementasikan.</p>
          <p class="eror">${escapeHtml(String(err.message))}</p>
        </div>
      `;
    }
  }
}

function escapeHtml(teks) {
  const d = document.createElement('div');
  d.textContent = teks;
  return d.innerHTML;
}

function init() {
  initState();

  // Tema toggle
  const btnTema = document.querySelector('.theme-toggle');
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      const urutan = ['otomatis', 'terang', 'gelap'];
      const idx = urutan.indexOf(state.tema);
      const berikutnya = urutan[(idx + 1) % urutan.length];
      terapkanTema(berikutnya);
      btnTema.setAttribute('aria-pressed', berikutnya === 'gelap');
    });
    btnTema.setAttribute('aria-pressed', state.tema === 'gelap');
  }

  // Tahun di footer
  const elTahun = document.getElementById('tahun-sekarang');
  if (elTahun) elTahun.textContent = new Date().getFullYear();

  // Router: hashchange + awal muat
  window.addEventListener('hashchange', render);
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

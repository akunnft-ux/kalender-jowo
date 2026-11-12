/* State penyimpanan lokal dengan try/catch (jika gagal, diam-diam diabaikan) */

const PREF_THEMA = 'pawukon_tema';
const PREF_MODE_JAWA = 'pawukon_mode_jawa';

export const state = {
  tema: 'otomatis', // 'terang' | 'gelap' | 'otomatis'
  modeJawa: 'sultan', // 'sultan' | 'aboge'
};

function muat() {
  try {
    const raw = localStorage.getItem(PREF_THEMA);
    if (raw && ['terang', 'gelap', 'otomatis'].includes(raw)) state.tema = raw;
    const m = localStorage.getItem(PREF_MODE_JAWA);
    if (m && ['sultan', 'aboge'].includes(m)) state.modeJawa = m;
  } catch (e) {
    // localStorage tidak tersedia (mis. private mode); gunakan default
  }
}

function simpanTema() {
  try { localStorage.setItem(PREF_THEMA, state.tema); } catch (e) {}
}

function simpanModeJawa() {
  try { localStorage.setItem(PREF_MODE_JAWA, state.modeJawa); } catch (e) {}
}

export function initState() {
  muat();
  terapkanTema(state.tema);
}

export function terapkanTema(tema) {
  state.tema = tema;
  simpanTema();
  const root = document.documentElement;
  let efek = tema;
  if (tema === 'otomatis') {
    efek = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang';
  }
  if (efek === 'gelap') {
    root.setAttribute('data-tema', 'gelap');
  } else {
    root.removeAttribute('data-tema');
  }
}

export function setModeJawa(mode) {
  state.modeJawa = mode;
  simpanModeJawa();
}

export function getModeJawa() {
  return state.modeJawa;
}

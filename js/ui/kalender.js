/* UI: Halaman Kalender Jawa (F1) */

import { h, qs, qsa, on, delegate, hapusIsi } from '../util/dom.js';
import { formatTanggalIndonesia, singkatPasaran, salinKePapanklip } from '../util/format.js';
import { getModeJawa, setModeJawa } from '../util/state.js';
import { gToJDN, jdnToG, hariOf, pasaranOf, hariIndex, JDN_MIN, JDN_MAX } from '../core/julian.js';
import { jawaLengkap, nogoTahun } from '../core/weton.js';
import { cariHariBesar } from '../data/hariBesar.js';

let state = {
  y: new Date().getFullYear(),
  m: new Date().getMonth() + 1,
  d: new Date().getDate(),
  pilihJdn: null,
};

const HARI_SINGKAT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function renderKalender(root) {
  hapusIsi(root);
  elemen = bangunKonten();
  root.appendChild(elemen.section);
  pasangEvent();
  render();
}

function bangunKonten() {
  const section = h('section', { id: 'halaman-kalender' });

  const header = h('div', { className: 'header-kalender' },
    h('button', {
      className: 'tombol-icon',
      'aria-label': 'Bulan sebelumnya',
      onclick: () => pindahBulan(-1),
    }, '‹'),
    h('h1', { className: 'judul-bulan' }, 'Memuat…'),
    h('div', { className: 'nav-bulan' },
      h('button', {
        className: 'tombol-icon',
        'aria-label': 'Bulan berikutnya',
        onclick: () => pindahBulan(1),
      }, '›')
    )
  );

  const infoMode = h('p', { className: 'info-mode' }, '');

  const daftarHari = h('div', { className: 'daftar-hari' },
    HARI_SINGKAT.map((hri) => h('div', {}, hri))
  );

  const grid = h('div', { className: 'grid-kalender', role: 'grid', 'aria-label': 'Kalender Jawa bulanan' });

  const panel = h('div', { className: 'panel-detail', id: 'panel-detail' });

  const tombolHariIni = h('button', {
    className: 'tombol tombol-halus',
    'aria-label': 'Lihat hari ini',
    onclick: () => keHariIni(),
  }, 'Hari ini');

  // Sisipkan tombol hari ini ke header (kanan)
  header.appendChild(tombolHariIni);

  section.appendChild(header);
  section.appendChild(infoMode);
  section.appendChild(daftarHari);
  section.appendChild(grid);
  section.appendChild(panel);

  return { section, header, infoMode, grid, panel, tombolHariIni };
}

let elemen;

function pasangEvent() {
  const modeSelect = h('select', { className: 'pilih-mode', 'aria-label': 'Mode kalender Jawa' },
    h('option', { value: 'sultan' }, 'Sultan Agungan (Kraton / Asapon)'),
    h('option', { value: 'aboge' }, 'Aboge (komunitas Islam Aboge)')
  );
  modeSelect.value = getModeJawa();
  on(modeSelect, 'change', (e) => {
    setModeJawa(e.target.value);
    render();
  });
  const lbl = h('label', {}, 'Mode: ');
  lbl.appendChild(modeSelect);
  elemen.header.insertBefore(lbl, elemen.header.children[1]); // setelah judul

  const inputLompat = h('input', {
    type: 'date',
    min: '1900-01-01',
    max: '2100-12-31',
    className: 'input-lompat',
    'aria-label': 'Lompat ke tanggal',
  });
  const btnLompat = h('button', { className: 'tombol tombol-halus', onclick: lompak }, 'Lompat');
  const barLompat = h('div', { style: 'margin-top:var(--spasi-sm); display:flex; gap:var(--spasi-xs);' },
    inputLompat, btnLompat
  );
  elemen.header.appendChild(barLompat);

  delegate(elemen.grid, '.sel-kalender', 'click', (e) => {
    const jdn = Number(e.currentTarget.dataset.jdn);
    bukaDetail(jdn);
  });

  on(window, 'keydown', (e) => {
    if (!elemen.panel.classList.contains('terbuka')) return;
    if (e.key === 'Escape') tutupDetail();
  });
}

function render() {
  const { y, m } = state;
  const judul = qs('.judul-bulan', elemen.header);
  judul.textContent = `${bulanIndo(m)} ${y}`;

  const mode = getModeJawa();
  // Hitung rentang bulan Jawa di bulan Masehi ini
  const jdnAwal = gToJDN(y, m, 1);
  const jdnAkhir = gToJDN(y, m, hariDalamBulan(y, m));
  const jawaAwal = jawaLengkap(jdnAwal, mode);
  const jawaAkhir = jawaLengkap(jdnAkhir, mode);
  elemen.infoMode.textContent = `Jawa: ${jawaAwal.namaBulan}–${jawaAkhir.namaBulan} ${jawaAkhir.tahun} ${jawaAkhir.namaTahun}  [Mode: ${mode === 'sultan' ? 'Sultan Agungan' : 'Aboge'}]`;

  // Elemen mode select sinkron
  const sel = elemen.header.querySelector('.pilih-mode');
  if (sel) sel.value = mode;

  // Tanggal hari ini
  const hoje = new Date();
  const jdnHariIni = gToJDN(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());

  hapusIsi(elemen.grid);

  // Hari pertama minggu (Senin = index 0)
  const jdnMingguAwal = jdnAwal;
  const hariMingguAwal = hariIndex(jdnMingguAwal); // 0=Senin
  // Mulai grid dari Senin minggu yang berisi tanggal 1
  let jdnCursor = jdnMingguAwal - hariMingguAwal;

  const selesai = jdnAkhir;
  const selesaiMinggu = hariIndex(selesai);

  let jdn = jdnCursor;
  while (jdn <= selesai || hariIndex(jdn) !== 0) {
    const g = jdnToG(jdn);
    const dalamBulan = g.y === y && g.m === m;
    const sel = h('div', {
      className: `sel-kalender ${dalamBulan ? '' : 'muted'} ${jdn === jdnHariIni ? 'hari-ini' : ''} ${state.pilihJdn === jdn ? 'aktif' : ''}`,
      'data-jdn': jdn,
      role: 'gridcell',
      'aria-label': `${hariOf(jdn)}, ${g.d} ${bulanIndo(g.m)} ${g.y}`,
    });

    if (dalamBulan) {
      const angka = h('div', { className: 'angka-masehi' }, g.d);
      const jawa = jawaLengkap(jdn, mode);
      const tglJawa = h('div', { className: 'tgl-jawa' }, `${jawa.tgl} ${singkatBulan(jawa.namaBulan)}`);
      const pasaranSpan = h('span', { className: `pasaran-singkat pasaran-${jawa.pasaran.toLowerCase()}` }, singkatPasaran(jawa.pasaran));
      const hariBesar = cariHariBesar(jawa.bulan, jawa.tgl);
      sel.appendChild(angka);
      sel.appendChild(tglJawa);
      sel.appendChild(pasaranSpan);
      if (hariBesar) {
        sel.appendChild(h('span', { className: 'titik-hari-besar', title: hariBesar.nama }));
      }
    } else {
      sel.appendChild(h('span', { className: 'angka-masehi muted' }, ''));
    }

    elemen.grid.appendChild(sel);
    jdn++;
    if (hariIndex(jdn) === 0 && jdn > selesai) break;
  }

  // Jika panel detail terbuka untuk tanggal yang masih valid, pertahankan
  if (state.pilihJdn !== null) {
    const s = qs(`[data-jdn="${state.pilihJdn}"]`, elemen.grid);
    if (s) s.classList.add('aktif');
  }
}

function bulanIndo(m) {
  return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m - 1];
}

function singkatBulan(nama) {
  const map = {
    Sura: 'Sura', Sapar: 'Sapar', Mulud: 'Mulud', 'Bakda Mulud': 'Bak.Mulud',
    Jumadilawal: 'Jml.Awal', Jumadilakir: 'Jml.Akhir', Rejeb: 'Rejeb', Ruwah: 'Ruwah',
    Pasa: 'Pasa', Sawal: 'Sawal', Sela: 'Sela', Besar: 'Besar',
  };
  return map[nama] || nama;
}

function hariDalamBulan(y, m) {
  return new Date(y, m, 0).getDate();
}

function pindahBulan(delta) {
  let { y, m } = state;
  m += delta;
  if (m > 12) { m = 1; y++; }
  if (m < 1) { m = 12; y--; }
  state.y = y;
  state.m = m;
  render();
}

function keHariIni() {
  const hoje = new Date();
  state.y = hoje.getFullYear();
  state.m = hoje.getMonth() + 1;
  state.d = hoje.getDate();
  state.pilihJdn = gToJDN(state.y, state.m, state.d);
  render();
  bukaDetail(state.pilihJdn);
}

function lompak() {
  const input = qs('.input-lompat', elemen.header);
  if (!input || !input.value) return;
  const [y, m, d] = input.value.split('-').map(Number);
  const jdn = gToJDN(y, m, d);
  if (jdn < JDN_MIN || jdn > JDN_MAX) {
    alert('Tanggal di luar rentang 1900–2100.');
    return;
  }
  state.y = y;
  state.m = m;
  state.d = d;
  state.pilihJdn = jdn;
  render();
  bukaDetail(jdn);
}

function bukaDetail(jdn) {
  state.pilihJdn = jdn;
  render();
  const panel = elemen.panel;
  const jawa = jawaLengkap(jdn, getModeJawa());
  const g = jdnToG(jdn);
  const hariBesar = cariHariBesar(jawa.bulan, jawa.tgl);
  const nogoT = nogoTahun(jawa.bulan);

  hapusIsi(panel);
  panel.classList.add('terbuka');

  panel.appendChild(h('h2', { className: 'judul-detail' }, 'Detail Hari'));
  panel.appendChild(h('div', { className: 'grid-detail' },
    itemDetail('Tanggal Masehi', formatTanggalIndonesia(g.y, g.m, g.d)),
    itemDetail('Hari / Pasaran', `${jawa.hari} ${jawa.pasaran}`),
    itemDetail('Weton', jawa.weton),
    itemDetail('Neptu', `${jawa.neptu}`),
    itemDetail('Tanggal Jawa', `${jawa.tgl} ${jawa.namaBulan} ${jawa.tahun} ${jawa.namaTahun}`),
    itemDetail('Nogo Dino', `${jawa.nogoDino} (joyo: ${jawa.joyoDino})`),
    itemDetail('Nogo Tahun', `${nogoT} (bulan ${jawa.namaBulan})`),
    hariBesar ? itemDetail('Hari Besar', hariBesar.nama) : null
  ));

  const aksi = h('div', { className: 'tombol-aksi' });
  const btnSalin = h('button', {
    className: 'tombol tombol-halus',
    onclick: async () => {
      const teks = `*${jawa.weton}*, ${formatTanggalIndonesia(g.y, g.m, g.d)} = ${jawa.tgl} ${jawa.namaBulan} ${jawa.tahun} ${jawa.namaTahun}. Neptu ${jawa.neptu}. Nogo dino: ${jawa.nogoDino}.`;
      try {
        await salinKePapanklip(teks);
        btnSalin.textContent = 'Disalin!';
        setTimeout(() => btnSalin.textContent = 'Salin Ringkasan', 1200);
      } catch (e) {
        prompt('Salin teks ini:', teks);
      }
    }
  }, 'Salin Ringkasan');

  const btnWafat = h('button', {
    className: 'tombol tombol-halus',
    onclick: () => bukaWafatDariTanggal(jdn, jawa.hari, jawa.pasaran, g.y, g.m, g.d),
  }, 'Hitung Wafat dari Tanggal Ini');

  aksi.appendChild(btnSalin);
  aksi.appendChild(btnWafat);
  panel.appendChild(aksi);

  // Scroll ke panel di layar kecil
  if (window.innerWidth < 640) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function tutupDetail() {
  state.pilihJdn = null;
  render();
  elemen.panel.classList.remove('terbuka');
  hapusIsi(elemen.panel);
}

function itemDetail(label, nilai) {
  if (!nilai) return null;
  return h('div', { className: 'item-detail' },
    h('div', { className: 'label-detail' }, label),
    h('div', { className: 'nilai-detail' }, nilai)
  );
}

function bukaWafatDariTanggal(jdn, hari, pasaran, y, m, d) {
  // Kirim ke halaman wafat via hash param
  const tanggal = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  window.location.hash = `#/wafat?d=${tanggal}&m=s`;
}

export function onHashChange(params) {
  // Jika ada parameter tanggal dari kalender, buka wafat
  if (params.d) {
    // Ditangani oleh ui/wafat.js
  }
}

/* UI: Halaman Data Referensi (F5) — seluruh isi Excel secara rapi */

import { h, qs, hapusIsi, on } from '../util/dom.js';
import { escapeTeks, unduhBerkas } from '../util/format.js';
import {
  HARI, PASARAN, NEPTU_HARI, NEPTU_PASARAN,
} from '../data/neptu.js';
import { ARAH, NOGO_DINO_SISA, JOYO_DINO, NOGO_TAHUN, nogoDinoDariSisa } from '../data/nogo.js';
import {
  NAMA_TAHUN, TAHUN_PANJANG, NAMA_BULAN, SANDI_ABOGE, SANDI_ASAPON,
} from '../data/windu.js';
import { SANDI_BULAN, SANDI_BULAN_META } from '../data/sandiBulan.js';
import { HARI_BESAR } from '../data/hariBesar.js';

export function renderData(root) {
  hapusIsi(root);
  root.appendChild(bangunKonten());
  pasangEvent();
}

function bangunKonten() {
  const section = h('section', { id: 'halaman-data' });
  section.appendChild(h('h2', { className: 'judul-halaman' }, 'Data Referensi'));

  // Pencarian
  const input = h('input', {
    type: 'text',
    id: 'cari-data',
    placeholder: 'Cari data…',
    className: 'cari-data',
  });
  section.appendChild(input);

  const konten = h('div', { id: 'konten-data' });
  section.appendChild(konten);

  // Unduh JSON
  const btnUnduh = h('button', {
    className: 'tombol tombol-halus',
    style: 'margin-top:var(--spasi);',
    onclick: unduhJSON,
  }, 'Unduh data (JSON)');
  section.appendChild(btnUnduh);

  // Render semua tabel
  renderSemua(konten);
  return section;
}

function pasangEvent() {
  const input = qs('#cari-data');
  const konten = qs('#konten-data');
  on(input, 'input', () => {
    const q = input.value.toLowerCase();
    const baris = konten.querySelectorAll('tr, .kartu-mentah, section');
    // Sederhana: filter teks pada blok yang mengandung kata kunci
    const blok = konten.querySelectorAll('.blok-data');
    blok.forEach((b) => {
      const teks = b.textContent.toLowerCase();
      b.style.display = teks.includes(q) ? '' : 'none';
    });
  });
}

function renderSemua(konten) {
  konten.appendChild(blok('Neptu Hari & Pasaran', tabelNeptu()));
  konten.appendChild(blok('Nogo Dino', tabelNogoDino()));
  konten.appendChild(blok('Nogo Tahun', tabelNogoTahun()));
  konten.appendChild(blok('Tahun Aboge & Asapon', tabelWindu()));
  konten.appendChild(blok('Rumus Selamatan Wafat', tabelWafat()));
  konten.appendChild(blok('Catatan Mentah (Sandi 12 Kata)', kartuMentah()));
  konten.appendChild(blok('Daftar Sumber', daftarSumber()));
}

function blok(judul, isi) {
  return h('div', { className: 'kartu blok-data' },
    h('h3', {}, judul),
    isi
  );
}

function tabelNeptu() {
  const tbl = h('table', { className: 'tabel-data' },
    h('thead', h('tr',
      h('th', {}, 'Jenis'),
      h('th', {}, 'Nama'),
      h('th', {}, 'Nilai')
    ))
  );
  const tb = h('tbody');
  HARI.forEach((hari) => {
    tb.appendChild(h('tr',
      h('td', {}, 'Hari'),
      h('td', {}, hari),
      h('td', {}, String(NEPTU_HARI[hari]))
    ));
  });
  PASARAN.forEach((p) => {
    tb.appendChild(h('tr',
      h('td', {}, 'Pasaran'),
      h('td', {}, p),
      h('td', {}, String(NEPTU_PASARAN[p]))
    ));
  });
  // Contoh total
  tb.appendChild(h('tr',
    h('td', { colSpan: 2, style: 'font-weight:700;' }, 'Contoh: Senin Pahing'),
    h('td', {}, '4 + 9 = 13')
  ));
  tbl.appendChild(tb);
  return tbl;
}

function tabelNogoDino() {
  const tbl = h('table', { className: 'tabel-data' },
    h('thead', h('tr',
      h('th', {}, 'Sisa (mod 4)'),
      h('th', {}, 'Nogo Dino'),
      h('th', {}, 'Joyo Dino')
    ))
  );
  const tb = h('tbody');
  [1, 2, 3, 0].forEach((s) => {
    const arah = NOGO_DINO_SISA[s];
    tb.appendChild(h('tr',
      h('td', {}, String(s)),
      h('td', {}, arah),
      h('td', {}, JOYO_DINO[arah])
    ));
  });
  tbl.appendChild(tb);
  const contoh = h('p', { style: 'margin-top:var(--spasi-sm); font-size:0.9rem; color:var(--teks-lembut);' },
    'Contoh: Senin Pahing → 4+9=13 → 13 mod 4 = 1 → nogo dino Wetan, joyo dino Kulon.'
  );
  return h('div', {}, tbl, contoh);
}

function tabelNogoTahun() {
  const tbl = h('table', { className: 'tabel-data' },
    h('thead', h('tr',
      h('th', {}, 'Arah'),
      h('th', {}, 'Bulan Jawa')
    ))
  );
  const tb = h('tbody');
  ARAH.forEach((arah) => {
    const bulan = [];
    for (let b = 1; b <= 12; b++) {
      if (NOGO_TAHUN[b] === arah) bulan.push(NAMA_BULAN[b - 1]);
    }
    tb.appendChild(h('tr',
      h('td', {}, arah),
      h('td', {}, bulan.join(', '))
    ));
  });
  tbl.appendChild(tb);
  return tbl;
}

function tabelWindu() {
  const tbl = h('table', { className: 'tabel-data' },
    h('thead', h('tr',
      h('th', {}, 'Tahun'),
      h('th', {}, 'Sandi Aboge'),
      h('th', {}, 'Hari'),
      h('th', {}, 'Pasaran'),
      h('th', {}, 'Sandi Asapon (banding)'),
      h('th', {}, 'Hari'),
      h('th', {}, 'Pasaran')
    ))
  );
  const tb = h('tbody');
  NAMA_TAHUN.forEach((t, i) => {
    const a = SANDI_ABOGE[i];
    const s = SANDI_ASAPON[i];
    const panjang = TAHUN_PANJANG[i] ? '355 (panjang)' : '354';
    tb.appendChild(h('tr',
      h('td', {}, `${t} (${panjang})`),
      h('td', {}, a.sandi),
      h('td', {}, a.hari),
      h('td', {}, a.pasaran),
      h('td', {}, '—'),
      h('td', {}, s.hari),
      h('td', {}, s.pasaran)
    ));
  });
  tbl.appendChild(tb);
  const keterangan = h('p', { style: 'margin-top:var(--spasi-sm); font-size:0.9rem; color:var(--teks-lembut);' },
    'Windu = 8 tahun = 2835 hari. Kurup = 15 windu − 1 hari = 42524 hari. Mode Sultan Agungan beralih kurup otomatis (Aboge → Asapon sejak 1867 J/1936 M → Anenhing sejak 1987 J).'
  );
  return h('div', {}, tbl, keterangan);
}

function tabelWafat() {
  const tbl = h('table', { className: 'tabel-data' },
    h('thead', h('tr',
      h('th', {}, 'Peringatan'),
      h('th', {}, 'N hari'),
      h('th', {}, 'Offset'),
      h('th', {}, 'Rumus Sarma')
    ))
  );
  const tb = h('tbody');
  const data = [
    ['Nelung dina (opsional)', '3', '+2', 'hari ke-3, pasaran ke-3'],
    ['Mitung dina', '7', '+6', 'tusaro: hari ke-7, pasaran ke-2'],
    ['Matang puluh dina', '40', '+39', 'masarma: hari ke-5, pasaran ke-5'],
    ['Nyatus', '100', '+99', 'rosarma: hari ke-2, pasaran ke-5'],
    ['Nyewu', '1000', '+999', 'nemsarma: hari ke-6, pasaran ke-5'],
  ];
  data.forEach((row) => {
    tb.appendChild(h('tr', row.map((c) => h('td', {}, c))));
  });
  tbl.appendChild(tb);
  return tbl;
}

function kartuMentah() {
  const daftar = h('ul', {},
    SANDI_BULAN.map((s) => h('li', {}, s))
  );
  return h('div', { className: 'kartu-mentah' },
    daftar,
    h('p', { className: 'catatan-mentah' },
      `${SANDI_BULAN_META.keterangan} Daftar 12 kata sandi (romjiji … jahpatji) disimpan apa adanya, flag terverifikasi: ${SANDI_BULAN_META.terverifikasi}.`
    )
  );
}

function daftarSumber() {
  const sumber = [
    'Rangkaian selamatan wafat: detikJateng — "Cara Menghitung 1000 Hari Orang Meninggal Menurut Jawa dan Tradisinya" (2025); jurnal UIN Sunan Kalijaga & Walisongo.',
    'Rumus sarma (tusaro/masarma/rosarma/nemsarma): KapanLagi, Mamikos, Mojok.',
    'Weton jodoh (Pegat–Pesthi, mod 8; Wasesa Segara, mod 7): detikJateng, Popbela, Orami.',
    'Kalender Jawa, windu, kurup (Aboge → Asapon 1867 J/24 Maret 1936 → Anenhing 1987 J): Good News From Indonesia, ensiklopedia Kalender Jawa, Khazin (2004) via jurnal UNISNU, tesis Walisongo tentang Aboge.',
    'Verifikasi silang: 17 Agustus 1945 = Jumat Legi = 9 Pasa 1876; 1 Januari 2000 = Sabtu Legi; 8 Juli 2024 = 1 Sura 1958 Je.',
  ];
  return h('div', {},
    h('ul', {}, sumber.map((s) => h('li', {}, s)))
  );
}

function unduhJSON() {
  const data = {
    neptu: { HARI, PASARAN, NEPTU_HARI, NEPTU_PASARAN },
    nogo: { ARAH, NOGO_DINO_SISA, JOYO_DINO, NOGO_TAHUN },
    windu: { NAMA_TAHUN, TAHUN_PANJANG, NAMA_BULAN, SANDI_ABOGE, SANDI_ASAPON },
    sandiBulan: { SANDI_BULAN, meta: SANDI_BULAN_META },
    hariBesar: HARI_BESAR,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pawukon-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

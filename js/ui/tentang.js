/* UI: Halaman Tentang (F6) */

import { h, hapusIsi } from '../util/dom.js';

export function renderTentang(root) {
  hapusIsi(root);
  root.appendChild(bangunKonten());
}

function bangunKonten() {
  const section = h('section', { id: 'halaman-tentang', className: 'konten-tentang' });

  section.appendChild(h('h2', { className: 'judul-halaman' }, 'Tentang Pawukon Kita'));

  section.appendChild(h('p', {},
    'Pawukon Kita adalah webapp ringan untuk kalender Jawa, weton, neptu, dan selamatan wafat. ' +
    'Dibangun tanpa framework, tanpa backend, dan tanpa iklan — berjalan sepenuhnya di peramban Anda.'
  ));

  section.appendChild(h('h2', {}, 'Istilah Penting'));
  const istilah = [
    { t: 'Weton', d: 'Gabungan hari dan pasaran (mis. Senin Legi). Menentukan sifat dan kecocokan.' },
    { t: 'Neptu', d: 'Nilai dari neptu hari ditambah neptu pasaran (rentang 7–18). Digunakan untuk nogo dino.' },
    { t: 'Pasaran', d: 'Siklus 5 hari: Legi, Pahing, Pon, Wage, Kliwon.' },
    { t: 'Windu', d: 'Siklus 8 tahun Jawa = 2835 hari.' },
    { t: 'Kurup', d: 'Siklus 15 windu − 1 hari = 42524 hari. Menandai pergantian era penanggalan Jawa.' },
  ];
  const list = h('ul', {},
    istilah.map((i) => h('li', {}, h('strong', {}, i.t + ' — '), i.d))
  );
  section.appendChild(list);

  section.appendChild(h('h2', {}, 'Mode Kalender'));
  section.appendChild(h('p', {},
    h('strong', {}, 'Sultan Agungan (default):'), ' mengikuti kurup otomatis (Aboge hingga 23 Maret 1936, Asapon sejak 24 Maret 1936, Anenhing sejak 1987). Digunakan Kraton Yogyakarta/Surakarta.'
  ));
  section.appendChild(h('p', {},
    h('strong', {}, 'Aboge:'), ' Alip = Rabu Wage dipakai terus tanpa pergeseran kurup, sesuai komunitas Islam Aboge. Hasil sekarang berselisih +1 hari terhadap mode Sultan Agungan.'
  ));

  section.appendChild(h('h2', {}, 'Disclaimer Lengkap'));
  section.appendChild(h('div', { className: 'disclaimer' },
    h('p', {},
      'Hasil perhitungan ini mengikuti tradisi primbon Jawa dan bersifat informatif/budaya. Berbagai daerah dan sumber memiliki variasi hitungan. Gunakan sebagai bahan pertimbangan, bukan penentu keputusan. Untuk acara keagamaan, ikuti arahan tokoh agama / sesepuh keluarga.'
    )
  ));

  section.appendChild(h('h2', {}, 'Sumber'));
  const src = h('ul', {},
    [
      'detikJateng — "Cara Menghitung 1000 Hari Orang Meninggal Menurut Jawa dan Tradisinya" (2025).',
      'Jurnal UIN Sunan Kalijaga & Walisongo (eprints.walisongo.ac.id) tentang slametan kematian.',
      'KapanLagi, Mamikos, Mojok — rumus sarma dan contoh hitung selamatan.',
      'Good News From Indonesia — perbedaan penanggalan 1 Suro dan mengenal kalender Jawa.',
      'Khazin (2004) via jurnal UNISNU; tesis Walisongo tentang Aboge.',
    ].map((s) => h('li', {}, s))
  );
  section.appendChild(src);

  section.appendChild(h('h2', {}, 'Teknis'));
  section.appendChild(h('p', { style: 'font-size:0.9rem; color:var(--teks-lembut);' },
    'Stack: HTML + CSS + JavaScript murni (ES Modules). Tanpa framework, bundler, npm, atau CDN. Hosting: GitHub Pages. Data disimpan sebagai modul JS (bukan fetch JSON).'
  ));

  section.appendChild(h('p', { style: 'margin-top:var(--spasi-lg); color:var(--teks-lembut); font-size:0.85rem;' },
    '© Pawukon Kita. Dibuat berdasarkan warisan budaya Jawa.'
  ));

  return section;
}

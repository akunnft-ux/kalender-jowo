/* UI: Halaman Hitung Hari Wafat (F3) — fitur inti */

import { h, qs, hapusIsi, on, delegate } from '../util/dom.js';
import { formatTanggalIndonesia, salinKePapanklip, unduhBerkas, buatICS, escapeTeks } from '../util/format.js';
import { gToJDN, jdnToG, JDN_MIN, JDN_MAX } from '../core/julian.js';
import { daftarPeringatan, hitungPeringatan, hitungPendak, infoMalamPelaksanaan } from '../core/wafat.js';

let state = {
  jdnWafat: null,
  maghrib: false,
  nama: '',
  tambahan: false,
  modeJawa: 'sultan',
};

export function renderWafat(root) {
  hapusIsi(root);
  root.appendChild(bangunKonten());
  pasangEvent();
  const hoje = new Date();
  setTanggal(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
  hitungSemua();
}

function bangunKonten() {
  const section = h('section', { id: 'halaman-wafat' });

  const form = h('div', { className: 'kartu form-wafat' },
    h('h2', { className: 'judul-halaman' }, 'Hitung Hari Wafat'),
    h('label', {}, 'Nama almarhum (opsional)'),
    h('input', {
      type: 'text',
      id: 'nama-wafat',
      maxlength: '40',
      placeholder: 'Contoh: Bapak',
    }),
    h('label', {}, 'Tanggal wafat (Masehi)'),
    h('input', {
      type: 'date',
      id: 'tgl-wafat',
      min: '1900-01-01',
      max: '2100-12-31',
    }),
    h('p', { className: 'eror', id: 'eror-wafat' }, ''),
    h('div', { className: 'radio-group' },
      h('label', { className: 'radio-label' },
        h('input', { type: 'radio', name: 'maghrib', value: '0', checked: true }),
        'Sebelum Maghrib (default)'
      ),
      h('label', { className: 'radio-label' },
        h('input', { type: 'radio', name: 'maghrib', value: '1' }),
        'Sesudah Maghrib (weton = hari berikutnya)'
      )
    ),
    h('label', { className: 'radio-label', style: 'margin-top:var(--spasi-sm);' },
      h('input', { type: 'checkbox', id: 'chk-tambahan' }),
      'Tampilkan hitungan tambahan (3 hari, pendak 1 & 2)'
    ),
    h('div', { style: 'margin-top:var(--spasi-sm); display:flex; gap:var(--spasi-xs);' },
      h('button', { className: 'tombol tombol-halus', id: 'btn-hari-ini' }, 'Pakai hari ini'),
      h('button', { className: 'tombol', id: 'btn-hitung' }, 'Hitung')
    ),
    h('div', { className: 'hasil-wafat', id: 'hasil-wafat', 'aria-live': 'polite' })
  );

  section.appendChild(form);

  const akordion = h('div', { className: 'akordion' },
    h('div', { className: 'akordion-header', onclick: toggleAkordion }, 'Cara hitung & rumus sarma'),
    h('div', { className: 'akordion-isi', id: 'akordion-isi' },
      h('p', {}, 'Hari wafat dihitung sebagai hari ke-1. Jadi hari ke-N = tanggal wafat + (N − 1).'),
      h('p', {}, 'Rumus sarma tradisional (tusaro, masarma, rosarma, nemsarma) menyatakan hasil yang sama dengan cara hari ke-a dan pasaran ke-b, dihitung inklusif dari weton wafat. Untuk 7/40/100/1000 hari, kedua cara selalu identik.'),
      h('p', {}, 'Beberapa sumber populer menghitung dari hari wafat sebagai hari pertama; variasi lokal ada. Kami mengikuti rumus sarma yang terverifikasi.')
    )
  );
  section.appendChild(akordion);

  return section;
}

function pasangEvent() {
  const hoje = new Date();
  const input = qs('#tgl-wafat');
  input.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  on(qs('#btn-hari-ini'), 'click', () => {
    const h2 = new Date();
    input.value = `${h2.getFullYear()}-${String(h2.getMonth() + 1).padStart(2, '0')}-${String(h2.getDate()).padStart(2, '0')}`;
    hitungSemua();
  });

  on(qs('#btn-hitung'), 'click', hitungSemua);
  on(input, 'change', hitungSemua);
  delegate(document, 'input[name="maghrib"]', 'change', hitungSemua);
  on(qs('#chk-tambahan'), 'change', (e) => {
    state.tambahan = e.target.checked;
    hitungSemua();
  });
  on(qs('#nama-wafat'), 'input', (e) => {
    state.nama = e.target.value.slice(0, 40);
  });
}

function setTanggal(y, m, d) {
  const input = qs('#tgl-wafat');
  input.value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  hitungSemua();
}

function hitungSemua() {
  const input = qs('#tgl-wafat');
  const eror = qs('#eror-wafat');
  const hasil = qs('#hasil-wafat');

  if (!input.value) {
    eror.textContent = 'Tanggal wafat harus diisi.';
    eror.classList.add('aktif');
    hapusIsi(hasil);
    return;
  }

  const [y, m, d] = input.value.split('-').map(Number);
  const jdn = gToJDN(y, m, d);

  if (jdn < JDN_MIN || jdn > JDN_MAX) {
    eror.textContent = 'Tanggal di luar rentang 1900–2100.';
    eror.classList.add('aktif');
    hapusIsi(hasil);
    return;
  }

  eror.classList.remove('aktif');

  const maghrib = qs('input[name="maghrib"]:checked').value === '1';
  const jdnEfektif = maghrib ? jdn + 1 : jdn;
  state.jdnWafat = jdnEfektif;
  state.maghrib = maghrib;
  state.nama = qs('#nama-wafat').value.slice(0, 40);

  const g = jdnToG(jdnEfektif);
  const wafatHari = jdnToG(jdn).d; // untuk referensi
  const gAsli = jdnToG(jdn);

  hapusIsi(hasil);

  // Header info tanggal wafat
  hasil.appendChild(h('p', {},
    `Tanggal wafat: ${formatTanggalIndonesia(gAsli.y, gAsli.m, gAsli.d)} ` +
    `(${maghrib ? 'sesudah Maghrib → efeksi hari ${formatTanggalIndonesia(g.y, g.m, g.d)}' : 'sebelum Maghrib'})`
  ));

  // Kartu peringatan
  daftarPeringatan().forEach((p) => {
    const r = hitungPeringatan(jdnEfektif, p.N);
    const kartu = h('div', { className: 'kartu-peringatan' });
    kartu.appendChild(h('h3', { className: 'judul-peringatan' },
      h('span', {}, `${p.nama} — ${p.N} hari`),
      h('span', { className: 'badge-hari' }, p.simbol)
    ));
    kartu.appendChild(h('div', { className: 'rincian-waktu' },
      itemWaktu('Weton sasaran', r.weton),
      itemWaktu('Tanggal Masehi', r.tanggalIndo),
      itemWaktu('Tanggal Jawa', `${r.jawa.tgl} ${r.jawa.namaBulan} ${r.jawa.tahun} ${r.jawa.namaTahun}`),
      itemWaktu('Neptu', String(r.neptu))
    ));
    kartu.appendChild(h('p', { style: 'margin:var(--spasi-sm) 0 0;' },
      `Malam pelaksanaan: ${r.malamPelaksanaan.hari}, ${r.malamPelaksanaan.tanggal} (malam ${r.weton})`
    ));

    // Hitung mundur
    const sisa = hitungMundur(r.jdn);
    kartu.appendChild(h('p', { style: 'margin-top:var(--spasi-sm); font-size:0.9rem; color:var(--teks-lembut);' }, sisa));

    const aksi = h('div', { className: 'tombol-aksi', style: 'margin-top:var(--spasi-sm);' });
    const btnSalin = h('button', {
      className: 'tombol tombol-halus',
      onclick: () => salinSatu(p, r, state.nama),
    }, 'Salin');
    const btnICs = h('button', {
      className: 'tombol',
      onclick: () => unduhICS(p, r, state.nama),
    }, '+ Kalender (.ics)');
    aksi.appendChild(btnSalin);
    aksi.appendChild(btnICs);
    kartu.appendChild(aksi);

    hasil.appendChild(kartu);
  });

  // Tambahan
  if (state.tambahan) {
    renderTambahan(hasil, jdnEfektif);
  }

  // Tombol cetak & salin semua
  const bar = h('div', { style: 'margin-top:var(--spasi-lg); display:flex; gap:var(--spasi-xs); flex-wrap:wrap;' });
  const btnCetak = h('button', { className: 'tombol tombol-halus', onclick: cetak }, 'Cetak Hasil');
  const btnSalinSemua = h('button', { className: 'tombol tombol-halus', onclick: salinSemua }, 'Salin Semua');
  bar.appendChild(btnCetak);
  bar.appendChild(btnSalinSemua);
  hasil.appendChild(bar);

  // Disclaimer
  hasil.appendChild(h('div', { className: 'disclaimer' },
    h('p', { style: 'font-size:0.85rem; color:var(--teks-lembut); margin:0;' },
      'Hasil perhitungan ini mengikuti tradisi primbon Jawa dan bersifat informatif/budaya. Berbagai daerah dan sumber memiliki variasi hitungan. Gunakan sebagai bahan pertimbangan, bukan penentu keputusan. Untuk acara keagamaan, ikuti arahan tokoh agama / sesepuh keluarga.'
    )
  ));
}

function renderTambahan(container, jdnEfektif) {
  const judul = h('h3', { style: 'margin-top:var(--spasi-lg); color:var(--sogan);' }, 'Hitungan Tambahan');
  container.appendChild(judul);

  // Nelung dina (3 hari) sudah dalam daftar. Tambahkan pendak.
  // Ambil tanggal Jawa wafat (hari ke-1)
  const r1 = hitungPeringatan(jdnEfektif, 1);
  const tahunJawa = r1.jawa.tahun;
  const bulanJawa = r1.jawa.bulan;
  const tglJawa = r1.jawa.tgl;

  const pendak = hitungPendak(tahunJawa, bulanJawa, tglJawa);
  if (pendak.length) {
    container.appendChild(h('p', { className: 'label-detail' }, 'Mendak (pendak): tanggal & bulan Jawa wafat yang sama pada tahun Jawa +1 / +2'));
    const grid = h('div', { className: 'rincian-waktu' });
    pendak.forEach((pd) => {
      grid.appendChild(itemWaktu(`Pendak ${pd.tambah}`, `${pd.tanggalIndo} — ${pd.weton}`));
    });
    container.appendChild(grid);
  }

  container.appendChild(h('p', { className: 'label-detail', style: 'margin-top:var(--spasi-sm);' },
    'Catatan: jika tanggal 30 tidak ada di bulan target, tanggal terakhir bulan digunakan. Variasi daerah: sebagian keluarga memakai 354 / 708 hari.'
  ));
}

function itemWaktu(label, nilai) {
  return h('div', { className: 'box-waktu' },
    h('div', { className: 'label-detail' }, label),
    h('div', { className: 'nilai-detail' }, nilai)
  );
}

function hitungMundur(jdnTarget) {
  const hoje = new Date();
  const jdnHariIni = gToJDN(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
  const selisih = jdnTarget - jdnHariIni;
  if (selisih > 0) return `${selisih} hari lagi`;
  if (selisih < 0) return `Sudah lewat ${-selisih} hari`;
  return 'Hari ini';
}

function salinSatu(p, r, nama) {
  const judul = nama ? `Selamatan ${p.nama} — ${nama}` : `Selamatan ${p.nama}`;
  const teks = [
    `${judul}`,
    `Weton: ${r.weton}`,
    `Tanggal: ${r.tanggalIndo}`,
    `Jawa: ${r.jawa.tgl} ${r.jawa.namaBulan} ${r.jawa.tahun} ${r.jawa.namaTahun}`,
    `Malam pelaksanaan: ${r.malamPelaksanaan.hari}, ${r.malamPelaksanaan.tanggal}`,
  ].join('\n');
  prompt('Salin teks ini:', teks);
}

function salinSemua() {
  const baris = [];
  if (state.nama) baris.push(`Nama: ${escapeTeks(state.nama)}`);
  daftarPeringatan().forEach((p) => {
    const r = hitungPeringatan(state.jdnWafat, p.N);
    baris.push(`${p.nama} (${p.N} hari): ${r.weton}, ${r.tanggalIndo}, Jawa ${r.jawa.tgl} ${r.jawa.namaBulan} ${r.jawa.tahun} ${r.jawa.namaTahun}, Malam: ${r.malamPelaksanaan.hari} ${r.malamPelaksanaan.tanggal}`);
  });
  prompt('Salin teks ini:', baris.join('\n'));
}

function unduhICS(p, r, nama) {
  const judul = nama ? `Selamatan ${p.nama} — ${nama}` : `Selamatan ${p.nama}`;
  const deskripsi = [
    `Weton: ${r.weton}`,
    `Tanggal: ${r.tanggalIndo}`,
    `Jawa: ${r.jawa.tgl} ${r.jawa.namaBulan} ${r.jawa.tahun} ${r.jawa.namaTahun}`,
    `Malam pelaksanaan: ${r.malamPelaksanaan.hari}, ${r.malamPelaksanaan.tanggal}`,
  ].join('\n');
  const ics = buatICS(judul, deskripsi, r.tanggal);
  unduhBerkas(`selamatan-${p.simbol.toLowerCase()}.ics`, ics, 'text/calendar');
}

function cetak() {
  window.print();
}

function toggleAkordion() {
  const isi = qs('#akordion-isi');
  isi.classList.toggle('terbuka');
}

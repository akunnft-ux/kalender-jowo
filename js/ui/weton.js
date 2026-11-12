/* UI: Halaman Weton & Neptu (F2) */

import { h, qs, hapusIsi, on, delegate } from '../util/dom.js';
import { escapeTeks } from '../util/format.js';
import { formatTanggalIndonesia, salinKePapanklip } from '../util/format.js';
import { gToJDN, jdnToG, hariOf, pasaranOf, JDN_MIN, JDN_MAX } from '../core/julian.js';
import { infoWeton, wetonanBerikutnya, neptu } from '../core/weton.js';

let state = { jdn: null, maghrib: false };

export function renderWeton(root) {
  hapusIsi(root);
  root.appendChild(bangunKonten());
  pasangEvent();
  const hoje = new Date();
  setTanggal(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
  hitung();
}

function bangunKonten() {
  const section = h('section', { id: 'halaman-weton' });

  const form = h('div', { className: 'kartu form-weton' },
    h('h2', { className: 'judul-halaman' }, 'Weton & Neptu'),
    h('label', {}, 'Tanggal Masehi'),
    h('input', {
      type: 'date',
      id: 'tgl-weton',
      min: '1900-01-01',
      max: '2100-12-31',
    }),
    h('p', { className: 'eror', id: 'eror-weton' }, ''),
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
    h('div', { style: 'margin-top:var(--spasi-sm); display:flex; gap:var(--spasi-xs);' },
      h('button', { className: 'tombol tombol-halus', id: 'btn-hari-ini' }, 'Pakai hari ini'),
      h('button', { className: 'tombol', id: 'btn-hitung' }, 'Hitung')
    ),
    h('div', { className: 'hasil-weton', id: 'hasil-weton', 'aria-live': 'polite' })
  );

  section.appendChild(form);
  return section;
}

function pasangEvent() {
  const input = qs('#tgl-weton');
  const hoje = new Date();
  input.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  on(qs('#btn-hari-ini'), 'click', () => {
    const hoje2 = new Date();
    input.value = `${hoje2.getFullYear()}-${String(hoje2.getMonth() + 1).padStart(2, '0')}-${String(hoje2.getDate()).padStart(2, '0')}`;
    state.maghrib = false;
    qs('input[name="maghrib"][value="0"]').checked = true;
    hitung();
  });

  on(qs('#btn-hitung'), 'click', hitung);
  on(input, 'change', hitung);
  on(qs('input[name="maghrib"]'), 'change', hitung);
  delegate(document, 'input[name="maghrib"]', 'change', hitung);
}

function setTanggal(y, m, d) {
  const input = qs('#tgl-weton');
  if (!input) return;
  input.value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  state.jdn = gToJDN(y, m, d);
  hitung();
}

function hitung() {
  const input = qs('#tgl-weton');
  const eror = qs('#eror-weton');
  const hasil = qs('#hasil-weton');
  const maghrib = qs('input[name="maghrib"]:checked').value === '1';

  if (!input.value) {
    eror.textContent = 'Tanggal harus diisi.';
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

  // Efektif Maghrib
  const jdnEfektif = maghrib ? jdn + 1 : jdn;
  const g = jdnToG(jdnEfektif);
  const w = infoWeton(jdnEfektif);
  const berikutnya = wetonanBerikutnya(jdnEfektif);

  state.jdn = jdnEfektif;
  state.maghrib = maghrib;

  hapusIsi(hasil);

  hasil.appendChild(h('div', { className: 'weton-besar' }, w.weton));
  hasil.appendChild(h('div', { className: 'neptu-rinci' },
    boxNeptu('Hari', w.hari),
    boxNeptu('Pasaran', w.pasaran),
    boxNeptu('Total', String(w.neptu))
  ));
  hasil.appendChild(h('p', {}, `${formatTanggalIndonesia(g.y, g.m, g.d)} (${maghrib ? 'sesudah Maghrib → hari berikutnya' : 'sebelum Maghrib'})`));
  hasil.appendChild(h('p', {}, `Nogo dino: ${w.nogo} | Joyo dino: ${w.joyo}`));

  const lanjut = h('div', { className: 'wetonan-berikutnya' });
  berikutnya.forEach((b, i) => {
    lanjut.appendChild(h('div', { className: 'kartu-wetonan' },
      h('div', { className: 'nilai-detail' }, `+${35 * (i + 1)} hr`),
      h('div', { className: 'label-detail' }, `${b.hari} ${b.pasaran}`)
    ));
  });
  if (berikutnya.length) {
    hasil.appendChild(h('p', { className: 'label-detail' }, 'Wetonan berikutnya (selapan, 35 hari):'));
    hasil.appendChild(lanjut);
  }

  const btnSalin = h('button', {
    className: 'tombol tombol-halus',
    onclick: async () => {
      const teks = `Weton: ${w.weton}, Neptu: ${w.neptu}, ${formatTanggalIndonesia(g.y, g.m, g.d)}. Nogo dino: ${w.nogo}.`;
      try {
        await salinKePapanklip(teks);
        btnSalin.textContent = 'Disalin!';
        setTimeout(() => btnSalin.textContent = 'Salin', 1200);
      } catch (e) {
        prompt('Salin teks ini:', teks);
      }
    }
  }, 'Salin');
  hasil.appendChild(btnSalin);
}

function boxNeptu(label, nilai) {
  return h('div', { className: 'box-neptu' },
    h('div', { className: 'nilai-neptu' }, nilai),
    h('div', { className: 'label-neptu' }, label)
  );
}

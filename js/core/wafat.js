/* Perhitungan selamatan wafat. Murni, tanpa DOM. */

import { hariOf, pasaranOf, gToJDN, jdnToG } from './julian.js';
import { toJawa, jawaToJDN, ASAPON_ANCHOR, KURUP_DAYS } from './kalenderJawa.js';
import { infoWeton } from './weton.js';
import { formatTanggalIndonesia } from '../util/format.js';
import { NAMA_BULAN } from '../data/windu.js';

/* Hari wafat dihitung sebagai hari ke-1. Hari ke-N = jdnEfektif + (N-1). */
export function hariKe(jdnWafatEfektif, N) {
  return jdnWafatEfektif + (N - 1);
}

const PERINGATAN = [
  { nama: 'Nelung dina', N: 3, simbol: '3H', opsional: true },
  { nama: 'Mitung dina', N: 7, simbol: '7H' },
  { nama: 'Matang puluh dina', N: 40, simbol: '40H' },
  { nama: 'Nyatus', N: 100, simbol: '100H' },
  { nama: 'Nyewu', N: 1000, simbol: '1000H' },
];

export function daftarPeringatan() {
  return PERINGATAN;
}

/* Hitung satu peringatan. Mengembalikan objek lengkap untuk UI. */
export function hitungPeringatan(jdnWafatEfektif, N, modeJawa = 'sultan') {
  const jdnSasaran = hariKe(jdnWafatEfektif, N);
  const g = jdnToG(jdnSasaran);
  const w = infoWeton(jdnSasaran);
  const jawa = toJawa(jdnSasaran, modeJawa);

  // Malam pelaksanaan = malam sebelum hari sasaran (hari Jawa dimulai Maghrib)
  const jdnMalam = jdnSasaran - 1;
  const gMalam = jdnToG(jdnMalam);
  const wMalam = infoWeton(jdnMalam);

  return {
    N,
    jdn: jdnSasaran,
    tanggal: `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`,
    tanggalIndo: formatTanggalIndonesia(g.y, g.m, g.d),
    hari: w.hari,
    pasaran: w.pasaran,
    weton: `${w.hari} ${w.pasaran}`,
    neptu: w.neptu,
    jawa,
    malamPelaksanaan: {
      hari: wMalam.hari,
      tanggal: formatTanggalIndonesia(gMalam.y, gMalam.m, gMalam.d),
      weton: `${wMalam.hari} ${wMalam.pasaran}`,
    },
  };
}

/* Hitung semua peringatan standar */
export function hitungSemua(jdnWafatEfektif, modeJawa = 'sultan') {
  return PERINGATAN.map((p) => hitungPeringatan(jdnWafatEfektif, p.N, modeJawa));
}

/* Pendak: tanggal & bulan Jawa wafat yang sama pada tahun Jawa +1 dan +2 */
export function hitungPendak(tahunJawa, bulanJawa, tglJawa, modeJawa = 'sultan') {
  const hasil = [];
  for (let tambah = 1; tambah <= 2; tambah++) {
    try {
      const jdn = jawaToJDN(tahunJawa + tambah, bulanJawa, tglJawa, modeJawa);
      const g = jdnToG(jdn);
      const w = infoWeton(jdn);
      hasil.push({
        tambah,
        tahun: tahunJawa + tambah,
        bulan: bulanJawa,
        tgl: tglJawa,
        tanggal: `${g.y}-${String(g.m).padStart(2, '0')}-${String(g.d).padStart(2, '0')}`,
        tanggalIndo: formatTanggalIndonesia(g.y, g.m, g.d),
        weton: `${w.hari} ${w.pasaran}`,
      });
    } catch (e) {
      // Tanggal 30 mungkin tidak ada di bulan target → skip
    }
  }
  return hasil;
}

export function infoMalamPelaksanaan(jdnSasaran) {
  const jdnMalam = jdnSasaran - 1;
  const g = jdnToG(jdnMalam);
  const w = infoWeton(jdnMalam);
  return {
    hari: w.hari,
    tanggal: `${g.d} ${NAMA_BULAN[g.m - 1]} ${g.y}`,
    weton: `${w.hari} ${w.pasaran}`,
  };
}

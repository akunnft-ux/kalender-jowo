/* Hari besar Jawa (opsional, informatif) — bulan, tanggal Jawa, nama */

export const HARI_BESAR = [
  { bulan: 1, tgl: 1, nama: '1 Sura (Tahun Baru Jawa)' },
  { bulan: 3, tgl: 12, nama: 'Maulud / Grebeg Mulud' },
  { bulan: 9, tgl: 1, nama: '1 Pasa (awal puasa, hitungan Jawa)' },
  { bulan: 10, tgl: 1, nama: '1 Sawal (Bakda/Lebaran, hitungan Jawa)' },
  { bulan: 12, tgl: 10, nama: 'Grebeg Besar (Idul Adha)' },
];

export function cariHariBesar(bulan, tgl) {
  return HARI_BESAR.find((h) => h.bulan === bulan && h.tgl === tgl);
}

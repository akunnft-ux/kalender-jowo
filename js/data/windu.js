/* Data windu (tahun Jawa) dari Excel */

export const NAMA_TAHUN = ['Alip', 'Ehe', 'Jimawal', 'Je', 'Dal', 'Be', 'Wawu', 'Jimakir'];
// Tahun panjang (355 hari): Ehe, Dal, Jimakir → index 1, 4, 7
export const TAHUN_PANJANG = [false, true, false, false, true, false, false, true];

export const NAMA_BULAN = [
  'Sura', 'Sapar', 'Mulud', 'Bakda Mulud', 'Jumadilawal', 'Jumadilakir',
  'Rejeb', 'Ruwah', 'Pasa', 'Sawal', 'Sela', 'Besar',
];

// Sandi tahun Aboge (dari Excel)
export const SANDI_ABOGE = [
  { tahun: 'Alip', sandi: 'Aboge', hari: 'Rabu', pasaran: 'Wage' },
  { tahun: 'Ehe', sandi: 'Hakadpon', hari: 'Minggu', pasaran: 'Pon' },
  { tahun: 'Jimawal', sandi: 'Jaahpon', hari: 'Jumat', pasaran: 'Pon' },
  { tahun: 'Je', sandi: 'Jasahing', hari: 'Selasa', pasaran: 'Pahing' },
  { tahun: 'Dal', sandi: 'Daltugi', hari: 'Sabtu', pasaran: 'Legi' },
  { tahun: 'Be', sandi: 'Bemesgi', hari: 'Kamis', pasaran: 'Legi' },
  { tahun: 'Wawu', sandi: 'Wanenwon', hari: 'Senin', pasaran: 'Kliwon' },
  { tahun: 'Jimakir', sandi: 'Jaahge', hari: 'Jumat', pasaran: 'Wage' },
];

// Sandi tahun Asapon (hasil turunan, ditampilkan sebagai pembanding)
export const SANDI_ASAPON = [
  { tahun: 'Alip', hari: 'Selasa', pasaran: 'Pon' },
  { tahun: 'Ehe', hari: 'Sabtu', pasaran: 'Pahing' },
  { tahun: 'Jimawal', hari: 'Kamis', pasaran: 'Pahing' },
  { tahun: 'Je', hari: 'Senin', pasaran: 'Legi' },
  { tahun: 'Dal', hari: 'Jumat', pasaran: 'Kliwon' },
  { tahun: 'Be', hari: 'Rabu', pasaran: 'Kliwon' },
  { tahun: 'Wawu', hari: 'Minggu', pasaran: 'Wage' },
  { tahun: 'Jimakir', hari: 'Kamis', pasaran: 'Pon' },
];

export function namaBulan(bulan) {
  return NAMA_BULAN[bulan - 1] ?? '-';
}

export function namaTahun(yi) {
  return NAMA_TAHUN[yi] ?? '-';
}

export function isTahunPanjang(yi) {
  return TAHUN_PANJANG[yi] === true;
}

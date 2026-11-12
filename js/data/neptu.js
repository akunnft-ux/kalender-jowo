/* Data neptu dari Excel — sumber kebenaran */

export const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']; // index = JDN mod 7 (0=Senin)
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']; // index = JDN mod 5 (0=Legi)

export const NEPTU_HARI = {
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
  Minggu: 5,
};

export const NEPTU_PASARAN = {
  Legi: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
  Kliwon: 8,
};

export function neptuHari(namaHari) {
  return NEPTU_HARI[namaHari] ?? 0;
}

export function neptuPasaran(namaPasaran) {
  return NEPTU_PASARAN[namaPasaran] ?? 0;
}

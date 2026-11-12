/* Data nogo dino & nogo tahun dari Excel */

export const ARAH = ['Wetan', 'Kidul', 'Kulon', 'Lor'];

// sisa (neptu dino + neptu pasaran) mod 4 → arah nogo dino
export const NOGO_DINO_SISA = { 1: 'Wetan', 2: 'Kidul', 3: 'Kulon', 0: 'Lor' };

// arah berlawanan (joyo dino)
export const JOYO_DINO = {
  Wetan: 'Kulon',
  Kulon: 'Wetan',
  Kidul: 'Lor',
  Lor: 'Kidul',
};

// nogo tahun per bulan Jawa (nomor bulan 1..12)
export const NOGO_TAHUN = {
  1: 'Wetan', 2: 'Wetan', 3: 'Wetan',
  4: 'Kidul', 5: 'Kidul', 6: 'Kidul',
  7: 'Kulon', 8: 'Kulon', 9: 'Kulon',
  10: 'Lor', 11: 'Lor', 12: 'Lor',
};

export function nogoDinoDariSisa(sisa) {
  return NOGO_DINO_SISA[sisa] ?? 'Lor';
}

export function joyoDinoDariArah(arah) {
  return JOYO_DINO[arah] ?? 'Lor';
}

export function nogoTahunDariBulan(bulan) {
  return NOGO_TAHUN[bulan] ?? '-';
}

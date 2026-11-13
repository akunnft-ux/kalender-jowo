/* Konversi Masehi ↔ Jawa (Sultan Agungan / Aboge).
 * Landasan: Lampiran A PRD. */

import { mod, gToJDN, jdnToG } from './julian.js';
import {
  NAMA_TAHUN,
  TAHUN_PANJANG,
  NAMA_BULAN,
  namaBulan,
  namaTahun,
  isTahunPanjang,
} from '../data/windu.js';

/* Jangkar: 1 Sura 1867 Alip = Selasa Pon, 24 Maret 1936 = ASAPON_ANCHOR */
export const ASAPON_ANCHOR = gToJDN(1936, 3, 24);
export const WINDU_DAYS = 2835; // 8 tahun
export const KURUP_DAYS = 42524; // 15 windu - 1 hari

// Cache for toJawa computations
const toJawaCache = new Map();

function getToJawaCacheKey(jdn, mode) {
  return `${jdn}:${mode}`;
}

export function toJawa(jdn, mode = 'sultan') {
  const key = getToJawaCacheKey(jdn, mode);
  if (toJawaCache.has(key)) {
    return toJawaCache.get(key);
  }
  
  let start, tahunDasar;

  if (mode === 'aboge') {
    start = ASAPON_ANCHOR - KURUP_DAYS;
    tahunDasar = 1747;
  } else {
    // sultan: kurup otomatis berdasarkan tanggal
    const k = Math.floor((jdn - ASAPON_ANCHOR) / KURUP_DAYS);
    start = ASAPON_ANCHOR + k * KURUP_DAYS;
    tahunDasar = 1867 + 120 * k;
  }

  let n = jdn - start;
  const windu = Math.floor(n / WINDU_DAYS);
  n -= windu * WINDU_DAYS;

  // Telusuri 8 tahun (354/355 hari)
  let yi = 0;
  for (;;) {
    const len = isTahunPanjang(yi) ? 355 : 354;
    if (n < len) break;
    n -= len;
    yi++;
  }

  // Telusuri 12 bulan (30/29, bulan 12 = 30 bila tahun panjang)
  let bi = 0;
  for (;;) {
    const len = bi % 2 === 0 ? 30 : bi === 11 && isTahunPanjang(yi) ? 30 : 29;
    if (n < len) break;
    n -= len;
    bi++;
  }

  const result = {
    tahun: tahunDasar + windu * 8 + yi,
    namaTahun: namaTahun(yi),
    bulan: bi + 1,
    namaBulan: namaBulan(bi + 1),
    tgl: n + 1,
  };
  
  toJawaCache.set(key, result);
  return result;
}

export function clearToJawaCache() {
  toJawaCache.clear();
}

/* jawaToJDN: Kebalikan toJawa. Digunakan untuk pendak & lompat tanggal Jawa. */
export function jawaToJDN(tahun, bulan, tgl, mode = 'sultan') {
  let start, tahunDasar, relativeYear;

  if (mode === 'aboge') {
    start = ASAPON_ANCHOR - KURUP_DAYS;
    tahunDasar = 1747;
    relativeYear = tahun - tahunDasar;
  } else {
    // sultan: cari kurup k yang mengandung tahun ini
    const k = Math.floor((tahun - 1867) / 120);
    start = ASAPON_ANCHOR + k * KURUP_DAYS;
    tahunDasar = 1867 + 120 * k;
    relativeYear = tahun - tahunDasar;
  }

  if (relativeYear < 0) {
    throw new Error(`Tahun ${tahun} di luar rentang kurup mode ${mode}`);
  }

  const winduInKurup = Math.floor(relativeYear / 8);
  const yi = relativeYear % 8;

  let hari = winduInKurup * WINDU_DAYS;

  // Tambah hari untuk tahun-tahun sebelum yi dalam windu ini
  for (let yy = 0; yy < yi; yy++) {
    hari += isTahunPanjang(yy) ? 355 : 354;
  }

  // Tambah hari untuk bulan-bulan sebelum bulan target
  for (let bi = 0; bi < bulan - 1; bi++) {
    const len = bi % 2 === 0 ? 30 : bi === 11 && isTahunPanjang(yi) ? 30 : 29;
    hari += len;
  }

  hari += tgl - 1;
  return start + hari;
}

export function panjangTahunJawa(yi) {
  return isTahunPanjang(yi) ? 355 : 354;
}

export function panjangBulanJawa(bi, yi) {
  return bi % 2 === 0 ? 30 : bi === 11 && isTahunPanjang(yi) ? 30 : 29;
}

export function hariTerakhirBulanJawa(bulan, yi) {
  return panjangBulanJawa(bulan - 1, yi);
}

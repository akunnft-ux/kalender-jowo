/* Weton & neptu. Murni, tanpa DOM. */

import { hariOf, pasaranOf } from './julian.js';
import { NEPTU_HARI, NEPTU_PASARAN } from '../data/neptu.js';
import { nogoDinoDariSisa, joyoDinoDariArah, nogoTahunDariBulan } from '../data/nogo.js';
import { toJawa } from './kalenderJawa.js';

export function neptu(jdn) {
  const hari = hariOf(jdn);
  const pasaran = pasaranOf(jdn);
  return NEPTU_HARI[hari] + NEPTU_PASARAN[pasaran];
}

export function infoWeton(jdn) {
  const hari = hariOf(jdn);
  const pasaran = pasaranOf(jdn);
  const total = neptu(jdn);
  const sisa = mod4(total);
  const nogo = nogoDinoDariSisa(sisa);
  const joyo = joyoDinoDariArah(nogo);
  return { hari, pasaran, neptu: total, nogo, joyo };
}

function mod4(a) {
  return ((a % 4) + 4) % 4;
}

export function nogoTahun(bulanJawa) {
  return nogoTahunDariBulan(bulanJawa);
}

export function jawaLengkap(jdn, mode = 'sultan') {
  const jawa = toJawa(jdn, mode);
  const w = infoWeton(jdn);
  return {
    ...jawa,
    hari: w.hari,
    pasaran: w.pasaran,
    neptu: w.neptu,
    nogoDino: w.nogo,
    joyoDino: w.joyo,
    weton: `${w.hari} ${w.pasaran}`,
  };
}

/* Wetonan berikutnya (selapan): 3 tanggal berikutnya yang wetonnya sama, jdn + 35*i */
export function wetonanBerikutnya(jdn, jumlah = 3) {
  const hasil = [];
  const target = pasaranOf(jdn) + '|' + hariOf(jdn); // tidak digunakan langsung; sederhanakan pakai neptu+pasaran
  // Weton sama = hari dan pasaran sama → terjadi setiap 35 hari (LCM 7,5)
  for (let i = 1; i <= jumlah; i++) {
    const j = jdn + 35 * i;
    hasil.push({ jdn, hari: hariOf(j), pasaran: pasaranOf(j) });
  }
  return hasil;
}

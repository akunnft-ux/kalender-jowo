/* Julian Day Number — kalender Gregorian proleptik.
 * Semua aritmetika tanggal pakai JDN integer (hindari bug zona waktu/DST).
 * Rentang didukung: 1 Jan 1900 – 31 Des 2100. */

export function mod(a, n) {
  return ((a % n) + n) % n;
}

/* Masehi → JDN (algoritma Fliegel–Van Flandern) */
export function gToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

/* JDN → Masehi */
export function jdnToG(j) {
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    y: 100 * b + d - 4800 + Math.floor(m / 10),
    m: m + 3 - 12 * Math.floor(m / 10),
    d: e - Math.floor((153 * m + 2) / 5) + 1,
  };
}

export function hariOf(jdn) {
  return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][mod(jdn, 7)];
}

export function hariIndex(jdn) {
  return mod(jdn, 7); // 0=Senin, 6=Minggu
}

export function pasaranOf(jdn) {
  return ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'][mod(jdn, 5)];
}

export function rentangValid(y, m, d) {
  const j = gToJDN(y, m, d);
  return j >= gToJDN(1900, 1, 1) && j <= gToJDN(2100, 12, 31);
}

export const JDN_MIN = gToJDN(1900, 1, 1);
export const JDN_MAX = gToJDN(2100, 12, 31);

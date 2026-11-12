/* Test vector §9 PRD — dieksekusi oleh tests/index.html.
 * Semua harus PASS sebelum rilis. */

import {
  gToJDN, jdnToG, hariOf, pasaranOf,
} from '../js/core/julian.js';
import { toJawa, KURUP_DAYS, panjangTahunJawa } from '../js/core/kalenderJawa.js';
import { infoWeton, neptu, nogoTahun } from '../js/core/weton.js';
import { hitungPeringatan } from '../js/core/wafat.js';

let passed = 0;
let failed = 0;
const elLog = document.getElementById('log');
const elRingkasan = document.getElementById('ringkasan');

function log(teks, jenis = 'info') {
  const div = document.createElement('div');
  div.textContent = teks;
  div.className = jenis;
  elLog.appendChild(div);
  if (jenis === 'PASS') console.log(teks);
  else if (jenis === 'FAIL') console.error(teks);
  else console.log(teks);
}

function assert(cond, pesan) {
  if (cond) { passed++; log(`PASS: ${pesan}`, 'PASS'); }
  else { failed++; log(`FAIL: ${pesan}`, 'FAIL'); }
}

function assertEq(actual, expected, pesan) {
  const ok = String(actual) === String(expected);
  if (ok) { passed++; log(`PASS: ${pesan}`, 'PASS'); }
  else { failed++; log(`FAIL: ${pesan} — actual=${String(actual)}, expected=${String(expected)}`, 'FAIL'); }
}

// --- §9.1 Masehi → Jawa ---
const cases = [
  ['1936-03-24', 'Selasa Pon', 'sultan', '1 Sura 1867 Alip'],
  ['1945-08-17', 'Jumat Legi', 'sultan', '9 Pasa 1876 Ehe'],
  ['2000-01-01', 'Sabtu Legi', 'sultan', '24 Pasa 1932 Ehe'],
  ['2024-07-08', 'Senin Legi', 'sultan', '1 Sura 1958 Je'],
  ['2026-06-17', 'Rabu Kliwon', 'sultan', '1 Sura 1960 Be'],
  ['2026-06-17', 'Rabu Kliwon', 'aboge', '30 Besar 1959 Dal'],
  ['2026-11-12', 'Kamis Pon', 'sultan', '1 Jumadilakir 1960 Be'],
  ['2026-11-12', 'Kamis Pon', 'aboge', '30 Jumadilawal 1960 Be'],
];
cases.forEach(([tgl, wp, mode, wa]) => {
  const [y, m, d] = tgl.split('-').map(Number);
  const j = gToJDN(y, m, d);
  const w = `${hariOf(j)} ${pasaranOf(j)}`;
  const jawa = toJawa(j, mode);
  const hasil = `${jawa.tgl} ${jawa.namaBulan} ${jawa.tahun} ${jawa.namaTahun}`;
  assertEq(w, wp, `${tgl} → weton/pasaran`);
  assertEq(hasil, wa, `${tgl} → ${mode} → Jawa`);
});

// --- §9.2 Invarian ---
let roundTrip = true;
for (let j = gToJDN(1900, 1, 1); j <= gToJDN(2100, 12, 31); j++) {
  const g = jdnToG(j);
  if (gToJDN(g.y, g.m, g.d) !== j) { roundTrip = false; break; }
}
assert(roundTrip, 'gToJDN(jdnToG(j)) round-trip seluruh rentang');

const setLen = new Set();
for (let yi = 0; yi < 8; yi++) setLen.add(panjangTahunJawa(yi));
assert(setLen.size === 2 && setLen.has(354) && setLen.has(355), 'Panjang tahun hanya 354/355');
assert(KURUP_DAYS === 42524, 'KURUP_DAYS = 42524');

// Diskontinuitas kalender Jawa (mode sultan)
let diskont = true;
for (let d = gToJDN(1900, 1, 1); d < gToJDN(2100, 12, 31); d++) {
  const a = toJawa(d, 'sultan');
  const b = toJawa(d + 1, 'sultan');
  const naikSatu = b.tgl === a.tgl + 1 && a.bulan === b.bulan && a.tahun === b.tahun;
  const resetBulan = b.tgl === 1 && b.bulan !== a.bulan;
  const resetTahun = b.tgl === 1 && b.bulan === 1 && b.tahun !== a.tahun;
  if (!(naikSatu || resetBulan || resetTahun)) { diskont = false; break; }
}
assert(diskont, 'Tidak ada diskontinuitas kalender Jawa (mode sultan)');

// --- §9.3 Wafat ---
const jdnWafat = gToJDN(2023, 2, 6);
assertEq(hariOf(jdnWafat), 'Senin', '2023-02-06 hari Senin');
assertEq(pasaranOf(jdnWafat), 'Pon', '2023-02-06 pasaran Pon');

const wafat = [
  { N: 3, hari: 'Rabu Kliwon', tgl: '2023-02-08' },
  { N: 7, hari: 'Minggu Wage', tgl: '2023-02-12' },
  { N: 40, hari: 'Jumat Pahing', tgl: '2023-03-17' },
  { N: 100, hari: 'Selasa Pahing', tgl: '2023-05-16' },
  { N: 1000, hari: 'Sabtu Pahing', tgl: '2025-11-01' },
];
wafat.forEach(({ N, hari, tgl }) => {
  const r = hitungPeringatan(jdnWafat, N);
  assertEq(r.hari, hari, `${N} hari → ${hari}`);
  assertEq(r.tanggal, tgl, `${N} hari → ${tgl}`);
});

// Sesudah Maghrib
const jdnEfektif = jdnWafat + 1;
const r7 = hitungPeringatan(jdnEfektif, 7);
assertEq(r7.hari, 'Senin Kliwon', 'Sesudah Maghrib 7 hari → Senin Kliwon');
assertEq(r7.tanggal, '2023-02-13', 'Sesudah Maghrib 7 hari → 2023-02-13');

const r7normal = hitungPeringatan(jdnWafat, 7);
assertEq(r7normal.malamPelaksanaan.hari, 'Sabtu', 'Malam pelaksanaan 7 hari → Sabtu');
assertEq(r7normal.malamPelaksanaan.tanggal, '11 Februari 2023', 'Malam pelaksanaan tanggal');

// --- §9.4 Weton, Nogo ---
// Cari Senin Pahing pertama ≥ 2026-01-01
let j = gToJDN(2026, 1, 1);
while (!(hariOf(j) === 'Senin' && pasaranOf(j) === 'Pahing')) j++;
const wSP = infoWeton(j);
assertEq(wSP.neptu, 13, 'Senin Pahing neptu = 13');
assertEq(wSP.nogo, 'Wetan', 'Senin Pahing nogo = Wetan');
assertEq(wSP.joyo, 'Kulon', 'Senin Pahing joyo = Kulon');

assertEq(nogoTahun(6), 'Kidul', 'Bulan 6 (Jumadilakir) nogo tahun = Kidul');

// Jodoh mod 8 / mod 7
assertEq((15 + 13) % 8, 4, 'Jodoh mod 8 = 4 (Topo)');
assertEq((15 + 13) % 7, 0, 'Jodoh mod 7 = 0 (Lebu Katiup Angin)');
assertEq((7 + 9) % 8, 0, 'Selasa Wage+Senin Legi mod 8 = 0 (Pesthi)');
assertEq((7 + 9) % 7, 2, 'Selasa Wage+Senin Legi mod 7 = 2 (Tunggak Semi)');
assertEq((18 + 18) % 8, 4, 'Sabtu Pahing+Sabtu Pahing mod 8 = 4 (Topo)');

// --- Ringkasan ---
log(`\n=== HASIL TEST: ${passed} PASS, ${failed} FAIL ===`, failed ? 'FAIL' : 'PASS');
if (elRingkasan) {
  elRingkasan.textContent = `${passed} PASS, ${failed} FAIL`;
  elRingkasan.className = failed ? 'ringkasan gagal' : 'ringkasan lulus';
}
if (failed > 0) log('Beberapa test GAGAL.', 'FAIL');
else log('Semua test LULUS.', 'PASS');

/* Libur Nasional Indonesia — tanggal Masehi tetap.
 * Sumber: UU No. 13/2003, SKB 3 Menteri, Kepres/Keputusan Presiden tiap tahun.
 * Libur yang tanggalnya tetap (bukan bergantung hijriah/taqwim).
 */

export const LIBUR_NASIONAL_TETAP = [
  { bulan: 1, tgl: 1, nama: 'Tahun Baru Masehi' },
  { bulan: 8, tgl: 17, nama: 'Hari Kemerdekaan RI' },
  { bulan: 12, tgl: 25, nama: 'Hari Natal' },
];

/* Libur agama yang tanggalnya tetap (Kristen Protestan & Katolik) */
export const LIBUR_KRISTEN_TETAP = [
  { bulan: 3, tgl: null, nama: 'Wafat Isa Almasih (Jumat Agung)', tipe: 'pascha', offset: -2 }, // dihitung dari Paskah
  { bulan: 5, tgl: null, nama: 'Kenaikan Isa Almasih', tipe: 'pascha', offset: 39 },
];

/* Libur agama yang tanggalnya bergantung komputasi (hijriah/taqwim/astronomis)
 * Per tahun perlu data resmi dari Kemenag / Kepres.
 * Fungsi helper untuk mengisi per tahun.
 */

// Tahun 2024 (berdasarkan Kepres Nomor 14 Tahun 2023)
export const LIBUR_2024 = [
  { bulan: 1, tgl: 1, nama: 'Tahun Baru Masehi' },
  { bulan: 2, tgl: 10, nama: 'Tahun Baru Imlek 2575' },
  { bulan: 3, tgl: 11, nama: 'Isra Mi\'raj Nabi Muhammad SAW' },
  { bulan: 3, tgl: 29, nama: 'Wafat Isa Almasih (Jumat Agung)' },
  { bulan: 3, tgl: 31, nama: 'Hari Paskah' },
  { bulan: 4, tgl: 10, nama: 'Hari Raya Idul Fitri 1445 H' },
  { bulan: 4, tgl: 11, nama: 'Hari Raya Idul Fitri 1445 H (kedua)' },
  { bulan: 5, tgl: 9, nama: 'Kenaikan Isa Almasih' },
  { bulan: 5, tgl: 23, nama: 'Hari Waisak 2567' },
  { bulan: 6, tgl: 17, nama: 'Hari Raya Idul Adha 1445 H' },
  { bulan: 7, tgl: 7, nama: 'Tahun Baru Hijriah 1446 H / 1 Muharram' },
  { bulan: 8, tgl: 17, nama: 'Hari Kemerdekaan RI ke-79' },
  { bulan: 9, tgl: 16, nama: 'Maulid Nabi Muhammad SAW' },
  { bulan: 12, tgl: 25, nama: 'Hari Natal' },
  // Cuti bersama (opsional, non-libur resmi tapi praktis)
  { bulan: 2, tgl: 9, nama: 'Cuti Bersama Imlek', cuti: true },
  { bulan: 3, tgl: 28, nama: 'Cuti Bersama Jumat Agung', cuti: true },
  { bulan: 4, tgl: 8, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 9, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 12, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 15, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 6, tgl: 18, nama: 'Cuti Bersama Idul Adha', cuti: true },
  { bulan: 7, tgl: 8, nama: 'Cuti Bersama 1 Muharram', cuti: true },
  { bulan: 12, tgl: 24, nama: 'Cuti Bersama Natal', cuti: true },
  { bulan: 12, tgl: 26, nama: 'Cuti Bersama Natal', cuti: true },
  { bulan: 12, tgl: 27, nama: 'Cuti Bersama Natal', cuti: true },
  { bulan: 12, tgl: 30, nama: 'Cuti Bersama Tahun Baru', cuti: true },
  { bulan: 12, tgl: 31, nama: 'Cuti Bersama Tahun Baru', cuti: true },
];

// Tahun 2025 (estimasi, akan diupdate saat Kepres resmi keluar)
export const LIBUR_2025 = [
  { bulan: 1, tgl: 1, nama: 'Tahun Baru Masehi' },
  { bulan: 1, tgl: 29, nama: 'Tahun Baru Imlek 2576' },
  { bulan: 3, tgl: 30, nama: 'Wafat Isa Almasih (Jumat Agung)' },
  { bulan: 3, tgl: 31, nama: 'Hari Raya Idul Fitri 1446 H' },
  { bulan: 4, tgl: 1, nama: 'Hari Raya Idul Fitri 1446 H (kedua)' },
  { bulan: 5, tgl: 8, nama: 'Kenaikan Isa Almasih' },
  { bulan: 5, tgl: 12, nama: 'Hari Waisak 2569' },
  { bulan: 6, tgl: 6, nama: 'Hari Raya Idul Adha 1446 H' },
  { bulan: 6, tgl: 27, nama: 'Tahun Baru Hijriah 1447 H / 1 Muharram' },
  { bulan: 8, tgl: 17, nama: 'Hari Kemerdekaan RI ke-80' },
  { bulan: 9, tgl: 5, nama: 'Maulid Nabi Muhammad SAW' },
  { bulan: 12, tgl: 25, nama: 'Hari Natal' },
  // Cuti bersama (estimasi)
  { bulan: 1, tgl: 28, nama: 'Cuti Bersama Imlek', cuti: true },
  { bulan: 3, tgl: 28, nama: 'Cuti Bersama Jumat Agung', cuti: true },
  { bulan: 3, tgl: 29, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 2, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 3, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 4, tgl: 4, nama: 'Cuti Bersama Idul Fitri', cuti: true },
  { bulan: 6, tgl: 5, nama: 'Cuti Bersama Idul Adha', cuti: true },
  { bulan: 6, tgl: 26, nama: 'Cuti Bersama 1 Muharram', cuti: true },
  { bulan: 12, tgl: 24, nama: 'Cuti Bersama Natal', cuti: true },
  { bulan: 12, tgl: 26, nama: 'Cuti Bersama Natal', cuti: true },
];

/* Gabungkan libur tetap + per tahun */
export function getLiburNasional(tahun) {
  const liburTahun = {
    2024: LIBUR_2024,
    2025: LIBUR_2025,
  }[tahun] || [];

  // Selalu tambahkan libur tetap (beberapa sudah ada di data tahunan, tapi aman)
  const tetap = [
    { bulan: 1, tgl: 1, nama: 'Tahun Baru Masehi' },
    { bulan: 8, tgl: 17, nama: 'Hari Kemerdekaan RI' },
    { bulan: 12, tgl: 25, nama: 'Hari Natal' },
  ];

  const semua = [...liburTahun, ...tetap];

  // Dedup berdasarkan bulan+tgl
  const unik = [];
  const seen = new Set();
  for (const l of semua) {
    const key = `${l.bulan}-${l.tgl}`;
    if (!seen.has(key)) {
      seen.add(key);
      unik.push(l);
    }
  }

  // Urutkan
  return unik.sort((a, b) => {
    if (a.bulan !== b.bulan) return a.bulan - b.bulan;
    return a.tgl - b.tgl;
  });
}

/* Cari libur untuk tanggal tertentu (Masehi) */
export function cariLiburNasional(tahun, bulan, tgl) {
  const libur = getLiburNasional(tahun);
  return libur.find((l) => l.bulan === bulan && l.tgl === tgl);
}

/* Cek apakah tanggal adalah libur/ cuti nasional */
export function isLiburNasional(tahun, bulan, tgl) {
  return !!cariLiburNasional(tahun, bulan, tgl);
}
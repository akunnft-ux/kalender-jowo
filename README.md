# Pawukon Kita — Kalender Jawa & Primbon Praktis

Webapp ringan untuk kalender Jawa, weton, neptu, dan selamatan wafat. Tanpa framework, tanpa backend, tanpa iklan. Berjalan sepenuhnya di peramban (client-side).

## Fitur
- **Kalender Jawa** (`#/kalender`): kalender bulanan Masehi ⇄ Jawa dengan weton tiap hari, nogo dino/joyo dino, nogo tahun, hari besar, panel detail, salin ringkasan, lompat ke tanggal.
- **Weton & Neptu** (`#/weton`): hitung weton & neptu dari tanggal Masehi, opsi sebelum/sesudah Maghrib, wetonan berikutnya (selapan 35 hari).
- **Hari Wafat** (`#/wafat`): hitung selamatan 3/7/40/100/1000 hari, malam pelaksanaan, hitung mundur, cetak, unduh `.ics`, hitungan tambahan (pendak 1 & 2).
- **Data Referensi** (`#/data`): seluruh isi Excel (neptu, nogo, windu, sandi 12 kata, rumus wafat, sumber).
- **Tentang** (`#/tentang`): istilah, mode Sultan Agungan vs Aboge, disclaimer lengkap, sumber.

## Stack
HTML + CSS + JavaScript murni (ES2020, ES Modules). Tanpa framework, tanpa bundler, tanpa npm build, tanpa CDN wajib.

Semua aritmetika tanggal pakai **JDN (Julian Day Number) integer** (bukan `Date`) untuk menghindari bug zona waktu/DST.

## Struktur Repositori
```
/index.html              shell SPA, router hash
.nojekyll
README.md
LICENSE
css/tokens.css, base.css, layout.css, pages.css
js/main.js               router + registry halaman
js/core/julian.js, kalenderJawa.js, weton.js, wafat.js   perhitungan murni (tanpa DOM)
js/data/neptu.js, nogo.js, windu.js, sandiBulan.js, hariBesar.js
js/ui/kalender.js, weton.js, wafat.js, data.js, tentang.js
js/util/dom.js, format.js, state.js
tests/index.html, tests/vectors.js
assets/favicon.svg
```

## Cara Jalan Lokal

ES Modules tidak berjalan lewat `file://`. Jalankan server statis:

```bash
cd kalender-jowo
python3 -m http.server 8080
```

Buka `http://localhost:8080/`.

## Cara Deploy ke GitHub Pages

1. Push ke branch `main`.
2. Di repository Settings → Pages, pilih source branch `main`, root `/`.
3. Aplikasi akan tersedia di `https://<user>.github.io/<repo>/`.
4. Karena semua path relatif (`./js/main.js`, `./css/...`), aman di sub-path `/<repo>/`.

Pastikan file `.nojekyll` ada di root (supaya GitHub Pages tidak memproses dengan Jekyll).

## Keputusan Implementasi

- Fitur **jodoh dihapus** (non-aktif di rilis ini) sesuai permintaan.
- Data disimpan sebagai modul `.js` yang `export` (bukan `.json` via fetch) untuk menghindari race/CORS.
- Mode kalender default: **Sultan Agungan** (kurup otomatis Aboge → Asapon → Anenhing). Aboge tersedia lewat toggle.
- Penyimpanan preferensi (tema, mode kalender) pakai `localStorage` dengan `try/catch` (diabaikan jika gagal, mis. private mode).
- Tanggal di luar rentang 1900–2100 ditangani dengan pesan ramah, bukan error.
- Tanpa `eval`, tanpa `innerHTML` dengan input pengguna (`textContent` / helper `h()`).

## Cara Menambah Fitur / Data

### Tambah halaman baru
1. Buat `js/ui/<nama>.js` dengan export `render(root, params)`.
2. Daftarkan di `routes` dalam `js/main.js`:
   ```js
   const routes = {
     '#/kalender': renderKalender,
     '#/<nama>': render<Nama>,
     // ...
   };
   ```
3. (Opsional) Tambahkan nav di `index.html` dan `css/layout.css`.

### Tambah data
Edit modul di `js/data/*.js` (export konstanta). Tidak perlu fetch.

### Menambah test vector
Tambah ke `tests/vectors.js`, lalu buka `tests/index.html`.

## Kriteria Penerimaan (DoD)
- Semua test §9 PASS di `tests/index.html`.
- Semua halaman berfungsi tanpa error console, tanpa jaringan eksternal.
- Lighthouse mobile: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Layar 360px tanpa scroll horizontal.
- Aset awal (tanpa gambar) < 150 KB tergzip.
- Deploy GitHub Pages dari sub-path `/<repo>/` tanpa link putus.

## Disclaimer
Primbon adalah warisan budaya dan bukan kepastian ilmiah. Lihat halaman `#/tentang` untuk disclaimer lengkap.

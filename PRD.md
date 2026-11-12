# PRD — Kalender Jawa, Weton, Jodoh & Hitung Hari Wafat

> **Untuk AI agent (OpenCode dkk).** Dokumen ini adalah spesifikasi tunggal. Bangun aplikasi persis sesuai isi dokumen. Jika ada hal yang tidak tertulis, pilih opsi paling sederhana yang konsisten dengan dokumen, lalu catat keputusanmu di `README.md` bagian "Keputusan Implementasi". **Jangan menambah fitur di luar cakupan.**

- **Nama produk (working title):** *Pawukon Kita* — Kalender Jawa & Primbon Praktis (boleh diganti pemilik)
- **Bahasa UI:** Bahasa Indonesia (istilah Jawa dipertahankan, diberi penjelasan singkat)
- **Stack:** HTML + CSS + JavaScript murni (ES2020, ES Modules). **Tanpa framework, tanpa bundler, tanpa npm build, tanpa CDN wajib.**
- **Hosting:** GitHub Pages (static, branch `main`, root `/`)
- **Sumber data awal:** `tanggal_jowo.xls` (dikonversi menjadi modul data JS, lihat §4)

---

## 1. Latar Belakang & Tujuan

Banyak orang Jawa menghitung weton, hari baik, jodoh, dan selamatan wafat secara manual atau lewat situs penuh iklan. Produk ini adalah satu webapp ringan, offline-capable, tanpa backend, yang:

1. Menampilkan **kalender Jawa** (Masehi ⇄ Jawa) per bulan dengan weton tiap hari.
2. Menghitung **weton & neptu** dari tanggal Masehi.
3. Menghitung **selamatan wafat**: 7 hari, 40 hari, 100 hari, 1000 hari (plus opsional 3 hari & pendak).
4. Mencocokkan **jodoh berdasarkan weton** dua orang.
5. Menyajikan **data referensi** dari file Excel (neptu, nogo dino, nogo tahun, tabel tahun Aboge/Asapon).

### Non-Goals (JANGAN dibuat)
Login/akun, backend/database, iklan, ramalan nasib umum (zodiak, shio), penanggalan Hijriah penuh, Wuku/Pawukon (Fase 2), notifikasi push, terjemahan bahasa lain.

### Persona
| Persona | Kebutuhan | Perangkat |
|---|---|---|
| Keluarga yang sedang berduka | Tahu kapan tahlilan 7/40/100/1000 hari, cepat & jelas | HP |
| Calon pengantin / orang tua | Cek kecocokan weton, baca tafsir | HP |
| Orang yang ingin tahu weton hari ini | Lihat kalender Jawa & nogo dino | HP / laptop |

**Prioritas desain: mobile-first** (mayoritas pengguna di HP, koneksi bisa lambat).

---

## 2. Prinsip Budaya & Disclaimer (WAJIB tampil)

Primbon adalah warisan budaya dan **bukan kepastian ilmiah**. Tampilkan disclaimer ringkas di halaman Jodoh dan Wafat, dan halaman `#/tentang` memuat versi lengkap:

> "Hasil perhitungan ini mengikuti tradisi primbon Jawa dan bersifat informatif/budaya. Berbagai daerah dan sumber memiliki variasi hitungan. Gunakan sebagai bahan pertimbangan, bukan penentu keputusan. Untuk acara keagamaan, ikuti arahan tokoh agama/sesepuh keluarga."

Nada teks: hormat, netral, tidak menakut-nakuti. Tafsir negatif (mis. *Pegat*, *Sujanan*) ditulis dengan bahasa lembut dan selalu disertai saran ("perbanyak musyawarah dan doa").

---

## 3. Struktur Repositori

```
/
├── index.html              # shell SPA (header, nav, <main id="app">, footer)
├── .nojekyll               # kosong
├── README.md               # cara jalan lokal, deploy, keputusan implementasi
├── LICENSE
├── css/
│   ├── tokens.css          # variabel warna/tipografi/spasi + dark mode
│   ├── base.css            # reset, tipografi, form, tombol
│   ├── layout.css          # header, nav, grid, kartu
│   └── pages.css           # gaya khusus tiap halaman (kalender, hasil)
├── js/
│   ├── main.js             # bootstrap, router hash, render halaman
│   ├── core/
│   │   ├── julian.js       # gToJDN, jdnToG, mod, hariOf, pasaranOf
│   │   ├── weton.js        # neptu, weton, nogoDino, nogoTahun
│   │   ├── kalenderJawa.js # toJawa(), jawaToJDN(), modul kurup (sultan/aboge)
│   │   ├── wafat.js        # hitungSelamatan()
│   │   └── jodoh.js        # hitungJodoh()
│   ├── data/               # DATA sebagai modul JS (BUKAN fetch JSON, lihat §4.0)
│   │   ├── neptu.js
│   │   ├── nogo.js
│   │   ├── windu.js
│   │   ├── jodoh.js
│   │   ├── sandiBulan.js
│   │   └── hariBesar.js
│   ├── ui/
│   │   ├── kalender.js  ├── weton.js  ├── wafat.js
│   │   ├── jodoh.js     ├── data.js   └── tentang.js
│   └── util/
│       ├── dom.js       # h(tag, attrs, ...children), qs(), on()
│       ├── format.js    # tanggal Indonesia, ekspor teks
│       └── state.js     # state mode & preferensi (localStorage dengan try/catch)
├── tests/
│   ├── index.html      # test runner browser tanpa library (assert sederhana)
│   └── vectors.js      # test vector §9
└── assets/
    ├── favicon.svg
    └── og-image.png    # opsional
```

**Aturan teknis:**
- Semua path **relatif** (`./js/main.js`), karena GitHub Pages sering di sub-path `/nama-repo/`.
- `<script type="module" src="./js/main.js">`.
- **Data disimpan sebagai modul `.js` yang `export`**, bukan file `.json` yang di-`fetch`, supaya tidak ada race/CORS dan mudah di-cache. (Catatan: ES Modules tidak jalan lewat `file://`; untuk lokal jalankan `python3 -m http.server 8080`. Tulis di README.)
- Tidak ada dependensi eksternal wajib. Font: tumpukan font sistem. Boleh pakai font lokal (self-hosted) opsional.
- Semua perhitungan tanggal memakai **JDN (Julian Day Number) integer**, **bukan** `Date` untuk aritmetika (hindari bug zona waktu/DST). `Date` hanya untuk membaca "hari ini" dari perangkat.
- Kode ber-JSDoc, fungsi murni di `core/` tanpa akses DOM (agar bisa di-test).

---

## 4. Data dari Excel (`tanggal_jowo.xls`)

### 4.0 Isi file (hasil pembacaan)
File punya 3 sheet; hanya **Sheet1** berisi data. Isinya:

| Blok | Isi |
|---|---|
| Neptu hari | Senin 4, Selasa 3, Rabu 7, Kamis 8, Jumat 6, Sabtu 9, Minggu 5 |
| Neptu pasaran | Wage 4, Kliwon 8, Legi 5, Pahing 9, Pon 7 |
| Nogo tahun | Wetan: suro, safar, mulud · Kidul: bakdo mulud, jumadil awal, jumadil akhir · Kulon: rejeb, ruwah, poso · Lor: syawal, selo, besar |
| Nogo dino | rumus "neptu dino + pasaran"; hasil 1,5,9,13 → wetan; 2,6,10,14 → kidul; 3,7,11,15 → kulon; 4,8,12,16 → lor. Contoh: Senin Pahing 4+9=13 → nogo dino **wetan**, joyo dino **kulon** |
| Tahun Aboge (windu) | aboge=Rabu Wage (Alip), hakadpon=Ahad Pon (Ehe), ja ah pon=Jumat Pon (Jimawal), jasahing=Selasa Pahing (Je), daltugi=Sabtu Legi (Dal), bemesgi=Kamis Legi (Be), wanenwon=Senin Kliwon (Wawu), ja ah ge=Jumat Wage (Jimakir) |
| Daftar sandi 12 kata | romjiji, parluji, walpatmo, ukhir nem mo, dawaltupat, dikirlupat, jeblulu, banmolu, don nem lu, waljiro, dahroji, jahpatji |

**Normalisasi ejaan (wajib):** `seloso`→Selasa, `kemis`→Kamis, `ahad`→Minggu/Ahad, `senen`→Senin, `rabu/rebo`→Rabu, `bakdo mulud`→Bakda Mulud, `poso`→Pasa, `selo`→Sela, `jumadil awal/akhir`→Jumadilawal/Jumadilakir.

**Catatan penting — daftar 12 "sandi" (romjiji dst.):** maknanya **belum terdekode** dari file (kemungkinan sandi/jembatan keledai penentu hari pertama tiap bulan, 12 kata = 12 bulan). **Jangan menebak maknanya.** Simpan apa adanya di `sandiBulan.js` dengan flag `terverifikasi:false`, tampilkan di halaman Data dalam kartu "Catatan mentah (belum dijelaskan)". Mesin kalender **tidak boleh bergantung** pada data ini (awal bulan dihitung aritmetis, §5.4).

### 4.1 `js/data/neptu.js`
```js
export const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']; // index = JDN mod 7
export const PASARAN = ['Legi','Pahing','Pon','Wage','Kliwon'];               // index = JDN mod 5
export const NEPTU_HARI = { Senin:4, Selasa:3, Rabu:7, Kamis:8, Jumat:6, Sabtu:9, Minggu:5 };
export const NEPTU_PASARAN = { Legi:5, Pahing:9, Pon:7, Wage:4, Kliwon:8 };
```

### 4.2 `js/data/nogo.js`
```js
export const ARAH = ['Wetan','Kidul','Kulon','Lor'];
// sisa (neptu dino + neptu pasaran) mod 4 → arah nogo dino
export const NOGO_DINO_SISA = { 1:'Wetan', 2:'Kidul', 3:'Kulon', 0:'Lor' };
export const JOYO_DINO = { Wetan:'Kulon', Kulon:'Wetan', Kidul:'Lor', Lor:'Kidul' }; // arah berlawanan
// nogo tahun per bulan Jawa (nomor bulan 1..12)
export const NOGO_TAHUN = {1:'Wetan',2:'Wetan',3:'Wetan', 4:'Kidul',5:'Kidul',6:'Kidul',
                           7:'Kulon',8:'Kulon',9:'Kulon', 10:'Lor',11:'Lor',12:'Lor'};
```

### 4.3 `js/data/windu.js`
```js
export const NAMA_TAHUN = ['Alip','Ehe','Jimawal','Je','Dal','Be','Wawu','Jimakir'];
export const TAHUN_PANJANG = [false,true,false,false,true,false,false,true]; // Ehe, Dal, Jimakir = 355 hari
export const NAMA_BULAN = ['Sura','Sapar','Mulud','Bakda Mulud','Jumadilawal','Jumadilakir',
                           'Rejeb','Ruwah','Pasa','Sawal','Sela','Besar'];
// Sandi tahun Aboge (dari Excel)
export const SANDI_ABOGE = [
  {tahun:'Alip',    sandi:'Aboge',     hari:'Rabu',   pasaran:'Wage'},
  {tahun:'Ehe',     sandi:'Hakadpon',  hari:'Minggu', pasaran:'Pon'},
  {tahun:'Jimawal', sandi:'Jaahpon',   hari:'Jumat',  pasaran:'Pon'},
  {tahun:'Je',      sandi:'Jasahing',  hari:'Selasa', pasaran:'Pahing'},
  {tahun:'Dal',     sandi:'Daltugi',   hari:'Sabtu',  pasaran:'Legi'},
  {tahun:'Be',      sandi:'Bemesgi',   hari:'Kamis',  pasaran:'Legi'},
  {tahun:'Wawu',    sandi:'Wanenwon',  hari:'Senin',  pasaran:'Kliwon'},
  {tahun:'Jimakir', sandi:'Jaahge',    hari:'Jumat',  pasaran:'Wage'},
];
// Sandi tahun Asapon (hasil turunan, ditampilkan sebagai pembanding)
export const SANDI_ASAPON = [
  {tahun:'Alip',    hari:'Selasa', pasaran:'Pon'},
  {tahun:'Ehe',     hari:'Sabtu',  pasaran:'Pahing'},
  {tahun:'Jimawal', hari:'Kamis',  pasaran:'Pahing'},
  {tahun:'Je',      hari:'Senin',  pasaran:'Legi'},
  {tahun:'Dal',     hari:'Jumat',  pasaran:'Kliwon'},
  {tahun:'Be',      hari:'Rabu',   pasaran:'Kliwon'},
  {tahun:'Wawu',    hari:'Minggu', pasaran:'Wage'},
  {tahun:'Jimakir', hari:'Kamis',  pasaran:'Pon'},
];
```
(Kedua tabel sudah diverifikasi: tiap tahun = tahun sebelumnya + 354/355 hari, siklus windu = 2835 hari = tepat 405 pekan = 567 pasaran.)

### 4.4 `js/data/jodoh.js` — lihat §7.3 (tafsir lengkap).
### 4.5 `js/data/hariBesar.js` (opsional, informatif)
```js
// bulan, tanggal Jawa, nama
export const HARI_BESAR = [
  {bulan:1,  tgl:1,  nama:'1 Sura (Tahun Baru Jawa)'},
  {bulan:3,  tgl:12, nama:'Maulud / Grebeg Mulud'},
  {bulan:9,  tgl:1,  nama:'1 Pasa (awal puasa, menurut hitungan Jawa)'},
  {bulan:10, tgl:1,  nama:'1 Sawal (Bakda/Lebaran, menurut hitungan Jawa)'},
  {bulan:12, tgl:10, nama:'Grebeg Besar (Idul Adha)'},
];
```
Beri catatan UI: "Penetapan hari raya resmi (pemerintah/ormas) bisa berbeda 1–2 hari dari hitungan Jawa."

---

## 5. Mesin Perhitungan (core) — SPESIFIKASI PERSIS

### 5.1 Julian Day Number
- `gToJDN(y,m,d)` dan `jdnToG(jdn)` (kalender Gregorian proleptik) — implementasi di Lampiran A.
- Hari: `HARI[ mod(jdn,7) ]` (0=Senin). Pasaran: `PASARAN[ mod(jdn,5) ]` (0=Legi). `mod(a,n)=((a%n)+n)%n`.
- Rentang didukung: **1 Jan 1900 – 31 Des 2100**. Di luar itu tampilkan pesan ramah, jangan error.

### 5.2 Weton & Neptu
- `neptu(jdn) = NEPTU_HARI[hari] + NEPTU_PASARAN[pasaran]` (rentang 7–18).
- `weton(jdn) = "<Hari> <Pasaran>"` mis. "Senin Legi".

### 5.3 Pergantian hari Jawa (Maghrib)
Dalam tradisi Jawa **hari baru dimulai saat Maghrib**. Maka untuk input peristiwa (lahir/wafat):
- Pengguna memilih **"Sebelum Maghrib"** (default) atau **"Sesudah Maghrib"**.
- Jika sesudah Maghrib: `jdnEfektif = jdn + 1` (weton memakai hari berikutnya).
- UI harus menjelaskan dengan satu kalimat + ikon info. Tidak perlu input jam presisi (Maghrib ±18:00, tanpa geolokasi).

### 5.4 Kalender Jawa — konversi Masehi → Jawa

Tahun Jawa-Islam (Sultan Agungan): 1 tahun = 12 bulan; bulan ganjil 30 hari, bulan genap 29 hari; bulan ke-12 (Besar) = 30 hari pada tahun panjang (*wuntu*: Ehe, Dal, Jimakir). Tahun = 354 hari (*wastu*) atau 355 hari (*wuntu*). **Windu = 8 tahun = 2835 hari.** **Kurup = 15 windu (120 tahun) dikurangi 1 hari = 42524 hari** antar-awal kurup.

**Dua mode (toggle di UI, simpan di localStorage):**

| Mode | Nama UI | Perilaku |
|---|---|---|
| `sultan` (**default**) | "Sultan Agungan (Kraton / Asapon)" | Memilih kurup otomatis berdasarkan tanggal: Aboge (s.d. 23 Mar 1936), **Asapon** (24 Mar 1936 –), kurup berikutnya Anenhing mulai 42524 hari setelah Asapon. Ini yang dipakai Kraton Yogyakarta/Surakarta. |
| `aboge` | "Aboge (komunitas Islam Aboge)" | Alip = Rabu Wage dipakai terus tanpa pergeseran kurup, sesuai catatan Excel. Hasil sekarang berselisih **+1 hari** terhadap mode Sultan Agungan. |

**Jangkar:** `1 Sura 1867 Alip` = **Selasa Pon, 24 Maret 1936** = `ASAPON_ANCHOR` (JDN). 
`KURUP_DAYS = 42524`. Awal kurup ke-k = `ASAPON_ANCHOR + k * KURUP_DAYS` (k=-1 Aboge/1747 Alip, 0 Asapon/1867, +1 Anenhing/1987). Mode `aboge`: awal tetap `ASAPON_ANCHOR - KURUP_DAYS` (1 Sura 1747 Alip, Rabu Wage) dan windu terus berulang.

**Algoritma `toJawa(jdn, mode)`:**
1. Tentukan `start` & `tahunDasar` (sesuai mode di atas; untuk sultan: `k=floor((jdn-ANCHOR)/KURUP_DAYS)`, `start=ANCHOR+k*KURUP_DAYS`, `tahunDasar=1867+120*k`).
2. `n = jdn - start`; `windu = floor(n/2835)`; `n -= windu*2835`.
3. Telusuri 8 tahun (354/355 hari) → indeks tahun `yi`, sisa `n`.
4. Telusuri 12 bulan (30/29, bulan 12 = 30 bila tahun panjang) → indeks bulan `bi`, `tgl = n+1`.
5. `tahun = tahunDasar + windu*8 + yi`; `namaTahun = NAMA_TAHUN[yi]`.
6. Kembalikan `{tahun, namaTahun, bulan(1..12), namaBulan, tgl, hari, pasaran, neptu}`.

Kode acuan lengkap & teruji ada di **Lampiran A** — gunakan sebagai basis, boleh dirapikan tapi **hasilnya harus lulus semua test vector §9**.

> Catatan fakta: Kurup berlaku Aboge (Alip Rabu Wage), lalu Asapon (Alip Selasa Pon, sejak 1867 J/1936 M), lalu Anenhing (Alip Senin Pahing, sejak 1987 J). Banyak komunitas (Banyumas, Cilacap, dll.) masih memakai Aboge, itulah alasan toggle disediakan.

### 5.5 Nogo Dino & Nogo Tahun
- `nogoDino(jdn)`: `s = mod(neptu(jdn),4)` → `NOGO_DINO_SISA[s]`; `joyo = JOYO_DINO[nogo]`.
- `nogoTahun(bulanJawa)` → `NOGO_TAHUN[bulan]`.
- Teks penjelasan UI: *"Nogo dino: arah yang sebaiknya dihindari untuk bepergian/hajat pada hari itu. Joyo dino: arah yang dianggap baik (berlawanan)."* Tampilkan keduanya di panel detail hari.

---

## 6. Fitur Halaman 1–2: Kalender & Weton

### F1 — Kalender Jawa (`#/kalender`) — halaman default
**Layout (mobile):**
```
[‹]  November 2026  [›]   [Hari ini]
Jawa: Jumadilawal–Jumadilakir 1960 Be     [Mode: Sultan Agungan ▾]
Sen Sel Rab Kam Jum Sab Min
 .   .   .   .   .   .   1        ← sel: angka Masehi (besar)
                              Jawa: tgl + pasaran (kecil)
...
[Panel detail hari terpilih — slide-up sheet di HP, sidebar di desktop]
```
**Kebutuhan:**
- Grid 7 kolom, minggu mulai **Senin** (toggle opsional Minggu). Setiap sel: tanggal Masehi, tanggal Jawa (mis. `1 Jml.Akhir`), pasaran (singkatan Leg/Pah/Pon/Wag/Kli). Hari ini diberi penanda jelas.
- Header menampilkan rentang bulan Jawa & tahun Jawa + nama tahun di bulan itu (jika bulan Masehi mencakup 2 bulan Jawa, tulis keduanya; jika 2 tahun Jawa, tulis keduanya).
- Navigasi: bulan ±1, tombol "Hari ini", pemilih bulan/tahun (select), **lompat ke tanggal** (input date). Keyboard: panah menggeser fokus sel, PageUp/PageDown ganti bulan, Enter membuka detail.
- **Panel detail** saat sel diklik: tanggal lengkap Masehi & Jawa (mis. "Kamis Pon, 12 November 2026 = 1 Jumadilakir 1960 Be"), weton, neptu (rincian hari+pasaran), nogo dino + joyo dino, nogo tahun bulan itu, hari besar Jawa bila ada, tombol **"Salin ringkasan"** (teks siap WhatsApp) dan **"Hitung wafat dari tanggal ini"** (pindah ke F3 dengan tanggal terisi).
- Hari besar (§4.5) ditandai dengan titik berwarna + legenda. Hari **1 Sura** ditandai khusus.
- Warna pasaran opsional (5 warna lembut) agar pola 5 harian terlihat; **tidak boleh** hanya mengandalkan warna (selalu ada teks).

### F2 — Weton & Neptu (`#/weton`)
- Input: tanggal Masehi (type=date, min 1900-01-01, max 2100-12-31) + radio Sebelum/Sesudah Maghrib. Tombol "Pakai hari ini".
- Output kartu: Weton, neptu hari + pasaran = total, tanggal Jawa, nama tahun, **nogo dino/joyo dino**, "Wetonan berikutnya" (35 hari/selapan: tampilkan 3 tanggal berikutnya yang wetonnya sama, `jdn + 35*i`).
- Tombol salin & bagikan (URL hash membawa parameter, mis. `#/weton?d=2000-01-01&m=s`).

---

## 7. Fitur Halaman 3–4: Hari Wafat & Jodoh

### F3 — Hitung Hari Wafat (`#/wafat`)  ⭐ fitur inti

**Input:** tanggal wafat (Masehi), radio Sebelum/Sesudah Maghrib, toggle "Tampilkan hitungan tambahan (3 hari, pendak)" default mati.

**Aturan hitung (sudah diverifikasi):** hari wafat dihitung sebagai **hari ke-1**. Jadi hari ke-N = `jdnEfektif + (N - 1)`.

| Peringatan | Istilah Jawa | N | Offset | "Rumus sarma" (pengecekan) |
|---|---|---|---|---|
| 3 hari (opsional) | Nelung dina | 3 | +2 | hari ke-3, pasaran ke-3 |
| **7 hari** | Mitung dina | 7 | +6 | tusaro: hari ke-7, pasaran ke-2 |
| **40 hari** | Matang puluh dina | 40 | +39 | masarma: hari ke-5, pasaran ke-5 |
| **100 hari** | Nyatus | 100 | +99 | rosarma: hari ke-2, pasaran ke-5 |
| **1000 hari** | Nyewu | 1000 | +999 | nemsarma: hari ke-6, pasaran ke-5 |

Rumus sarma adalah cara tradisional menyatakan hasil yang sama: *hari ke-a* dan *pasaran ke-b* dihitung **inklusif** dari weton wafat (`hariTarget = hariWafat + (a-1)`, `pasaranTarget = pasaranWafat + (b-1)`). Untuk N=7/40/100/1000, `(N-1) mod 7 = a-1` dan `(N-1) mod 5 = b-1`, sehingga kedua cara **selalu identik**. Implementasi menghitung dengan offset, lalu **assert** bahwa weton hasil sama dengan hasil rumus sarma (di test, bukan di runtime).

**Output per peringatan (kartu):**
- Nama peringatan + N hari, **Weton sasaran** (mis. "Minggu Wage"), tanggal Masehi lengkap, tanggal Jawa (bulan + tahun).
- **Malam pelaksanaan:** tahlilan/selamatan lazimnya diadakan pada **malam** menjelang hari sasaran (karena hari Jawa dimulai Maghrib), mis. hari sasaran *Jumat Pon* → malam pelaksanaan = **Kamis malam (malam Jumat Pon)**. Tampilkan: *"Malam pelaksanaan: Kamis, 11 Nov (malam Jumat Pon)"*.
- Hitung mundur: "X hari lagi" / "sudah lewat" relatif terhadap hari ini.
- Tombol **Salin semua** (teks rapi), **Cetak** (`window.print()`, CSS `@media print` bersih: hanya hasil), **Tambah ke kalender** (unduh `.ics` dibuat di klien, event all-day pada hari sasaran, judul "Selamatan 7 hari — <nama>").
- Input nama almarhum (opsional, tidak disimpan ke mana pun, hanya untuk judul hasil/ics).

**Hitungan tambahan (toggle):** Nelung dina (3 hari); **Mendak sepisan** (pendak 1) & **Mendak pindho** (pendak 2): tanggal & bulan Jawa wafat yang sama pada tahun Jawa +1 dan +2 (jika tanggal 30 tidak ada di bulan itu, pakai tanggal terakhir bulan). Beri label "variasi daerah: sebagian keluarga memakai 354/708 hari". Terapkan konversi balik `jawaToJDN()` (cari jdn pada tahun/bulan/tgl target via perhitungan dari `start` kurup).

**Catatan fakta yang ditampilkan (info kecil):** beberapa sumber populer menghitung 3/7/40/100/1000 hari dari hari wafat sebagai hari pertama; variasi lokal ada. Cantumkan di "Cara hitung" (accordion).

**Contoh uji (lihat §9):** wafat Senin Pon, 6 Feb 2023 → 7 hari Minggu Wage 12 Feb 2023; 40 hari Jumat Pahing 17 Mar 2023; 100 hari Selasa Pahing 16 Mei 2023; 1000 hari Sabtu Pahing 1 Nov 2025.

### F4 — Pencocokan Jodoh Weton (`#/jodoh`)

**Input (dua pihak: "Calon Pria" & "Calon Wanita" — label netral "Pihak 1 / Pihak 2" boleh, urutan tidak mempengaruhi hasil):**
- Pilih mode: **(a) dari tanggal lahir** (+ radio Maghrib) atau **(b) pilih weton langsung** (dropdown Hari × Pasaran, 35 kombinasi valid).
- Tampilkan weton & neptu masing-masing secara langsung saat input berubah.

**Metode 1 — Petung Jodoh Pegat–Pesthi (UTAMA, default):**
`total = neptu1 + neptu2`; `sisa = total mod 8`; peta: 1 Pegat, 2 Ratu, 3 Jodoh, 4 Topo, 5 Tinari, 6 Padu, 7 Sujanan, 0 → **Pesthi**.

**Metode 2 — Petung Wasesa Segara (PEMBANDING, tampil sebagai kartu kedua):**
`sisa = total mod 7`; 1 Wasesa Segara, 2 Tunggak Semi, 3 Satria Wibawa, 4 Sumur Sinaba, 5 Satria Wirang, 6 Bumi Kapetak, 0 Lebu Katiup Angin.

**Output:** kartu hasil Metode 1 (judul besar + skor tipe "baik/perlu kehati-hatian/..." berupa label teks + ikon, **bukan** persentase palsu), ringkasan tafsir 2–3 kalimat, saran. Kartu kedua Metode 2 lebih kecil. Tampilkan rincian hitung: `Rabu Kliwon (7+8=15) + Senin Pahing (4+9=13) = 28 → 28 mod 8 = 4 → Topo`. Tombol salin/bagikan (hash param). Disclaimer §2 tampil di bawah hasil.

### 7.3 `js/data/jodoh.js`
```js
export const PEGAT_PESTHI = {
  1:{nama:'Pegat',  tingkat:'waspada',
     ringkas:'Rawan perselisihan yang berlarut atau perpisahan.',
     saran:'Perbanyak musyawarah, doa, dan keterbukaan; libatkan sesepuh bila perlu.'},
  2:{nama:'Ratu',   tingkat:'baik',
     ringkas:'Dihormati dan dimuliakan; rumah tangga cenderung berwibawa dan disegani.',
     saran:'Jaga kerendahan hati dan saling menghargai.'},
  3:{nama:'Jodoh',  tingkat:'baik',
     ringkas:'Serasi; saling menerima dan mudah menyelaraskan.',
     saran:'Rawat komunikasi agar kecocokan tetap terjaga.'},
  4:{nama:'Topo',   tingkat:'sedang',
     ringkas:'Awal pernikahan cenderung penuh ujian, lalu membaik seiring waktu.',
     saran:'Bersabar dan kuat di tahun-tahun awal; bangun kebiasaan baik bersama.'},
  5:{nama:'Tinari', tingkat:'baik',
     ringkas:'Kebahagiaan dan kemudahan rezeki.',
     saran:'Syukuri dan manfaatkan rezeki dengan bijak.'},
  6:{nama:'Padu',   tingkat:'sedang',
     ringkas:'Sering berbeda pendapat, biasanya soal sepele, tetapi tidak sampai berpisah.',
     saran:'Latih mengalah dan bicara tenang saat berbeda pandangan.'},
  7:{nama:'Sujanan',tingkat:'waspada',
     ringkas:'Rawan pertengkaran besar yang kerap dikaitkan dengan godaan pihak ketiga.',
     saran:'Utamakan kejujuran, batasan yang jelas, dan komitmen bersama.'},
  0:{nama:'Pesthi', tingkat:'baik',
     ringkas:'Rukun, tenteram, dan damai hingga hari tua.',
     saran:'Pertahankan kerukunan dan saling menjaga.'},
};
export const WASESA_SEGARA = {
  1:{nama:'Wasesa Segara',  ringkas:'Sabar, pemaaf, berbudi luhur, berwibawa.'},
  2:{nama:'Tunggak Semi',   ringkas:'Rezeki mudah dan keturunan berkembang.'},
  3:{nama:'Satria Wibawa',  ringkas:'Dihormati dan mendapat kedudukan baik.'},
  4:{nama:'Sumur Sinaba',   ringkas:'Menjadi tempat bertanya/bersandar banyak orang.'},
  5:{nama:'Satria Wirang',  ringkas:'Rentan kesulitan dan rasa malu; perlu kehati-hatian.'},
  6:{nama:'Bumi Kapetak',   ringkas:'Banyak ujian hidup; perlu ketabahan.'},
  0:{nama:'Lebu Katiup Angin', ringkas:'Rentan goyah/tidak stabil; perlu pegangan kuat.'},
};
```
> **Catatan variasi sumber:** sebagian situs memakai tabel "kelipatan 9" (mis. Pesthi = 8, 17, 26, 35) alih-alih sisa pembagian 8. Produk ini **memakai sisa mod 8** (konsisten dan terdefinisi untuk semua jumlah). Cantumkan satu kalimat "variasi hitungan" di halaman Tentang. Pemilik dapat memutuskan metode lain di Fase 2 (lihat §12).

---

## 8. Halaman 5–6: Data & Tentang

### F5 — Data Referensi (`#/data`)
Tab/akordeon yang menampilkan **seluruh isi Excel secara rapi** (sumber kebenaran data):
1. Neptu hari & pasaran (tabel + total contoh).
2. Nogo dino (tabel sisa→arah, joyo dino) + contoh hitung.
3. Nogo tahun (4 arah × 3 bulan).
4. Tahun Aboge (8 baris sandi + hari-pasaran) **dibandingkan** dengan Asapon (kolom kedua) + keterangan kurup.
5. Rumus selamatan wafat (tabel §7 F3).
6. Kartu "Catatan mentah (belum dijelaskan)": daftar 12 sandi. Teks: *"Daftar ini berasal dari catatan sumber dan belum dijelaskan maknanya; tidak dipakai dalam perhitungan."*
7. Daftar sumber (§11).

Fitur: kolom pencarian sederhana (filter teks) dan tombol "Unduh data (JSON)" yang membuat berkas dari modul data di klien.

### F6 — Tentang (`#/tentang`)
Penjelasan singkat apa itu weton/neptu/pasaran/windu/kurup, perbedaan Sultan Agungan vs Aboge, disclaimer lengkap (§2), versi aplikasi, tautan repo & sumber, kredit.

---

## 9. Test Vector & Kriteria Penerimaan

Semua nilai di bawah **sudah diverifikasi** dengan implementasi acuan (Lampiran A). Test runner `tests/index.html` harus menampilkan semuanya **PASS**.

### 9.1 Masehi → Hari/Pasaran/Jawa
| Masehi | Hari Pasaran | Mode | Jawa |
|---|---|---|---|
| 1936-03-24 | Selasa Pon | sultan | 1 Sura 1867 Alip |
| 1945-08-17 | Jumat Legi | sultan | 9 Pasa 1876 Ehe |
| 2000-01-01 | Sabtu Legi | sultan | 24 Pasa 1932 Ehe |
| 2024-07-08 | Senin Legi | sultan | 1 Sura 1958 Je |
| 2026-06-17 | Rabu Kliwon | sultan | 1 Sura 1960 Be |
| 2026-06-17 | Rabu Kliwon | aboge | 30 Besar 1959 Dal |
| 2026-11-12 | Kamis Pon | sultan | 1 Jumadilakir 1960 Be |
| 2026-11-12 | Kamis Pon | aboge | 30 Jumadilawal 1960 Be |

### 9.2 Invarian
- Untuk setiap hari 1900-01-01…2100-12-31 (mode sultan): hari berikutnya selalu `tgl+1` (sama bulan/tahun) **atau** `tgl=1` bulan berikutnya/Sura tahun berikutnya. **0 diskontinuitas** (sudah diuji pada implementasi acuan).
- Panjang tahun hanya 354/355; windu = 2835 hari.
- `gToJDN(jdnToG(j)) == j` untuk seluruh rentang.

### 9.3 Wafat (wafat Senin Pon, 2023-02-06, sebelum Maghrib)
| Peringatan | Weton | Masehi |
|---|---|---|
| 3 hari | Rabu Kliwon | 2023-02-08 |
| 7 hari | Minggu Wage | 2023-02-12 |
| 40 hari | Jumat Pahing | 2023-03-17 |
| 100 hari | Selasa Pahing | 2023-05-16 |
| 1000 hari | Sabtu Pahing | 2025-11-01 |

Wafat tanggal sama tetapi **sesudah Maghrib** → hari efektif Selasa Wage (2023-02-07): 7 hari = **Senin Kliwon 2023-02-13**.
Malam pelaksanaan 7 hari (kasus sebelum Maghrib): Sabtu malam (malam Minggu Wage), 2023-02-11.

### 9.4 Weton, Nogo, Jodoh
- Senin Pahing: neptu 4+9=13 → 13 mod 4 = 1 → nogo dino **Wetan**, joyo dino **Kulon**.
- 2026-11-12 (Jumadilakir) → nogo tahun **Kidul**.
- Jodoh: Rabu Kliwon (15) + Senin Pahing (13) = 28 → mod 8 = 4 → **Topo**; mod 7 = 0 → **Lebu Katiup Angin**.
- Jodoh: Selasa Wage (7) + Senin Legi (9) = 16 → mod 8 = 0 → **Pesthi**; mod 7 = 2 → **Tunggak Semi**.
- Jodoh: Sabtu Pahing (18) + Sabtu Pahing (18) = 36 → mod 8 = 4 → **Topo**.

### 9.5 Kriteria Penerimaan (Definition of Done)
1. Semua test §9.1–9.4 PASS di `tests/index.html`.
2. Halaman `#/kalender`, `#/weton`, `#/wafat`, `#/jodoh`, `#/data`, `#/tentang` berfungsi tanpa error console, tanpa permintaan jaringan eksternal.
3. Lighthouse (mobile): Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
4. Berjalan benar di Chrome/Edge/Firefox/Safari terbaru dan Android Chrome; layar 360px tanpa scroll horizontal.
5. Total ukuran aset awal (tanpa gambar) < 150 KB tergzip.
6. Deploy GitHub Pages berhasil dari sub-path `/<repo>/` tanpa memutus link.
7. README berisi: cara jalan lokal, cara deploy, daftar keputusan implementasi, cara menambah data.

---

## 10. UI/UX, Aksesibilitas & Teknis

### 10.1 Navigasi
- Router berbasis **hash** (`#/kalender` dst.) — aman di GitHub Pages tanpa konfigurasi server. Rute tak dikenal → `#/kalender`.
- Navigasi: bar bawah (HP) 5 tab: Kalender · Weton · Wafat · Jodoh · Data; "Tentang" di footer/ikon info. Desktop: nav atas.
- Parameter hasil disimpan di hash (`#/wafat?d=2026-11-12&m=s&n=Bapak`) agar bisa dibagikan. **Jangan** menaruh data sensitif selain yang diketik pengguna; nama opsional dibatasi 40 karakter dan di-escape.

### 10.2 Tema & visual
Nuansa Jawa yang tenang (sogan/krem/emas), bukan ramai. Token di `tokens.css`:
```css
:root{
  --krem:#F6EEDD; --kertas:#FFFDF8; --sogan:#5B3A1E; --sogan-2:#7A5230;
  --emas:#B8862B; --marun:#7A1F1F; --lumut:#3C5A3E; --teks:#2B2118; --garis:#E2D6BC;
  --radius:14px; --shadow:0 2px 10px rgba(60,40,20,.12);
  --font:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --font-judul:Georgia,"Times New Roman",serif;
}
@media (prefers-color-scheme:dark){
  :root{--krem:#1C1712; --kertas:#241E17; --teks:#F1E8D6; --garis:#3B3226; --emas:#D9A441; --sogan:#E2C9A0;}
}
```
Toggle tema manual (terang/gelap/otomatis) disimpan di localStorage (try/catch; jika gagal, abaikan).

### 10.3 Aksesibilitas
- Kontras teks ≥ 4.5:1. Target sentuh ≥ 44px. Fokus terlihat jelas.
- Kalender memakai `role="grid"`, sel `role="gridcell"` dengan `aria-label` lengkap ("Kamis Pon, 12 November 2026, 1 Jumadilakir 1960").
- Hasil perhitungan dalam `aria-live="polite"`. Form berlabel `<label for>`; pesan error spesifik.
- Menghormati `prefers-reduced-motion`.

### 10.4 Validasi & error
- Tanggal kosong/di luar 1900–2100 → pesan inline, bukan alert.
- Tidak ada `eval`, tidak ada `innerHTML` dengan input pengguna (pakai `textContent`/helper `h()`).

### 10.5 SEO & berbagi
`<title>`, `<meta name="description">`, Open Graph dasar, `lang="id"`, favicon SVG. Tag `<noscript>` ringkas ("Aplikasi ini memerlukan JavaScript").

### 10.6 PWA (opsional, Fase 2)
`manifest.webmanifest` + service worker cache-first agar bisa offline. Boleh dilewati di rilis 1.

---

## 11. Referensi (sepaham dengan catatan Excel)

- Rangkaian selamatan wafat (geblag, nelung dina, mitung dina, matang puluh dina, nyatus, mendhak sepisan/pindho, nyewu): detikJateng — "Cara Menghitung 1000 Hari Orang Meninggal Menurut Jawa dan Tradisinya" (2025); jurnal UIN Sunan Kalijaga & Walisongo (eprints.walisongo.ac.id) tentang slametan kematian.
- Rumus sarma (tusaro/masarma/rosarma/nemsarma) dan contoh hitung: KapanLagi "Cara Menghitung Selamatan Orang Meninggal dalam Tradisi Jawa"; Mamikos; Mojok "Menghitung 40, 100, dan 1000 Hari…" (contoh Senin Pon: 7→Minggu Wage, 40→Jumat Pahing, 100→Selasa Pahing). *Catatan:* contoh 1000 hari di Mojok menyebut "Rabu Legi", tidak konsisten dengan rumus nemsarma yang sama dengan sumber itu sendiri; PRD ini mengikuti rumus (hasil Sabtu Pahing).
- Weton jodoh (Pegat, Ratu, Jodoh, Topo, Tinari, Padu, Sujanan, Pesthi; sisa bagi 8): detikJateng "Mengenal Ratu, Weton Jodoh Sejati…"; Popbela "Arti Tinari dalam Hitungan Jawa"; Orami "Cara Menghitung Hari Baik Pernikahan" (Wasesa Segara, sisa bagi 7).
- Kalender Jawa, windu, kurup (Aboge → Asapon 1867 J/24 Maret 1936 → Anenhing 1987 J): Good News From Indonesia "Perbedaan Penanggalan 1 Suro…" dan "Mengenal Kalender Jawa"; ensiklopedia "Kalender Jawa"; Khazin (2004) via jurnal UNISNU; tesis Walisongo tentang Aboge.
- Verifikasi silang: 17 Agustus 1945 = Jumat Legi = 9 Pasa 1876 (9 Ramadan 1364 H); 1 Januari 2000 = Sabtu Legi; 1 Sura 1958 Je = Senin Legi, 8 Juli 2024.

---

## 12. Pertanyaan Terbuka (jangan blokir pengerjaan — pakai default)

1. **Sandi 12 kata** (romjiji…jahpatji): maknanya? Default: ditampilkan sebagai catatan mentah, tidak dipakai.
2. **Mode default kalender**: Sultan Agungan (Asapon) atau Aboge? Default: Sultan Agungan, Aboge tersedia lewat toggle.
3. **Metode jodoh**: pakai mod 8 (default) atau tabel "kelipatan 9"? Default: mod 8.
4. **Nama produk & domain** akhir.

---

## Lampiran A — Kode Acuan Inti (teruji; basis `core/julian.js` & `core/kalenderJawa.js`)

```js
export const HARI=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
export const PASARAN=['Legi','Pahing','Pon','Wage','Kliwon'];
export const NAMA_TAHUN=['Alip','Ehe','Jimawal','Je','Dal','Be','Wawu','Jimakir'];
export const NAMA_BULAN=['Sura','Sapar','Mulud','Bakda Mulud','Jumadilawal','Jumadilakir',
  'Rejeb','Ruwah','Pasa','Sawal','Sela','Besar'];
export const TAHUN_PANJANG=[false,true,false,false,true,false,false,true];

export const mod=(a,n)=>((a%n)+n)%n;

export function gToJDN(y,m,d){
  const a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
export function jdnToG(j){
  const a=j+32044,b=Math.floor((4*a+3)/146097),c=a-Math.floor(146097*b/4),
        d=Math.floor((4*c+3)/1461),e=c-Math.floor(1461*d/4),m=Math.floor((5*e+2)/153);
  return {y:100*b+d-4800+Math.floor(m/10), m:m+3-12*Math.floor(m/10), d:e-Math.floor((153*m+2)/5)+1};
}
export const hariOf=j=>HARI[mod(j,7)];
export const pasaranOf=j=>PASARAN[mod(j,5)];

const WINDU_DAYS=2835;                 // 8 tahun
const KURUP_DAYS=42525-1;              // 15 windu - 1 hari
const ASAPON_ANCHOR=gToJDN(1936,3,24); // 1 Sura 1867 Alip, Selasa Pon

export function toJawa(j,mode='sultan'){
  let start,tahunDasar;
  if(mode==='aboge'){ start=ASAPON_ANCHOR-KURUP_DAYS; tahunDasar=1747; }
  else{ const k=Math.floor((j-ASAPON_ANCHOR)/KURUP_DAYS);
        start=ASAPON_ANCHOR+k*KURUP_DAYS; tahunDasar=1867+120*k; }
  let n=j-start; const windu=Math.floor(n/WINDU_DAYS); n-=windu*WINDU_DAYS;
  let yi=0; for(;;){ const len=TAHUN_PANJANG[yi]?355:354; if(n<len)break; n-=len; yi++; }
  let bi=0; for(;;){ const len=(bi%2===0)?30:(bi===11&&TAHUN_PANJANG[yi]?30:29); if(n<len)break; n-=len; bi++; }
  return {tahun:tahunDasar+windu*8+yi, namaTahun:NAMA_TAHUN[yi],
          bulan:bi+1, namaBulan:NAMA_BULAN[bi], tgl:n+1};
}

// Selamatan: hari wafat = hari ke-1
export function hariKe(jdnWafatEfektif,N){ return jdnWafatEfektif+(N-1); }
```

Fungsi yang masih harus ditulis agent: `jawaToJDN(tahun,bulan,tgl,mode)` (kebalikan `toJawa`, dipakai untuk pendak & lompat tanggal Jawa), `neptu()`, `nogoDino()`, `hitungSelamatan()`, `hitungJodoh()` — semua mengikuti §5–§7.

## Lampiran B — Urutan Pengerjaan untuk Agent

1. **M1 Fondasi:** repo, `index.html`, CSS token, router hash, util DOM. 
2. **M2 Core + Test:** `julian.js`, `kalenderJawa.js`, `weton.js`, `tests/` — lulus §9.1, 9.2, 9.4 sebelum lanjut.
3. **M3 Kalender (F1)** + panel detail + toggle mode.
4. **M4 Weton (F2)**, lalu **M5 Wafat (F3)** (lulus §9.3, termasuk cetak & `.ics`).
5. **M6 Jodoh (F4)**, **M7 Data & Tentang (F5, F6)**.
6. **M8 Polish:** a11y, dark mode, print CSS, Lighthouse, README, deploy Pages.

**Larangan:** jangan pakai framework/library, jangan fetch data eksternal, jangan simpan data pengguna di server, jangan menebak makna "sandi 12 kata", jangan memakai `Date` untuk menjumlah hari.

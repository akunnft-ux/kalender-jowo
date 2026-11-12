/* Format tanggal dan teks untuk UI Indonesia */

const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function formatTanggalIndonesia(y, m, d) {
  return `${d} ${BULAN_ID[m - 1]} ${y}`;
}

export function formatHariTanggal(hari, y, m, d) {
  return `${hari}, ${d} ${BULAN_ID[m - 1]} ${y}`;
}

export function formatWeton(hari, pasaran) {
  return `${hari} ${pasaran}`;
}

export function singkatPasaran(pasaran) {
  const map = {
    Legi: 'Leg',
    Pahing: 'Pah',
    Pon: 'Pon',
    Wage: 'Wag',
    Kliwon: 'Kli',
  };
  return map[pasaran] || pasaran;
}

export function escapeTeks(teks) {
  return String(teks)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function salinKePapanklip(teks) {
  return navigator.clipboard.writeText(teks);
}

export function buatICS(judul, deskripsi, tanggalYMD) {
  const [y, m, d] = tanggalYMD.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(Date.UTC(y, m - 1, d + 1));
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const stamp = fmt(new Date());
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pawukon Kita//Kalender Jawa//ID',
    'BEGIN:VEVENT',
    `UID:${stamp}@pawukonkita`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`,
    `DTEND;VALUE=DATE:${y}${String(m).padStart(2, '0')}${String(d + 1).padStart(2, '0')}`,
    `SUMMARY:${escapeTeks(judul)}`,
    `DESCRIPTION:${escapeTeks(deskripsi)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function unduhBerkas(nama, konten, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([konten], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

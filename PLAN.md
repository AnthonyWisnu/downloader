# PLAN.md - VOID Brutalist 2.0 Frontend Refactor

Dokumen ini adalah rencana kerja bertahap untuk merombak antarmuka frontend VOID Downloader menjadi **VOID Brutalist 2.0** sesuai spesifikasi master `REFACTOR_UI.md`.

---

## 1. Visi Desain & Aturan Kunci

- **Identitas**: Serious developer/media utility (industrial, technical, editorial, monochrome).
- **Palet Warna**: Monokrom ketat (`#000000`, `#050505`, `#09090B`, `#3F3F46`, `#71717A`, `#A1A1AA`, `#FFFFFF`, `#EF4444`). Tidak ada warna-warni pop atau background kartu warna warni.
- **Geometri**: `border-radius: 0px` (tajam). Border 1px/2px default, 3px untuk fokus utama. Tanpa bayangan konvensional, tanpa gradien.
- **Tipografi**: Editorial sans-serif display (*Space Grotesk*) dan monospace (*JetBrains Mono*) untuk metadata teknis.
- **Arsitektur Universal**: Komponen generik berbasis data (`MediaResult`, `DownloadOptionRow`), bukan memecah kartu terpisah per platform. Mendukung YouTube, TikTok, Instagram, dan X (Twitter).
- **Format Unduhan**: Baris opsi teknikal yang ringkas (*technical rows*), bukan kartu besar. Efek hover inversi tajam (putih-hitam).

---

## 2. Rencana 6 Tahap Eksekusi

### Tahap 1: Fondasi Visual & Token CSS
- [x] Update `frontend/src/styles/variables.css` (palet monokrom, 0px radius, skala tipografi).
- [x] Update `frontend/src/styles/base.css` (reset hitam pekat, tipografi tegas).
- [x] Update `frontend/src/styles/utilities.css` (kelas utilitas industrial, tombol teknikal inversi).

### Tahap 2: Layout Shell (Navbar, Hero, Footer)
- [x] Buat `frontend/src/components/Navbar.jsx` (wordmark VOID, link Docs/Github, status online).
- [x] Refactor `frontend/src/components/HeroSection.jsx` (headline editorial "DOWNLOAD WITHOUT THE NOISE.").
- [x] Refactor `frontend/src/components/Footer.jsx` (status teknikal, server-side disclaimer).

### Tahap 3: Downloader Input & State
- [x] Refactor `frontend/src/components/UrlInput.jsx` (input surface `#050505`, tombol `[ ANALYZE ↗ ]`).
- [x] Tambahkan indikator platform teknikal `[YT] [TT] [IG] [X]`.
- [x] Refactor loading state teknikal ("ANALYZING SOURCE...") dan error state terisolasi.

### Tahap 4: Universal Result Architecture
- [x] Buat kontainer generik `MediaResult.jsx` & `PlatformHeader.jsx`.
- [x] Buat `MediaPreview.jsx` adaptif (landscape 16:9 vs portrait 9:16 vs gallery).
- [x] Buat `DownloadOptions.jsx` dan `DownloadOptionRow.jsx` (baris teknikal: resolusi, format, ukuran, tombol `[ DOWNLOAD ↗ ]`).
- [x] Integrasikan penampil foto/slideshow yang bersih.

### Tahap 5: Data Adapter & Kompatibilitas 4 Platform
- [x] Buat `frontend/src/utils/mediaAdapter.js` untuk normalisasi data API (YouTube, TikTok, Instagram, X).
- [x] Verifikasi konsumsi data generik tanpa percabangan komponen UI terpisah.
- [x] Verifikasi seluruh tombol unduhan (MP4, MP3, JPG).

### Tahap 6: Responsivitas, Aksesibilitas & Pembersihan Akhir
- [x] Uji responsivitas mobile & tablet (tanpa overflow horizontal).
- [x] Uji navigasi keyboard dan kontras aksesibilitas.
- [x] Hapus CSS dan komponen lama yang tidak lagi digunakan.
- [x] Verifikasi build produksi (`npm run build`).

---

## 3. Verifikasi Wajib
- Backend tidak diubah (API contract tetap kompatibel).
- `npm run build` sukses 100% tanpa error bundling.
- Bebas emoji dan bebas emdash.

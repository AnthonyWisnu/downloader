# PLAN.md - Refactor Arsitektur & Penambahan Fitur YouTube & X (Twitter) Downloader

Dokumen ini adalah rencana kerja dan status eksekusi bertahap untuk refactor backend, modularitas CSS frontend, penguncian versi TikTok v1, serta implementasi YouTube dan X (Twitter) Downloader dengan dukungan cookies.

---

## 1. Scope & Tujuan Pekerjaan

1. **Unifikasi Eksekusi Proses Eksternal**:
   Menghilangkan implementasi berulang `execFile` (`runYtDlp`, `runFfmpeg`, `runTool`) di 6 file ke satu utilitas terpusat: `backend/src/utils/execTool.js`.
2. **Unifikasi Logika Caching Media**:
   Menyatukan penanganan file temporer, token SHA-256, I/O stream, dan pembersihan berkala ke service terpusat: `backend/src/services/media-cache.service.js`.
3. **Penguncian Versi TikTok Downloader**:
   Memastikan pemanggilan `@tobyg74/tiktok-api-dl` dikunci pada `{ version: "v1" }` karena terbukti lebih stabil dan lengkap dibandingkan v3.
4. **Modularitas Styling Frontend**:
   Memecah `frontend/src/globals.css` (~18KB) menjadi modul terpisah per seksi (`hero.css`, `downloader.css`, `result.css`, `sections.css`, `footer.css`) yang di-import secara bersih.
5. **Fitur Baru - YouTube Downloader**:
   Mendukung unduhan video YouTube reguler dan Shorts (MP4 iOS-safe & Audio MP3) menggunakan `yt-dlp` dengan dukungan cookies Netscape `backend/cookies/yt_cookies.txt`.
6. **Fitur Baru - X (Twitter) Downloader**:
   Mendukung unduhan semua jenis media dari X: Video MP4 (iOS-safe), GIF tweet (MP4 loop), Audio MP3, dan Foto tweet (1-4 gambar resolusi original `name=orig` via penampil `SlideshowPreview`). Menyiapkan cookies opsional `backend/cookies/x_cookies.txt`.

---

## 2. Checklist Status per Komponen

### A. Utilitas Eksekusi & Caching (Backend)
- [x] Buat `backend/src/utils/execTool.js` (helper Promise terpusat untuk yt-dlp, ffmpeg, ffprobe dengan error handling ramah).
- [x] Buat `backend/src/services/media-cache.service.js` (konstanta `DOWNLOAD_CACHE_DIR`, `TOKEN_PATTERN`, helper cache file dan pembersihan berkala).
- [x] Refactor `backend/src/services/video-cache.service.js` menggunakan `media-cache.service.js`.
- [x] Refactor `backend/src/services/audio-cache.service.js` menggunakan `media-cache.service.js` dan `runFfmpeg`.
- [x] Refactor `backend/src/services/video-normalize.service.js` menggunakan `runFfmpeg` dan `runFfprobe`.
- [x] Refactor `backend/src/services/image-download.service.js` menggunakan `runFfmpeg`.
- [x] Refactor `backend/src/controllers/preview.controller.js` menggunakan `runYtDlp`.
- [x] Refactor `backend/src/controllers/file.controller.js` menggunakan `media-cache.service.js`.
- [x] Refactor `backend/src/app.js` menggunakan `cleanupExpiredCache` dan `validateAllCookiesOnStartup`.

### B. TikTok Downloader (Penguncian ke v1)
- [x] Refactor `backend/src/services/tiktok.service.js` menggunakan `runYtDlp` dari `execTool.js`.
- [x] Kunci pemanggilan `downloader(url, { version: "v1" })` secara permanen ke v1.
- [x] Skema ekstraksi video tanpa watermark, watermark, dan audio MP3 diverifikasi stabil.

### C. YouTube Downloader (Backend & Cookies)
- [x] Update `backend/src/services/cookies.service.js` dengan fungsi `getYoutubeCookiesPath()`, `validateYoutubeCookies()`, dan log startup.
- [x] Update `backend/src/utils/sanitizeUrl.js` untuk mendeteksi `youtube.com`, `m.youtube.com`, `youtu.be`, dan Shorts.
- [x] Buat `backend/src/services/youtube.service.js` dengan normalisasi video MP4 iOS-safe dan ekstraksi audio MP3.
- [x] Integrasikan handler YouTube ke `backend/src/controllers/download.controller.js`.
- [x] Tambahkan header referer YouTube di `backend/src/controllers/media.controller.js`.
- [x] Tambahkan `YT_COOKIES_PATH=./cookies/yt_cookies.txt` di `backend/.env.example`.

### D. X (Twitter) Downloader (Backend & Cookies)
- [x] Update `backend/src/services/cookies.service.js` dengan `getXCookiesPath()`, `validateXCookies()`, dan `validateXCookiesOnStartup()`.
- [x] Update `backend/src/utils/sanitizeUrl.js` untuk mendeteksi `x.com`, `twitter.com`, dan subdomain terkait.
- [x] Buat `backend/src/services/x.service.js` dengan dukungan video MP4, GIF, audio MP3, dan foto resolusi original (`name=orig`).
- [x] Integrasikan handler X ke `backend/src/controllers/download.controller.js`.
- [x] Tambahkan header referer X di `backend/src/controllers/media.controller.js`.
- [x] Tambahkan `X_COOKIES_PATH=./cookies/x_cookies.txt` di `backend/.env.example`.
- [x] Pastikan semua file cookies `.txt` diabaikan di `.gitignore`.

### E. Modularitas Styling & Penyesuaian Frontend
- [x] Pecah `frontend/src/globals.css` ke modul terpisah di `frontend/src/styles/`:
  - `styles/hero.css`
  - `styles/downloader.css`
  - `styles/result.css`
  - `styles/sections.css`
  - `styles/footer.css`
- [x] Tambahkan token warna `--red: #ff3344` di `styles/variables.css`.
- [x] Tambahkan class `.badge-red` dan `.card-red` di `styles/utilities.css`.
- [x] Rampingkan `frontend/src/globals.css` menjadi master aggregator `@import`.
- [x] Tambahkan deteksi YouTube dan X serta label `YOUTUBE` & `X (TWITTER)` di `frontend/src/utils/detectPlatform.js`.
- [x] Tambahkan badge dan placeholder pendukung di `frontend/src/components/UrlInput.jsx`.
- [x] Tambahkan kartu informasi YouTube dan X (Twitter) di `frontend/src/components/PlatformSupport.jsx`.

---

## 3. Hasil Verifikasi
- Syntax Check Backend: Semua file lolos `node --check` tanpa error.
- Frontend Build: `npm run build` sukses 100% tanpa error chunk maupun bundling CSS.

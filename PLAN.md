# PLAN.md

## Fase 1: Inisialisasi Struktur Project

### Tujuan fase
Menyiapkan struktur folder dan file dasar sesuai `AGENT.md` tanpa menulis logika bisnis utama.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\frontend\package.json`
- `c:\laragon\www\downloader\frontend\index.html`
- `c:\laragon\www\downloader\frontend\vite.config.js`
- `c:\laragon\www\downloader\frontend\src\main.jsx`
- `c:\laragon\www\downloader\frontend\src\App.jsx`
- `c:\laragon\www\downloader\frontend\src\components\UrlInput.jsx`
- `c:\laragon\www\downloader\frontend\src\components\ResultCard.jsx`
- `c:\laragon\www\downloader\frontend\src\components\PlatformBadge.jsx`
- `c:\laragon\www\downloader\frontend\src\components\DownloadButton.jsx`
- `c:\laragon\www\downloader\frontend\src\components\LoadingSpinner.jsx`
- `c:\laragon\www\downloader\frontend\src\hooks\useDownloader.js`
- `c:\laragon\www\downloader\frontend\src\utils\detectPlatform.js`
- `c:\laragon\www\downloader\frontend\src\globals.css`
- `c:\laragon\www\downloader\backend\package.json`
- `c:\laragon\www\downloader\backend\src\app.js`
- `c:\laragon\www\downloader\backend\src\routes\download.routes.js`
- `c:\laragon\www\downloader\backend\src\controllers\download.controller.js`
- `c:\laragon\www\downloader\backend\src\services\tiktok.service.js`
- `c:\laragon\www\downloader\backend\src\services\instagram.service.js`
- `c:\laragon\www\downloader\backend\src\services\cookies.service.js`
- `c:\laragon\www\downloader\backend\src\utils\sanitizeUrl.js`
- `c:\laragon\www\downloader\backend\cookies\.gitkeep`
- `c:\laragon\www\downloader\backend\.env.example`
- `c:\laragon\www\downloader\.gitignore`
- `c:\laragon\www\downloader\ecosystem.config.js`

### Langkah teknis singkat
- Buat folder `frontend` dan `backend` sesuai struktur wajib.
- Tambahkan file entry point, komponen, hook, route, controller, service, util, config, dan template env.
- Isi file awal dengan skeleton minimal yang valid dan mengikuti SRP.
- Pastikan `.gitignore` mengecualikan cookies Instagram, `.env`, `node_modules`, dan `dist`.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- Semua path wajib sudah tersedia.
- Tidak ada file cookies rahasia yang masuk repo.
- Komponen dan service belum melewati batas tanggung jawab awal.
- Checkpoint 1: konfirmasi ke user sebelum menulis logika service.

## Fase 2: Implementasi Backend API

### Tujuan fase
Membuat backend Express yang dapat melayani health check, validasi URL, deteksi platform, dan delegasi download TikTok atau Instagram.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\backend\src\app.js`
- `c:\laragon\www\downloader\backend\src\routes\download.routes.js`
- `c:\laragon\www\downloader\backend\src\controllers\download.controller.js`
- `c:\laragon\www\downloader\backend\src\services\tiktok.service.js`
- `c:\laragon\www\downloader\backend\src\services\instagram.service.js`
- `c:\laragon\www\downloader\backend\src\services\cookies.service.js`
- `c:\laragon\www\downloader\backend\src\utils\sanitizeUrl.js`
- `c:\laragon\www\downloader\backend\package.json`
- `c:\laragon\www\downloader\backend\.env.example`

### Langkah teknis singkat
- Konfigurasi Express, CORS dari `FRONTEND_URL`, JSON body parser, dan route `/api`.
- Tambahkan `GET /api/health` dengan response `{ "status": "ok" }`.
- Tambahkan `POST /api/download` dengan validasi request body.
- Implementasikan `sanitizeUrl.js` untuk menerima hanya URL TikTok dan Instagram yang valid.
- Implementasikan controller untuk deteksi platform dan response error konsisten.
- Implementasikan TikTok service memakai `@tobyg74/tiktok-api-dl`.
- Implementasikan Instagram service memakai `child_process.execFile` untuk `yt-dlp --cookies --dump-json`.
- Implementasikan cookies service untuk validasi keberadaan dan format Netscape `IG_COOKIES_PATH`.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- `npm install` backend berhasil.
- Server backend bisa berjalan lokal pada port dari `.env` atau default `3001`.
- `GET http://localhost:3001/api/health` mengembalikan `{ "status": "ok" }`.
- `POST /api/download` menolak URL kosong, URL invalid, dan platform tidak didukung.
- TikTok test URL mengembalikan struktur `platform`, `type`, `title`, `thumbnail`, dan `downloads`.
- Instagram test URL berjalan jika `ig_cookies.txt` dan `yt-dlp` tersedia, atau memberi error server yang jelas jika belum tersedia.
- Checkpoint 2: konfirmasi ke user sebelum mulai frontend.

## Fase 3: Implementasi Frontend SPA

### Tujuan fase
Membuat antarmuka single-page VOID yang mengirim URL ke backend dan menampilkan hasil download sesuai `DESIGN.md`.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\frontend\src\App.jsx`
- `c:\laragon\www\downloader\frontend\src\main.jsx`
- `c:\laragon\www\downloader\frontend\src\globals.css`
- `c:\laragon\www\downloader\frontend\src\components\UrlInput.jsx`
- `c:\laragon\www\downloader\frontend\src\components\ResultCard.jsx`
- `c:\laragon\www\downloader\frontend\src\components\PlatformBadge.jsx`
- `c:\laragon\www\downloader\frontend\src\components\DownloadButton.jsx`
- `c:\laragon\www\downloader\frontend\src\components\LoadingSpinner.jsx`
- `c:\laragon\www\downloader\frontend\src\hooks\useDownloader.js`
- `c:\laragon\www\downloader\frontend\src\utils\detectPlatform.js`
- `c:\laragon\www\downloader\frontend\package.json`
- `c:\laragon\www\downloader\frontend\vite.config.js`
- `c:\laragon\www\downloader\frontend\index.html`

### Langkah teknis singkat
- Buat layout mobile-first dengan max width 860px dan urutan hero, separator, input, result, footer.
- Import JetBrains Mono dan definisikan CSS variables dari palet desain.
- Implementasikan `UrlInput` dengan tombol `[ GRAB ]`, loading `[ ... ]`, dan error `ERR:`.
- Implementasikan `useDownloader` untuk request `POST /api/download` dan health check `GET /api/health`.
- Implementasikan `ResultCard`, `PlatformBadge`, `DownloadButton`, dan `LoadingSpinner`.
- Pastikan semua tombol memakai format bracket, tanpa emoji, tanpa emdash, tanpa radius, tanpa shadow, tanpa gradient.
- Pastikan semua komponen mengikuti batas baris dan SRP dari `AGENT.md`.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- `npm install` frontend berhasil.
- `npm run build` frontend berhasil.
- Dev server Vite menampilkan halaman VOID.
- Input URL invalid menampilkan error dengan format `ERR:`.
- Submit URL valid memanggil backend dan menampilkan hasil dalam `ResultCard`.
- Footer menampilkan `SERVER: OK` atau `SERVER: ERROR` berdasarkan health check.
- Pemeriksaan visual memastikan tidak ada border radius, shadow, gradient, spinner grafis, emoji, atau warna di luar palet.
- Checkpoint 3: konfirmasi ke user sebelum deployment.

## Fase 4: Integrasi Lokal End-to-End

### Tujuan fase
Memastikan frontend dan backend bekerja bersama sebelum disiapkan untuk server produksi.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\frontend\vite.config.js`
- `c:\laragon\www\downloader\frontend\src\hooks\useDownloader.js`
- `c:\laragon\www\downloader\backend\.env.example`
- `c:\laragon\www\downloader\backend\src\app.js`

### Langkah teknis singkat
- Pastikan konfigurasi API base URL bekerja untuk development.
- Pastikan CORS backend menerima origin Vite lokal.
- Jalankan backend dan frontend secara bersamaan.
- Uji health check dari frontend.
- Uji download TikTok end-to-end.
- Uji Instagram end-to-end jika `yt-dlp` dan cookies tersedia.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- Frontend dapat memanggil `/api/health` tanpa error CORS.
- Frontend dapat menerima error backend dan menampilkannya dengan benar.
- Hasil download sukses dapat ditampilkan dan tombol `[ DOWNLOAD ]` membuka link download.
- Log backend tidak menampilkan error tak tertangani.

## Fase 5: Persiapan Deployment

### Tujuan fase
Menyiapkan konfigurasi produksi untuk PM2, Nginx, environment, dan static build frontend.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\ecosystem.config.js`
- `c:\laragon\www\downloader\backend\.env.example`
- `c:\laragon\www\downloader\.gitignore`
- `c:\laragon\www\downloader\frontend\vite.config.js`
- `c:\laragon\www\downloader\backend\src\app.js`

### Langkah teknis singkat
- Pastikan `ecosystem.config.js` menjalankan `backend/src/app.js` dari cwd `./backend`.
- Pastikan `.env.example` memuat `PORT`, `FRONTEND_URL`, `IG_COOKIES_PATH`, dan `NODE_ENV`.
- Pastikan `.gitignore` melindungi cookies dan `.env`.
- Build frontend untuk menghasilkan `frontend/dist`.
- Dokumentasikan kebutuhan server: Node.js 20 LTS, PM2, Nginx, Python 3, dan `yt-dlp`.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- `npm run build` frontend menghasilkan `frontend/dist`.
- `pm2 start ecosystem.config.js` dapat menjalankan backend secara lokal atau di server.
- `curl http://localhost:3001/api/health` mengembalikan status ok saat backend dijalankan PM2.
- File cookies dan `.env` tetap tidak terlacak oleh git.
- Checkpoint 4: konfirmasi ke user sebelum SSL.

## Fase 6: Deployment Server dan SSL

### Tujuan fase
Menjalankan aplikasi di DigitalOcean dengan Nginx sebagai static server dan reverse proxy, lalu mengaktifkan SSL.

### File yang dibuat atau diubah (path lengkap)
- `c:\laragon\www\downloader\ecosystem.config.js`
- `c:\laragon\www\downloader\frontend\dist\`
- Konfigurasi Nginx server: `/etc/nginx/sites-available/downloader`
- Konfigurasi Nginx symlink: `/etc/nginx/sites-enabled/downloader`
- File environment server: `/var/www/downloader/backend/.env`
- File cookies server: `/var/www/downloader/backend/cookies/ig_cookies.txt`

### Langkah teknis singkat
- Clone atau salin project ke `/var/www/downloader`.
- Install dependency backend dan frontend.
- Upload `ig_cookies.txt` format Netscape langsung ke `backend/cookies/`.
- Buat `.env` produksi sesuai `.env.example`.
- Build frontend dan arahkan Nginx root ke `frontend/dist`.
- Konfigurasi Nginx agar `/api/` proxy ke `http://localhost:3001`.
- Jalankan backend dengan PM2 dan simpan konfigurasi startup.
- Setelah domain aktif, jalankan Certbot untuk SSL.

### Verifikasi keberhasilan sebelum lanjut ke fase berikutnya
- `pm2 status` menunjukkan `downloader-backend` online.
- `curl http://localhost:3001/api/health` mengembalikan `{ "status": "ok" }`.
- `sudo nginx -t` sukses dan Nginx reload tanpa error.
- Domain menampilkan frontend VOID.
- `https://domain/api/health` mengembalikan status ok setelah SSL aktif.
- Test download satu URL TikTok berhasil.
- Test download satu Instagram post berhasil jika cookies valid.
- Test download satu Instagram Story berhasil jika cookies memiliki akses.

# PLAN REDESIGN - VOID Downloader Frontend

Dokumen ini adalah rencana kerja bertahap untuk redesign frontend VOID Downloader berdasarkan `VOID_FRONTEND_REDESIGN_PROMPT.md`.

## Aturan Kerja

- Pengerjaan dilakukan PER TAHAP.
- Setiap selesai satu tahap, agent BERHENTI dan menunggu konfirmasi dari user sebelum lanjut ke tahap berikutnya.
- Setiap akhir tahap: tidak boleh meninggalkan kode dalam kondisi rusak (app tetap bisa jalan).
- `npm run build` dijalankan untuk verifikasi pada tahap yang relevan.

## Batasan Mutlak (berlaku di semua tahap)

- Tidak mengubah backend sama sekali.
- Tidak mengubah endpoint API atau nama field response.
- Tidak mengubah `useDownloader.js` secara breaking (hanya boleh konsumsi data yang sudah ada).
- Tidak mengubah `mediaProxy.js` kecuali benar-benar perlu.
- Tidak menambah dependency baru kecuali benar-benar perlu (lucide-react diasumsikan sudah ada, akan dicek di Tahap 0).
- Tanpa em dash. Tanpa emoji, gunakan icon `lucide-react`.

---

## Tahap 0 - Persiapan dan Audit (Selesai)

Tujuan: memastikan fondasi siap sebelum menyentuh tampilan.

- Cek `package.json` frontend untuk memastikan `lucide-react` tersedia. Jika belum ada, laporkan ke user sebelum lanjut.
- Baca komponen existing (`UrlInput`, `ResultCard`, `DownloadButton`, `AudioPreview`, `SlideshowPreview`, `PlatformBadge`, `FeatureSection`, `HowItWorks`, `HowToSection`, `LoadingSpinner`) untuk memahami props dan struktur data.
- Catat field response yang dipakai (`platform`, `type`, `title`, `thumbnail`, `previewUrl`, `downloads`, dll) agar tidak ada yang hilang saat refactor.

Output: ringkasan kondisi awal dan konfirmasi kesiapan.

BERHENTI, tunggu konfirmasi.

---

## Tahap 1 - Fondasi Styling (Design System) (Selesai)

Tujuan: menyiapkan sistem warna dan struktur CSS sebelum membangun komponen.

- Buat folder `frontend/src/styles/`.
- Buat `styles/variables.css` berisi CSS variables (warna, border, shadow, radius, font) sesuai palet di prompt.
- Buat `styles/base.css` berisi reset dan base styles (body, typography, font import).
- Buat `styles/utilities.css` berisi utility class custom (container, section, badge, button brutalist, card, dll).
- Rapikan `globals.css`: jadikan sebagai aggregator yang meng-import ketiga file di atas, atau pindahkan import ke `main.jsx`.
- Pastikan app masih render tanpa error (sementara tampilan lama bisa berantakan, tapi tidak crash).

Output: design system siap dipakai komponen.

BERHENTI, tunggu konfirmasi.

---

## Tahap 2 - Hero dan Downloader Panel (inti halaman) (Selesai)

Tujuan: membangun dua section terpenting lebih dulu.

- Buat `components/HeroSection.jsx` (background `--ink`): label `[ FREE TOOL ]`, judul besar `VOID`, subjudul, baris badge platform, stat row, scroll hint `ChevronDown`, background pattern CSS.
- Buat `components/DownloaderPanel.jsx` (background `--yellow`): wrap `UrlInput`, label section, microcopy, tombol GRAB brutalist, status baris platform terdeteksi, loading state, error state dengan `AlertCircle`.
- Refactor tampilan `UrlInput.jsx` dan `PlatformBadge.jsx` agar sesuai style baru (props tetap sama).
- Update `App.jsx` untuk memakai `HeroSection` dan `DownloaderPanel` (section lain sementara tetap pakai komponen lama agar app tidak rusak).

Output: hero dan panel download tampil dengan style baru, flow submit tetap berfungsi.

BERHENTI, tunggu konfirmasi.

---

## Tahap 3 - Result Section (Selesai)

Tujuan: refactor tampilan hasil download.

- Buat `components/ResultSection.jsx` (atau refactor `ResultCard.jsx`): badge platform berwarna, judul, preview video/slideshow, tombol download dengan icon `Download`, card audio (`--purple`), warning audio tidak tersedia (`--orange`, `VolumeX`), tombol "Grab Lagi" (pakai `reset` dari hook).
- Refactor tampilan `DownloadButton.jsx`, `AudioPreview.jsx`, `SlideshowPreview.jsx` sesuai style baru (logika tetap).
- Integrasikan ke `App.jsx`, muncul hanya jika `result` ada.

Output: hasil download tampil dengan style baru, semua fitur (preview, slideshow, audio, download) tetap berfungsi.

BERHENTI, tunggu konfirmasi.

---

## Tahap 4 - Section Konten (Platform, Feature, How To, FAQ) (Selesai)

Tujuan: membangun section informatif landing page.

- Buat `components/PlatformSupport.jsx` (background `--off-white`): 5 card platform, grid 2 kolom mobile / 3 kolom desktop, icon lucide-react.
- Buat `components/FeatureGrid.jsx` (background `--purple`) untuk menggantikan `FeatureSection.jsx`: 6 fitur, grid 2/3 kolom.
- Refactor total `HowToSection.jsx` (background `--off-white`): 3 langkah ringkas, nomor besar `--yellow`.
- Buat `components/FAQSection.jsx` (background `--ink`): minimal 6 Q&A, accordion atau list dengan pemisah.
- Integrasikan semua ke `App.jsx` sesuai urutan target. Hapus pemakaian `HowItWorks.jsx` dan `FeatureSection.jsx` lama jika sudah digantikan.

Output: semua section konten tampil dengan rotasi background dan style baru.

BERHENTI, tunggu konfirmasi.

---

## Tahap 5 - Footer dan Finalisasi App.jsx (Selesai)

Tujuan: melengkapi halaman dan merapikan orchestrator.

- Buat `components/Footer.jsx` (background `--ink`): logo `VOID` aksen `--yellow`, tagline, disclaimer, server status dengan dot indicator (lime/pink), versi `v1.0.0`.
- Finalisasi `App.jsx` dengan urutan section: Hero, DownloaderPanel, ResultSection, PlatformSupport, FeatureGrid, HowToSection, FAQSection, Footer.
- Pastikan jumlah baris `App.jsx` dalam batas (250-350) dan tiap komponen sesuai batas baris.

Output: halaman lengkap end to end.

BERHENTI, tunggu konfirmasi.

---

## Tahap 6 - Micro Interaction, Responsive, Accessibility (Selesai)

Tujuan: poles detail interaksi dan kualitas.

- Tambahkan hover/active effect (translate + shadow) pada semua card dan button.
- Tambahkan focus state input (border `--yellow`).
- Pastikan responsive: mobile full width, desktop grid 3 kolom, preview video max-height 280px mobile.
- Accessibility: aria-label input, disabled state terlihat, focus visible, kontras cukup, status tidak hanya bergantung warna.

Output: interaksi halus, layout rapi di mobile dan desktop.

BERHENTI, tunggu konfirmasi.

---

## Tahap 7 - Cleanup dan Verifikasi Akhir (Selesai)

Tujuan: memastikan semua acceptance criteria terpenuhi.

- Hapus file komponen lama yang tidak terpakai (`FeatureSection.jsx`, `HowItWorks.jsx`) jika sudah digantikan.
- Cek seluruh Acceptance Criteria di prompt satu per satu.
- Jalankan `npm run build` dan pastikan sukses tanpa error.
- Bersihkan file sementara jika ada.

Output: build sukses, semua acceptance criteria tercentang.

SELESAI.

---

## Tahap 8 - Fix Slideshow Download (Belum Dikerjakan)

Tujuan: memperbaiki download gambar slideshow dan merapikan result card slideshow tanpa mengubah bagian lain.

Catatan batasan: tahap ini adalah pengecualian terbatas dari aturan "Tidak mengubah backend sama sekali" karena bug download gambar berada pada response binary/header backend. Perubahan backend hanya boleh menyentuh handler/proxy download gambar yang relevan.

### Backend - Download Gambar Slideshow (Selesai)

- [x] Audit endpoint/proxy yang dipakai tombol download gambar slideshow:
  - `backend/src/controllers/media.controller.js`
  - `backend/src/controllers/file.controller.js` jika terlibat pada internal file route
  - util/service terkait media proxy jika ada
- [x] Pastikan URL gambar external diproxy sebagai binary stream atau buffer, bukan JSON.
- [x] Pastikan response header gambar benar:
  - `Content-Type` mengikuti upstream image, fallback `image/jpeg`
  - `Content-Disposition: attachment; filename="void-image-N.jpg"` atau nama image aman yang setara
  - `Content-Length` jika tersedia
- [x] Pastikan download gambar tidak hilang ekstensi melalui filename berbasis `Content-Type` atau ekstensi URL.
- [x] Jangan mengubah validasi URL, alur video, audio, Instagram cookies, atau normalisasi video.

### Frontend - Hapus Daftar JPG Per-Image (Selesai)

- [x] Audit render list download di:
  - `frontend/src/components/ResultCard.jsx`
  - `frontend/src/components/SlideshowPreview.jsx`
  - `frontend/src/components/DownloadButton.jsx` jika format filename perlu disesuaikan
- [x] Hapus hanya daftar tombol:
  - `JPG / SLIDESHOW IMAGE 1`
  - `JPG / SLIDESHOW IMAGE 2`
  - `JPG / SLIDESHOW IMAGE N`
- [x] Pertahankan:
  - Slideshow viewer
  - navigasi slide
  - tombol `DOWNLOAD SLIDE INI` di slideshow viewer
  - tombol MP4 video
  - AudioPreview
  - tombol MP3 audio only
- [x] Jangan mengubah desain besar-besaran dan jangan menambah dependency.

### Verifikasi Tahap 8

- Download satu gambar slideshow menghasilkan file `.jpg`.
- File gambar bisa dibuka dan ukurannya wajar.
- Tidak ada lagi daftar panjang tombol `JPG / SLIDESHOW IMAGE N` di result card.
- Tombol `DOWNLOAD SLIDE INI` tetap berfungsi.
- Download MP4 tetap berfungsi.
- Download MP3 tetap berfungsi.
- `npm run build` berhasil tanpa error.

Output: bug download slideshow selesai tanpa regresi pada video, audio, image carousel, dan flow utama.

BERHENTI, tunggu konfirmasi.

---

## Checklist Acceptance Criteria (dicek di Tahap 7)

- [x] Website tetap bisa submit URL dan trigger download flow
- [x] Loading state muncul saat proses berlangsung
- [x] Error state tampil jelas jika URL invalid atau API gagal
- [x] Result card menampilkan preview, judul, platform badge, tombol download
- [x] Slideshow tetap tampil jika result berupa gambar
- [x] Audio preview tetap tampil jika ada audio only
- [x] Tombol GRAB paling mencolok saat belum ada result
- [x] Background tidak monoton hitam di semua section
- [x] Minimal 4 warna berbeda dipakai sebagai background section
- [x] Tidak ada section yang kosong di desktop
- [x] Mobile layout tidak overflow
- [x] Feature cards grid 2 kolom di mobile
- [x] Platform support section ada
- [x] FAQ section ada minimal 5 pertanyaan
- [x] Footer ada dan tidak kosong
- [x] Tidak ada perubahan backend
- [x] `npm run build` berhasil tanpa error

## Checklist Tambahan Tahap 8

- [ ] Download gambar slideshow menghasilkan file `.jpg` yang bisa dibuka
- [ ] Ukuran file gambar slideshow wajar, bukan 2-13 KB
- [x] Daftar tombol `JPG / SLIDESHOW IMAGE N` tidak tampil lagi di result card
- [x] Tombol `DOWNLOAD SLIDE INI` tetap berfungsi
- [ ] Download MP4 tetap berfungsi
- [ ] Download MP3 tetap berfungsi
- [x] `npm run build` berhasil tanpa error setelah fix

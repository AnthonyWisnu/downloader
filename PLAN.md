# PLAN.md

## Scope Sesi Ini

Rencana ini khusus untuk perbaikan bug Instagram, validasi cookies saat server start, preview slideshow TikTok, dan preview audio TikTok. Implementasi baru dimulai setelah konfirmasi.

## Checklist Per File

### backend/src/services/instagram.service.js

- [x] Pisahkan alur pengambilan metadata awal dengan menjalankan `yt-dlp --dump-json` tanpa flag `--format`.
  Alasan: konten foto Instagram gagal jika yt-dlp dipaksa mencari format video.

- [x] Tambahkan deteksi tipe konten dari metadata.
  Alasan: single photo, carousel foto, dan story foto perlu dikenali dari `ext` gambar seperti `jpg`, `jpeg`, `png`, atau dari `_type: playlist` dengan entry gambar.

- [x] Tambahkan alur hasil untuk konten gambar tanpa memakai flag `--format`.
  Alasan: URL gambar harus diambil langsung dari metadata atau entry playlist, bukan melalui selector video.

- [x] Pertahankan alur video memakai format video yang sudah ada.
  Alasan: perbaikan foto tidak boleh merusak download Reels atau video post.

- [x] Tambahkan normalisasi error yt-dlp sebelum dilempar ke controller.
  Alasan: stderr mentah yang panjang, termasuk pesan `please report this issue on github`, tidak boleh sampai ke response API.

- [x] Terapkan mapping error bersih:
  `No video formats found` menjadi `ERR: Format konten tidak didukung`,
  `HTTP Error 404` menjadi `ERR: Konten tidak ditemukan atau sudah dihapus`,
  `login required` menjadi `ERR: Konten membutuhkan autentikasi`,
  metadata kosong menjadi `ERR: Gagal mengambil metadata, coba lagi`,
  dan fallback menjadi `ERR: Gagal memproses URL Instagram`.
  Alasan: user mendapat pesan pendek, konsisten, dan tidak membocorkan detail proses backend.

### backend/src/services/cookies.service.js

- [x] Tambahkan fungsi validasi startup untuk `backend/cookies/ig_cookies.txt`.
  Alasan: server perlu memberi sinyal apakah cookies Instagram tersedia tanpa menghentikan aplikasi.

- [x] Jika file cookies tidak ada atau kosong, tulis warning dan lanjutkan server.
  Alasan: aplikasi tetap bisa berjalan untuk TikTok atau konten publik.

- [x] Jika file cookies ada dan berisi, tulis log `cookies loaded: OK`.
  Alasan: operator server bisa memastikan konfigurasi cookies sudah terbaca.

### backend/src/app.js

- [x] Panggil validasi startup cookies saat aplikasi backend mulai.
  Alasan: fungsi validasi di `cookies.service.js` harus dieksekusi satu kali pada proses server start.

### frontend/src/components/ResultCard.jsx

- [x] Deteksi hasil TikTok bertipe `SLIDESHOW` dan tampilkan preview gambar sebelum daftar tombol download.
  Alasan: user perlu melihat slide terlebih dahulu sebelum memilih gambar yang ingin diunduh.

- [x] Integrasikan tombol navigasi `[ < ]` dan `[ > ]`, counter `01 / 09`, serta tombol `[ DOWNLOAD THIS SLIDE ]`.
  Alasan: preview slideshow harus bisa berpindah slide tanpa animasi dan tetap mengikuti format tombol VOID.

- [x] Tampilkan daftar semua slide tetap seperti sebelumnya dengan label `[ JPG / SLIDESHOW IMAGE N ]`.
  Alasan: fitur baru tidak boleh menghilangkan akses download semua item slideshow.

- [x] Deteksi opsi audio MP3 TikTok dan tampilkan baris `AUDIO PREVIEW` dengan native `<audio controls>`.
  Alasan: user bisa mengecek audio sebelum menekan tombol download.

- [x] Sembunyikan audio preview secara silent jika browser tidak bisa memutar URL.
  Alasan: kegagalan preview tidak boleh membuat hasil download terlihat rusak.

### frontend/src/components/SlideshowPreview.jsx

- [x] Buat sub-komponen preview slideshow.
  Alasan: logika indeks slide, counter, navigasi, dan download slide aktif lebih rapi dipisahkan dari `ResultCard.jsx`.

- [x] Pastikan semua tombol memakai format bracket dan tidak ada animasi.
  Alasan: menjaga konsistensi dengan `DESIGN.md`.

### frontend/src/components/AudioPreview.jsx

- [x] Buat sub-komponen preview audio.
  Alasan: handling error preview audio bisa terisolasi dan tidak membebani `ResultCard.jsx`.

- [x] Gunakan native `<audio controls>` dengan fallback silent pada event error.
  Alasan: browser tetap menangani playback, sementara UI tetap bersih jika URL tidak dapat diputar.

### frontend/src/globals.css

- [x] Tambahkan class styling untuk slideshow preview, tombol navigasi, counter, tombol download slide aktif, dan audio preview row.
  Alasan: perubahan visual harus mengikuti aturan `DESIGN.md` tanpa inline style.

- [x] Pastikan semua style memakai warna palet: `#000000`, `#FFFFFF`, `#D4D4D8`, `#3F3F46`, `#71717A`, `#EF4444`.
  Alasan: konsistensi tema VOID dan kepatuhan desain.

- [x] Pastikan tidak ada `border-radius`, `box-shadow`, gradient, emoji, atau animasi lebih dari 80ms.
  Alasan: aturan desain project wajib tetap dipenuhi.

## Verifikasi Setelah Implementasi

- [x] Backend: jalankan health check dan pastikan server tetap hidup meski cookies kosong atau tidak ada.
- [ ] Backend: uji Instagram video tetap menghasilkan opsi download video.
- [ ] Backend: uji Instagram foto tunggal, carousel foto, dan story foto menghasilkan opsi gambar tanpa error `No video formats found`.
- [x] Backend: uji error URL invalid dan pastikan response memakai pesan `ERR:` yang bersih.
- [ ] Frontend: uji slideshow TikTok menampilkan satu gambar, navigasi prev/next, counter, tombol `[ DOWNLOAD THIS SLIDE ]`, dan daftar semua slide.
- [ ] Frontend: uji hasil audio TikTok menampilkan `AUDIO PREVIEW` jika playable dan hilang silent jika tidak playable.
- [x] Frontend: jalankan build dan cek tidak ada pelanggaran desain yang terlihat pada komponen baru.

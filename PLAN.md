# PLAN.md

## Scope Sesi Ini

Rencana ini khusus untuk dua perubahan kecil: migrasi TikTok downloader ke API v3 dan loading indicator dengan elapsed timer. Perubahan tetap mengikuti `AGENT.md` dan `DESIGN.md`.

## Checklist Per File

### backend/src/services/tiktok.service.js

- [x] Ubah pemanggilan downloader dari `{ version: "v1" }` ke `{ version: "v3" }`.
  Alasan: versi v3 menyediakan field TikTok terbaru yang lebih sesuai untuk video, audio, dan slideshow.

- [x] Prioritaskan field v3 untuk video no watermark: `payload.videoHD` dan `payload.videoSD`.
  Alasan: hasil video utama di v3 berada di field tersebut.

- [x] Prioritaskan field v3 untuk video watermark: `payload.videoWatermark`.
  Alasan: field watermark v3 berbeda dari v1.

- [x] Prioritaskan field v3 untuk audio: `payload.music`, `payload.music.play`, dan `payload.music.playUrl`.
  Alasan: v3 bisa mengembalikan audio sebagai string atau object.

- [x] Pertahankan fallback field v1 di `firstString()`.
  Alasan: jika field v3 kosong, service tetap kompatibel dengan struktur lama.

- [x] Prioritaskan metadata v3: `payload.desc`, `payload.cover`, dan `payload.author.avatar`.
  Alasan: title dan thumbnail v3 perlu dibaca sebelum fallback v1.

### frontend/src/components/LoadingSpinner.jsx

- [x] Tambahkan `useState` dan `useEffect` untuk elapsed timer.
  Alasan: loading harus menampilkan durasi proses dalam detik.

- [x] Ubah teks menjadi `[ FETCHING... Xs ]`.
  Alasan: user mendapat feedback bahwa proses masih berjalan.

- [x] Tambahkan prop opsional `platform`.
  Alasan: teks bantuan berbeda untuk Instagram.

- [x] Tampilkan teks bantuan setelah timer mencapai 3 detik.
  Alasan: informasi tambahan hanya muncul saat proses mulai terasa lama.

- [x] Pastikan tidak ada spinner grafis, dots bergerak, atau animasi lain.
  Alasan: aturan `DESIGN.md` melarang spinner grafis dan animasi berlebihan.

### frontend/src/App.jsx

- [x] Kirim `downloader.detectedPlatform` ke `LoadingSpinner`.
  Alasan: loading indicator perlu tahu platform aktif untuk memilih teks bantuan.

### frontend/src/globals.css

- [x] Tambahkan style `.loading-help-text`.
  Alasan: teks kecil perlu memakai warna `#71717A`, font monospace, dan ukuran kecil sesuai desain.

## Verifikasi

- [x] `node --check backend/src/services/tiktok.service.js`
- [x] `npm run build` di `frontend`
- [ ] Manual: submit URL TikTok dan pastikan backend memakai v3.
- [ ] Manual: loading menampilkan `[ FETCHING... 0s ]`, bertambah tiap detik, dan teks bantuan muncul setelah 3 detik.

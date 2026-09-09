# AGENTS.md: Multi-Platform Media Downloader (YouTube, TikTok, Instagram, X)

## Ringkasan Proyek

Web application single-page modern untuk mengunduh konten multimedia dari 4 platform utama: YouTube, TikTok, Instagram, dan X (Twitter).
Frontend: React 19 + Vite (SPA) dengan desain VOID Brutalist 2.0 dan tema adaptif dinamis.
Backend: Node.js + Express API dengan pipeline FFmpeg video normalization (H.264 FastStart YUV420p) dan disk caching terisolasi.
Hosting Produksi: VPS Ubuntu 24.04, PM2 (user non-root), Nginx Reverse Proxy, SSL Certbot (`https://voiddl.my.id`).

---

## Aturan Wajib untuk Semua File

- Tidak ada emoji di kode, komentar, string, atau print/console.log
- Gunakan icon dari `lucide-react` atau SVG kustom di UI, bukan emoji
- Tidak ada emdash (—), ganti dengan koma atau titik dua
- Komponen React maksimal 180 baris, pecah jika melewati satu tanggung jawab
- Komponen UI: 80-180 baris
- Hook: 200-300 baris
- Orchestrator/index: 250-350 baris
- Helper/util: bebas
- SRP (Single Responsibility Principle) per file
- Pisahkan folder: routes, controllers, services, utils, styles, hooks, components
- Semua video output wajib dinormalisasi via FFmpeg dengan format H.264, YUV420p, dimensi genap, dan flag `+faststart` agar kompatibel di iOS/Safari dan seluruh perangkat modern.

---

## Struktur Folder

```text
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BrandLogos.jsx          (80-180 baris): SVG logo resmi platform berwarna asli
│   │   │   ├── DownloaderPanel.jsx     (80-180 baris): panel input URL dan tombol paste/submit
│   │   │   ├── DownloadOptionRow.jsx   (30-80 baris): baris tombol download per format media
│   │   │   ├── DownloadOptions.jsx     (70-120 baris): daftar opsi unduhan terorganisir
│   │   │   ├── FAQSection.jsx          (80-180 baris): akordeon pertanyaan umum
│   │   │   ├── FeatureGrid.jsx         (60-120 baris): grid keunggulan dan spesifikasi sistem
│   │   │   ├── Footer.jsx              (30-80 baris): footer brutalist dan status API
│   │   │   ├── HeroSection.jsx         (60-120 baris): hero banner dan logo aplikasi
│   │   │   ├── HowToSection.jsx        (40-90 baris): 3 langkah panduan unduhan
│   │   │   ├── MediaMetadata.jsx       (30-80 baris): kartu judul, tipe media, dan author
│   │   │   ├── MediaPreview.jsx        (80-180 baris): player video, audio, atau carousel foto
│   │   │   ├── MediaResult.jsx         (30-60 baris): layout 2 kolom hasil analisis media
│   │   │   ├── Navbar.jsx              (70-120 baris): bar navigasi atas dan status badge
│   │   │   ├── PlatformHeader.jsx      (30-60 baris): header status platform dan tombol reset
│   │   │   ├── PlatformSupport.jsx     (70-120 baris): grid 4 logo platform interaktif
│   │   │   ├── ResultSection.jsx       (20-40 baris): wrapper section hasil pencarian
│   │   │   └── UrlInput.jsx            (80-180 baris): input text URL dengan validasi lokal
│   │   ├── hooks/
│   │   │   └── useDownloader.js        (200-300 baris): state management dan fetch flow
│   │   ├── styles/
│   │   │   ├── base.css                : reset CSS dan typography
│   │   │   ├── downloader.css          : styling input box dan action buttons
│   │   │   ├── footer.css              : styling footer
│   │   │   ├── hero.css                : styling hero brutalist
│   │   │   ├── result.css              : styling kartu hasil, player, dan download rows
│   │   │   ├── sections.css            : styling grid platform, FAQ, dan panduan
│   │   │   ├── utilities.css           : utility classes
│   │   │   └── variables.css           : CSS variables tema global dan adaptif platform
│   │   ├── utils/
│   │   │   ├── detectPlatform.js       : deteksi platform dan format label
│   │   │   ├── mediaAdapter.js         : adapter normalisasi payload backend ke UI
│   │   │   └── mediaProxy.js           : helper URL proxy backend
│   │   ├── App.jsx                     (40-80 baris): orchestrator halaman utama
│   │   ├── globals.css                 : root stylesheet
│   │   └── main.jsx                    : Vite entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── download.routes.js      : definisi rute Express
│   │   ├── controllers/
│   │   │   ├── download.controller.js  : dispatcher unduhan per platform
│   │   │   ├── file.controller.js      : streaming file cache (Byte-Range support)
│   │   │   ├── media.controller.js     : proxy media eksternal dengan proteksi SSRF
│   │   │   └── preview.controller.js   : legacy controller (kandidat cleanup)
│   │   ├── services/
│   │   │   ├── audio-cache.service.js   : ekstraksi dan konversi MP3 192k
│   │   │   ├── cookies.service.js      : load dan validasi cookies Netscape IG/YT/X
│   │   │   ├── image-download.service.js: pipeline konversi WEBP ke JPEG
│   │   │   ├── instagram.service.js    : ekstraksi Reels/Post/Story via yt-dlp dan API direct
│   │   │   ├── media-cache.service.js  : disk cache SHA-256 dan cleanup otomatis
│   │   │   ├── tiktok.service.js       : ekstraksi TikTok no-watermark, audio, slideshow
│   │   │   ├── video-cache.service.js  : caching video hasil normalisasi
│   │   │   ├── video-normalize.service.js: pipeline FFmpeg H.264 FastStart universal
│   │   │   ├── x.service.js            : ekstraksi video, GIF, dan foto asli X/Twitter
│   │   │   └── youtube.service.js      : ekstraksi video 1080p/720p, Shorts, dan MP3 YouTube
│   │   ├── utils/
│   │   │   ├── execTool.js             : async child_process runner (yt-dlp, ffmpeg, ffprobe)
│   │   │   └── sanitizeUrl.js          : whitelist host dan validasi URL
│   │   └── app.js                      : entry point Express server
│   ├── cookies/
│   │   ├── ig_cookies.txt              : cookies Netscape Instagram (JANGAN di-commit)
│   │   ├── yt_cookies.txt              : cookies Netscape YouTube (JANGAN di-commit)
│   │   └── x_cookies.txt               : cookies Netscape X/Twitter (JANGAN di-commit)
│   ├── .env                            : environment variables server (JANGAN di-commit)
│   ├── .env.example                    : template variabel lingkungan
│   └── package.json
│
├── ecosystem.config.js                 : konfigurasi PM2
├── .gitignore
├── AGENTS.md
└── README.md
```

---

## Stack dan Dependensi

### Frontend
```text
react
react-dom
vite
lucide-react
axios
```

### Backend
```text
express
cors
dotenv
axios
@tobyg74/tiktok-api-dl
instagram-url-direct
```

### System Dependencies (Wajib terpasang di server)
```text
yt-dlp                          : extractor universal untuk Instagram, YouTube, dan X
ffmpeg                          : transcoder video H.264 dan ekstraksi audio MP3
ffprobe                         : inspeksi metadata video dan codec
python3                         : runtime pendukung yt-dlp
```

---

## Endpoint API

### 1. GET /api/health
Response:
```json
{ "status": "ok" }
```

### 2. POST /api/download
Request body:
```json
{
  "url": "https://www.tiktok.com/@user/video/123..."
}
```

Response sukses (Video):
```json
{
  "platform": "tiktok",
  "type": "video",
  "title": "Judul konten...",
  "thumbnail": "https://...",
  "sourceUrl": "https://www.tiktok.com/...",
  "previewUrl": "/api/file?token=abcdef123456...",
  "downloads": [
    { "label": "Video (No Watermark)", "url": "/api/file?token=abcdef123456...&download=1", "format": "mp4" },
    { "label": "Audio Only", "url": "/api/file?token=7890abcdef12...&kind=audio&download=1", "format": "mp3" }
  ]
}
```

Response sukses (Slideshow Foto):
```json
{
  "platform": "x",
  "type": "slideshow",
  "title": "Photo post...",
  "thumbnail": "https://pbs.twimg.com/media/Example.jpg?name=orig",
  "sourceUrl": "https://x.com/...",
  "downloads": [
    { "label": "Slideshow Image 1", "url": "https://pbs.twimg.com/media/...", "format": "jpg" },
    { "label": "Slideshow Image 2", "url": "https://pbs.twimg.com/media/...", "format": "jpg" }
  ]
}
```

Response error:
```json
{
  "error": "ERR: URL tidak valid atau konten tidak dapat diakses"
}
```

### 3. GET /api/file
Streaming dan pengunduhan file dari disk cache:
- Query: `token` (32 hex characters), `kind` (`video` atau `audio`), `download` (`1` untuk attachment).
- Headers: Menangani `Range: bytes=start-end` dengan respon status `206 Partial Content`.

### 4. GET /api/media
Reverse proxy untuk aset gambar/thumbnail remote dengan proteksi SSRF:
- Query: `url` (valid public URL), `download` (`1` untuk force download attachment).

---

## Alur Pemrosesan per Platform

### 1. YouTube
1. Frontend mengirim URL ke `POST /api/download`.
2. `download.controller.js` memanggil `youtube.service.js`.
3. `fetchYouTubeMetadata` memanggil `yt-dlp --dump-json` dengan cookies `yt_cookies.txt` (jika tersedia).
4. Video diunduh dengan merge format `bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]`.
5. Video masuk ke `video-normalize.service.js` (FFmpeg) untuk memastikan moov atom faststart dan format H.264 universal.
6. Audio diekstrak sebagai MP3 192k via `yt-dlp --extract-audio`.
7. Hasil disimpan dalam disk cache dengan SHA-256 token dan dikembalikan ke frontend.

### 2. TikTok
1. Frontend mengirim URL ke `POST /api/download`.
2. `download.controller.js` memanggil `tiktok.service.js`.
3. Menggunakan library `@tobyg74/tiktok-api-dl`.
4. Jika video ditemukan, stream diunduh dan dinormalisasi via `video-normalize.service.js`.
5. Jika konten berupa foto multi-slide, array URL gambar resolusi asli disusun.
6. Audio latar diekstrak dan dikonversi ke MP3.

### 3. Instagram (Reels, Feed, Stories, Carousel)
1. Frontend mengirim URL ke `POST /api/download`.
2. `download.controller.js` memanggil `instagram.service.js`.
3. Cookies `ig_cookies.txt` divalidasi.
4. `yt-dlp` dipanggil untuk mengambil metadata dan stream video.
5. Jika video ditemukan, dilakukan merge video+audio dan normalisasi FastStart.
6. Jika format video tidak ditemukan (postingan foto), fallback ke `instagram-url-direct` untuk mengambil list foto.

### 4. X (Twitter)
1. Frontend mengirim URL ke `POST /api/download`.
2. `download.controller.js` memanggil `x.service.js`.
3. Cookies `x_cookies.txt` digunakan jika tweet bersifat sensitif / age-restricted.
4. Jika konten berupa tweet foto, URL foto diekstrak dan dipaksa menggunakan parameter `name=orig` untuk resolusi tertinggi.
5. Jika video atau GIF, video diunduh, dinormalisasi ke MP4 FastStart, dan audio diekstrak jika ada stream suara.

---

## Setup Cookies Netscape (.txt)

File cookies diletakkan di folder `backend/cookies/`:
- `ig_cookies.txt`
- `yt_cookies.txt`
- `x_cookies.txt`

Contoh format Netscape:
```text
# Netscape HTTP Cookie File
.instagram.com  TRUE  /  TRUE  1999999999  sessionid  xxxx...
.instagram.com  TRUE  /  TRUE  1999999999  csrftoken   xxxx...
```

Perizinan file di server produksi:
```bash
chmod 600 backend/cookies/*.txt
```

---

## Variabel Lingkungan (backend/.env)

```env
PORT=3001
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173,https://voiddl.my.id,https://www.voiddl.my.id
IG_COOKIES_PATH=./cookies/ig_cookies.txt
YT_COOKIES_PATH=./cookies/yt_cookies.txt
X_COOKIES_PATH=./cookies/x_cookies.txt
NODE_ENV=production
```

---

## Standar Tema UI Adaptif (VOID Brutalist 2.0)

Frontend menggunakan atribut `data-platform` pada elemen wrapper root `.app`:
```html
<div class="app" data-platform="youtube|instagram|tiktok|x|default">
```
Variabel CSS yang otomatis berubah reaktif:
- `--theme-accent`: Warna aksen utama brand
- `--theme-accent-dim`: Aksen transparan untuk background/hover
- `--theme-accent-glow`: Efek glow brutalist
- `--theme-border`: Border platform
- `--theme-badge-bg` dan `--theme-badge-text`: Warna badge platform

Warna Brand Resmi:
- **YouTube**: `#FF0000` (Red 100%)
- **Instagram**: `#E1306C` (Instagram Magenta-Pink)
- **TikTok**: `#00F2FE` (TikTok Neon Cyan)
- **X (Twitter)**: `#FFFFFF` (Monokrom Kontras Tinggi)
- **Default**: `#00FF66` (Cyber Lime Neon)

---

## Standar Keamanan

1. **SSRF Prevention**: Semua URL input divalidasi via `dns.lookup`. IP lokal (`127.0.0.1`, `10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`, `169.254.x.x`) langsung ditolak.
2. **Path Traversal Protection**: Endpoint file hanya menerima token 32 karakter hex (`^[a-f0-9]{32}$`). Tidak ada path eksternal yang diakses.
3. **Command Injection Prevention**: Semua pemanggilan CLI menggunakan `child_process.execFile` dengan argumen array terpisah, bukan string shell.
4. **Isolasi Kredensial**: File cookies dan path direktori lokal tidak pernah dikirimkan ke frontend.

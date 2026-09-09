# VOID Downloader

VOID Downloader adalah aplikasi web modern single-page untuk mengunduh media dari 4 platform utama: YouTube, TikTok, Instagram, dan X (Twitter). Mendukung pengunduhan video, reels, shorts, stories, foto, slideshow carousel, dan audio MP3 berkualitas tinggi.

Antarmuka dibangun dengan gaya VOID Brutalist 2.0: tipografi teknis JetBrains Mono, border kontras tinggi, micro-interaction responsif, logo SVG resmi beresolusi tajam, dan tema adaptif dinamis yang otomatis bertransformasi mengikuti warna brand platform yang sedang diproses.

Sistem produksi aktif dan berjalan di: `https://voiddl.my.id`

---

## Fitur Utama

### 1. Multi-Platform Media Engine
- **YouTube**: Mendukung video standar (hingga 1080p/720p), YouTube Shorts, dan ekstraksi audio MP3 kualitas studio.
- **TikTok**: Mendukung video tanpa watermark (HD), video dengan watermark, foto slideshow resolusi penuh, dan audio latar MP3.
- **Instagram**: Mendukung Reels, postingan video feed, postingan foto, carousel multipost, Instagram Stories, dan audio track dengan dukungan autentikasi cookies Netscape.
- **X (Twitter)**: Mendukung video tweet, animasi GIF (MP4), foto tunggal/slideshow multi-foto hingga 4 gambar dengan resolusi asli (orig), dan audio MP3.

### 2. Video Normalization Pipeline (iOS & Cross-Device Compatible)
- Pemrosesan video otomatis via FFmpeg dan FFprobe:
  - Video di-remux atau ditranscode ke profil kompatibel universal: H.264 (AVC baseline/high), chroma pixel format YUV420p, dimensi genap (even dimensions).
  - Audio dikodekan ke AAC 128 kbps.
  - Flag MP4 `+faststart` disematkan di awal file (moov atom di awal) agar video dapat langsung di-stream dan diputar tanpa menunggu download selesai di Safari, iOS, Chrome, dan Android.

### 3. Smart Caching & Stream Range Support
- Manajemen cache berbasis hash SHA-256 di direktori temporary sistem (`/tmp/void-dl-cache`).
- Dukungan HTTP 206 Partial Content (Byte-Range requests) untuk pemutaran instan pada preview video dan audio di browser.
- Mekanisme pembersihan file cache kedaluwarsa secara otomatis (TTL 2 jam).

### 4. Keamanan & Proteksi SSRF
- Validasi URL berlapis dan pemblokiran alamat IP privat/loopback (SSRF prevention).
- Media proxy server-side untuk melindungi privasi pengguna dan mencegah pembatasan CORS atau hotlinking dari CDN pihak ketiga (Instagram CDN, TikTok CDN, Google Video, Twitter Media).
- File cookies dan kredensial sensitif diisolasi di sisi server dan tidak pernah diekspos ke frontend.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Modular CSS, CSS Custom Properties (Variables), Responsive Grid/Flexbox
- **Icons**: Lucide React + Custom Inline SVG Brand Logos
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (LTS v20+)
- **Framework**: Express.js
- **Middleware**: CORS, JSON Body Parser
- **Extraction Tools**: `@tobyg74/tiktok-api-dl`, `instagram-url-direct`, `yt-dlp` CLI wrapper
- **Media Transcoder**: FFmpeg & FFprobe (child_process streaming)

### Production & Server Infrastructure
- **Operating System**: Ubuntu 24.04 LTS
- **Process Manager**: PM2 (Cluster/Fork mode)
- **Web Server & Reverse Proxy**: Nginx
- **SSL Certificate**: Let's Encrypt Certbot (Auto-renewal)
- **Production Domain**: `https://voiddl.my.id` (dan `https://www.voiddl.my.id`)

---

## Struktur Direktori

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BrandLogos.jsx          # SVG logo resmi platform (YouTube, IG, TikTok, X)
│   │   │   ├── DownloaderPanel.jsx     # Panel input dan aksi utama
│   │   │   ├── DownloadOptionRow.jsx   # Baris opsi download individual
│   │   │   ├── DownloadOptions.jsx     # Daftar opsi download (video, audio, foto)
│   │   │   ├── FAQSection.jsx          # Bagian pertanyaan umum
│   │   │   ├── FeatureGrid.jsx         # Grid keunggulan aplikasi
│   │   │   ├── Footer.jsx              # Footer halaman dan status sistem
│   │   │   ├── HeroSection.jsx         # Header brutalist dan tagline
│   │   │   ├── HowToSection.jsx        # Panduan langkah penggunaan
│   │   │   ├── MediaMetadata.jsx       # Metadata judul, tipe, thumbnail
│   │   │   ├── MediaPreview.jsx        # Pemutar preview video, audio, atau slideshow foto
│   │   │   ├── MediaResult.jsx         # Container hasil analisis media
│   │   │   ├── Navbar.jsx              # Navigasi atas dan health badge
│   │   │   ├── PlatformHeader.jsx      # Header platform aktif dengan tombol reset
│   │   │   ├── PlatformSupport.jsx     # Indikator platform yang didukung
│   │   │   ├── ResultSection.jsx       # Wrapper section hasil
│   │   │   └── UrlInput.jsx            # Komponen input URL dengan tombol paste dan submit
│   │   ├── hooks/
│   │   │   └── useDownloader.js        # State management dan orchestration fetch data
│   │   ├── styles/
│   │   │   ├── base.css                # Reset dan konfigurasi tipografi
│   │   │   ├── downloader.css          # Styling input bar dan action button
│   │   │   ├── footer.css              # Styling footer
│   │   │   ├── hero.css                # Styling hero brutalist
│   │   │   ├── result.css              # Styling kartu hasil, player, dan download button
│   │   │   ├── sections.css            # Styling grid platform, FAQ, dan how-to
│   │   │   ├── utilities.css           # Utility classes
│   │   │   └── variables.css           # Variabel tema global dan tema adaptif per brand
│   │   ├── utils/
│   │   │   ├── detectPlatform.js       # Validasi domain dan deteksi platform URL
│   │   │   ├── mediaAdapter.js         # Normalisasi payload backend untuk UI konsisten
│   │   │   └── mediaProxy.js           # Helper penyusun URL proxy backend
│   │   ├── App.jsx                     # Root application container (data-platform attribute)
│   │   ├── globals.css                 # Import stylesheet utama
│   │   └── main.jsx                    # Vite React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── cookies/
│   │   ├── ig_cookies.txt              # Cookies Instagram (Netscape format, gitignored)
│   │   ├── yt_cookies.txt              # Cookies YouTube (Netscape format, gitignored)
│   │   └── x_cookies.txt               # Cookies X/Twitter (Netscape format, gitignored)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── download.controller.js  # Dispatcher unduhan berdasarkan platform
│   │   │   ├── file.controller.js      # Streaming file dari cache sistem
│   │   │   ├── media.controller.js     # Media proxy dengan validasi SSRF
│   │   │   └── preview.controller.js   # Preview controller (legacy)
│   │   ├── routes/
│   │   │   └── download.routes.js      # Routing Express API
│   │   ├── services/
│   │   │   ├── audio-cache.service.js   # Ekstraksi dan konversi audio MP3
│   │   │   ├── cookies.service.js      # Parser dan validator cookies Netscape
│   │   │   ├── image-download.service.js# Konversi webp ke jpeg untuk download foto
│   │   │   ├── instagram.service.js    # Ekstraksi media Instagram via yt-dlp / API
│   │   │   ├── media-cache.service.js  # Utilitas caching disk SHA-256 dan TTL cleanup
│   │   │   ├── tiktok.service.js       # Ekstraksi media TikTok
│   │   │   ├── video-cache.service.js  # Manajemen cache video ter-normalisasi
│   │   │   ├── video-normalize.service.js # Pipeline FFmpeg H.264 FastStart
│   │   │   ├── x.service.js            # Ekstraksi video, foto, GIF dari X (Twitter)
│   │   │   └── youtube.service.js      # Ekstraksi video dan audio dari YouTube
│   │   ├── utils/
│   │   │   ├── execTool.js             # Async wrapper child_process yt-dlp dan ffmpeg
│   │   │   └── sanitizeUrl.js          # Validasi whitelist protokol dan hostname
│   │   └── app.js                      # Inisialisasi Express server
│   ├── .env.example                    # Contoh variabel lingkungan
│   └── package.json
│
├── ecosystem.config.js                 # Konfigurasi proses PM2
├── AGENT.md                            # Pedoman dan aturan arsitektur untuk developer/agent
├── DESIGN.md                           # Dokumentasi desain sistem VOID Brutalist 2.0
├── PLAN.md                             # Catatan tahapan refactor sistem
└── README.md                           # Dokumentasi teknis proyek
```

---

## Dokumentasi API

### 1. `GET /api/health`
Memeriksa kesiapan dan ketersediaan layanan backend.

- **Status Code**: `200 OK`
- **Response**:
```json
{
  "status": "ok"
}
```

---

### 2. `POST /api/download`
Menganalisis URL media dan menghasilkan link unduhan terstruktur.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

- **Successful Response (Video)**:
```json
{
  "platform": "youtube",
  "type": "video",
  "title": "Rick Astley - Never Gonna Give You Up (Official Music Video)",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "sourceUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "previewUrl": "/api/file?token=a1b2c3d4e5f6...",
  "downloads": [
    {
      "label": "MP4 / VIDEO",
      "url": "/api/file?token=a1b2c3d4e5f6...&download=1",
      "format": "mp4"
    },
    {
      "label": "Audio Only",
      "url": "/api/file?token=f6e5d4c3b2a1...&kind=audio&download=1",
      "format": "mp3"
    }
  ]
}
```

- **Successful Response (Slideshow / Foto)**:
```json
{
  "platform": "x",
  "type": "slideshow",
  "title": "Photo post on X",
  "thumbnail": "https://pbs.twimg.com/media/Example.jpg?name=orig",
  "sourceUrl": "https://x.com/user/status/123456789",
  "downloads": [
    {
      "label": "Slideshow Image 1",
      "url": "https://pbs.twimg.com/media/Example1.jpg?name=orig",
      "format": "jpg"
    },
    {
      "label": "Slideshow Image 2",
      "url": "https://pbs.twimg.com/media/Example2.jpg?name=orig",
      "format": "jpg"
    }
  ]
}
```

- **Error Response**:
```json
{
  "error": "ERR: URL tidak valid atau konten tidak dapat diakses"
}
```

---

### 3. `GET /api/file`
Menyajikan streaming dan unduhan file media dari cache internal.

- **Query Parameters**:
  - `token` (wajib): Hash SHA-256 sepanjang 32 karakter heksadesimal.
  - `kind` (opsional): Jenis media (`video` atau `audio`, default `video`).
  - `download` (opsional): `1` untuk menyematkan header `Content-Disposition: attachment`.
- **Fitur**: Mendukung header `Range` untuk streaming video/audio (HTTP 206 Partial Content).

---

### 4. `GET /api/media`
Reverse proxy untuk aset eksternal (thumbnail gambar, video remote) dengan validasi anti-SSRF.

- **Query Parameters**:
  - `url` (wajib): URL target media eksternal (harus lolos validasi DNS public IP).
  - `download` (opsional): `1` untuk trigger download file langsung dengan nama file yang sesuai.

---

## Panduan Instalasi Lokal

### Prasyarat Sistem
- Node.js versi 20 LTS atau lebih tinggi
- Python 3
- FFmpeg dan FFprobe terpasang di sistem PATH
- yt-dlp terpasang di sistem PATH

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server backend berjalan secara default di `http://localhost:3001`.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Aplikasi frontend berjalan secara default di `http://localhost:5173`. Request `/api/*` diproxy secara otomatis ke backend selama mode development.

---

## Konfigurasi Cookies Platform

Beberapa konten sensitif, dibatasi usia, atau konten privat memerlukan file cookies berformat Netscape HTTP Cookie File (`.txt`):

1. **Instagram**: Letakkan di `backend/cookies/ig_cookies.txt`
2. **YouTube**: Letakkan di `backend/cookies/yt_cookies.txt` (opsional untuk video publik)
3. **X (Twitter)**: Letakkan di `backend/cookies/x_cookies.txt` (opsional untuk tweet publik)

Format baris Netscape:
```text
# Netscape HTTP Cookie File
.instagram.com  TRUE  /  TRUE  1999999999  sessionid  YOUR_SESSION_ID
.instagram.com  TRUE  /  TRUE  1999999999  csrftoken  YOUR_CSRF_TOKEN
```

File cookies dikecualikan dari Git secara default (`.gitignore`) untuk melindungi privasi dan keamanan akun Anda.

---

## Panduan Deployment VPS Production

### Konfigurasi Environment (`backend/.env`)
```env
PORT=3001
FRONTEND_URL=https://voiddl.my.id,https://www.voiddl.my.id
IG_COOKIES_PATH=./cookies/ig_cookies.txt
YT_COOKIES_PATH=./cookies/yt_cookies.txt
X_COOKIES_PATH=./cookies/x_cookies.txt
NODE_ENV=production
```

### Build & Menjalankan PM2
```bash
# Build frontend
cd /var/www/downloader/frontend
npm run build

# Menjalankan backend dengan PM2 (gunakan user non-root)
cd /var/www/downloader
pm2 start ecosystem.config.js
pm2 save
```

### Konfigurasi Nginx
```nginx
server {
    listen 80;
    server_name voiddl.my.id www.voiddl.my.id;

    # Frontend Single Page App
    location / {
        root /var/www/downloader/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
    }
}
```

Setelah DNS domain terhubung, amankan dengan Let's Encrypt SSL:
```bash
sudo certbot --nginx -d voiddl.my.id -d www.voiddl.my.id
```

---

## Lisensi & Aturan Kontribusi
Dibuat untuk tujuan utilitas pribadi dan edukasi. Pastikan Anda memiliki hak atau izin yang sah sebelum mengunduh media dari platform bersangkutan.

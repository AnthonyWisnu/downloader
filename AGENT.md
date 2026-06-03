# AGENT.md — Social Media Downloader (TikTok & Instagram)

## Ringkasan Proyek

Web app sederhana single-page untuk download konten TikTok dan Instagram (post, reels, stories).
Frontend: React + Vite (SPA). Backend: Node.js + Express. Hosting: DigitalOcean Ubuntu 22/24, PM2 + Nginx.

---

## Aturan Wajib untuk Semua File

- Tidak ada emoji di kode, komentar, string, atau print/console.log
- Gunakan icon dari `lucide-react` atau Font Awesome di UI, bukan emoji
- Tidak ada emdash (—), ganti dengan koma atau titik dua
- Komponen React maksimal 180 baris, pecah jika melewati satu tanggung jawab
- Komponen UI: 80-180 baris
- Hook: 200-300 baris
- Orchestrator/index: 250-350 baris
- Helper/util: bebas
- SRP (Single Responsibility Principle) per file
- Pisahkan folder: routes, controllers, services, utils, types

---

## Struktur Folder

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlInput.jsx          (80-180 baris) — form input URL
│   │   │   ├── ResultCard.jsx        (80-180 baris) — tampilkan hasil download
│   │   │   ├── PlatformBadge.jsx     (80-180 baris) — badge TikTok/IG
│   │   │   ├── DownloadButton.jsx    (80-180 baris) — tombol download per format
│   │   │   └── LoadingSpinner.jsx    (80-180 baris) — loading state
│   │   ├── hooks/
│   │   │   └── useDownloader.js      (200-300 baris) — logic fetch ke backend
│   │   ├── utils/
│   │   │   └── detectPlatform.js     — deteksi platform dari URL
│   │   ├── App.jsx                   (250-350 baris) — orchestrator utama
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── download.routes.js    — definisi endpoint
│   │   ├── controllers/
│   │   │   └── download.controller.js — handle request/response
│   │   ├── services/
│   │   │   ├── tiktok.service.js     — logic download TikTok
│   │   │   ├── instagram.service.js  — logic download IG via yt-dlp
│   │   │   └── cookies.service.js    — load dan validasi cookies IG
│   │   ├── utils/
│   │   │   └── sanitizeUrl.js        — validasi dan sanitasi URL input
│   │   └── app.js                    — entry point Express
│   ├── cookies/
│   │   └── ig_cookies.txt            — file cookies Netscape format (JANGAN di-commit)
│   ├── .env                          — variabel environment (JANGAN di-commit)
│   ├── .env.example                  — template .env untuk referensi
│   └── package.json
│
├── ecosystem.config.js               — konfigurasi PM2
├── .gitignore
└── AGENT.md
```

---

## Stack dan Dependency

### Frontend
```
react
react-dom
vite
lucide-react
axios
```

### Backend
```
express
cors
dotenv
@tobyg74/tiktok-api-dl     (TikTok downloader)
axios
```

### System Dependency (install di server)
```
yt-dlp                      (untuk Instagram, install via pip atau binary)
python3                     (runtime yt-dlp jika pakai pip)
```

---

## Endpoint API

### POST /api/download
Request body:
```json
{
  "url": "https://www.tiktok.com/@user/video/123..."
}
```

Response sukses:
```json
{
  "platform": "tiktok",
  "type": "video",
  "title": "...",
  "thumbnail": "https://...",
  "downloads": [
    { "label": "Video (No Watermark)", "url": "https://...", "format": "mp4" },
    { "label": "Audio Only", "url": "https://...", "format": "mp3" }
  ]
}
```

Response error:
```json
{
  "error": "URL tidak valid atau konten tidak dapat diakses"
}
```

### GET /api/health
Response: `{ "status": "ok" }`

---

## Alur Download per Platform

### TikTok
1. Frontend kirim URL ke `POST /api/download`
2. `download.controller.js` deteksi platform dari URL
3. Delegasi ke `tiktok.service.js`
4. `tiktok.service.js` panggil `@tobyg74/tiktok-api-dl`
5. Return array download links (video no watermark, audio, slideshow jika ada)
6. Frontend tampilkan `ResultCard` dengan tombol download per format

### Instagram (Post, Reels, Stories)
1. Frontend kirim URL ke `POST /api/download`
2. `download.controller.js` deteksi platform dari URL
3. Delegasi ke `instagram.service.js`
4. `instagram.service.js` panggil `yt-dlp` via `child_process.execFile`
   - Flag: `--cookies ./cookies/ig_cookies.txt`
   - Flag: `--dump-json` untuk ambil metadata
5. Parse output JSON dari yt-dlp
6. Return download links
7. Frontend tampilkan hasil

### Setup Cookies Instagram
1. Siapkan file `ig_cookies.txt` dalam format Netscape HTTP Cookie File
2. Taruh `ig_cookies.txt` langsung di `backend/cookies/`
3. Pastikan `.env` memakai `IG_COOKIES_PATH=./cookies/ig_cookies.txt`
4. yt-dlp membaca file tersebut lewat flag `--cookies ./cookies/ig_cookies.txt`
5. Ganti file jika cookies expired atau akun kehilangan akses

---

## Format Cookies Netscape (ig_cookies.txt)

yt-dlp membutuhkan format seperti ini:
```
# Netscape HTTP Cookie File
.instagram.com  TRUE  /  TRUE  1999999999  sessionid  xxxxx...
.instagram.com  TRUE  /  TRUE  1999999999  csrftoken   xxxxx...
```


---

## Environment Variables (.env)

```
PORT=3001
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
IG_COOKIES_PATH=./cookies/ig_cookies.txt
NODE_ENV=production
```

---

## .gitignore Wajib

```
backend/cookies/ig_cookies.txt
backend/.env
node_modules/
dist/
```

---

## Konfigurasi PM2 (ecosystem.config.js)

```js
module.exports = {
  apps: [
    {
      name: "downloader-backend",
      cwd: "./backend",
      script: "src/app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false,
      max_memory_restart: "300M"
    }
  ]
}
```

Frontend di-build sebagai static file, serve via Nginx.

---

## Konfigurasi Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static
    location / {
        root /var/www/downloader/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }
}
```

Setelah domain aktif, tambahkan SSL dengan Certbot:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Checklist Deployment ke DigitalOcean

### Persiapan Server
- [ ] SSH ke droplet
- [ ] Update sistem: `sudo apt update && sudo apt upgrade -y`
- [ ] Install Node.js 20 LTS via nvm
- [ ] Install PM2: `npm install -g pm2`
- [ ] Install yt-dlp: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp`
- [ ] Install Nginx: `sudo apt install nginx -y`

### Deploy Aplikasi
- [ ] Clone repo ke `/var/www/downloader`
- [ ] `cd backend && npm install`
- [ ] Upload `ig_cookies.txt` format Netscape ke `backend/cookies/` via SCP atau SFTP
- [ ] Buat file `.env` di backend sesuai `.env.example`
- [ ] `cd frontend && npm install && npm run build`
- [ ] Copy konfigurasi Nginx dan reload: `sudo nginx -t && sudo systemctl reload nginx`
- [ ] Jalankan PM2: `pm2 start ecosystem.config.js`
- [ ] Simpan PM2: `pm2 save && pm2 startup`

### Verifikasi
- [ ] `pm2 status` semua apps running
- [ ] `curl http://localhost:3001/api/health` response ok
- [ ] Akses domain di browser, coba download satu URL TikTok
- [ ] Coba download satu URL Instagram post
- [ ] Coba download Instagram Story

---

## Checkpoint Stop-and-Confirm

Sebelum mulai implementasi, konfirmasi ke user di setiap fase:

1. **Checkpoint 1**: Setelah struktur folder dibuat, sebelum menulis logika service
2. **Checkpoint 2**: Setelah backend selesai dan bisa ditest lokal, sebelum mulai frontend
3. **Checkpoint 3**: Setelah frontend selesai dan bisa ditest lokal, sebelum deployment
4. **Checkpoint 4**: Setelah Nginx + PM2 setup, sebelum SSL

---

## Catatan Keamanan

- Cookies IG tidak pernah dikirim ke frontend, hanya dipakai di server
- Tidak ada endpoint yang expose path cookies ke luar
- Validasi URL input di backend sebelum diproses (sanitizeUrl.js)
- CORS hanya izinkan origin frontend yang terdaftar di .env
- Rate limiting bisa ditambahkan nanti via `express-rate-limit` jika trafik ramai
- File cookies ada di .gitignore, tidak pernah masuk repo

---

## Catatan Library

- `@tobyg74/tiktok-api-dl`: handle video, audio, slideshow TikTok tanpa yt-dlp
- `yt-dlp`: handle semua tipe konten Instagram dengan cookies, sangat battle-tested
- Jika `@tobyg74/tiktok-api-dl` bermasalah di masa depan, fallback ke scraping manual endpoint TikTok tidak resmi
- yt-dlp perlu diupdate berkala: `sudo yt-dlp -U`

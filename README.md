# VOID Downloader

VOID Downloader is a single-page web app for fetching downloadable media links from TikTok and Instagram content, including TikTok videos, Instagram posts, Reels, and Stories.

The project is built as a utility-first app with a monochrome brutalist interface. The frontend is a React + Vite SPA, and the backend is a Node.js + Express API.

## Features

- Download metadata and media links from TikTok URLs
- Download metadata and media links from Instagram posts, Reels, and Stories
- Instagram support through `yt-dlp` and a private Netscape-format cookies file
- Local API proxy through Vite during development
- Production deployment with PM2 and Nginx
- No Instagram cookies exposed to the frontend

## Tech Stack

Frontend:
- React
- Vite
- Axios
- Lucide React

Backend:
- Node.js
- Express
- CORS
- dotenv
- `@tobyg74/tiktok-api-dl`
- `yt-dlp` as a system dependency for Instagram

Production:
- Ubuntu 22.04 or 24.04
- PM2
- Nginx
- Certbot SSL

## Project Structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── globals.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── cookies/
│   │   └── ig_cookies.txt
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── ecosystem.config.js
├── AGENT.md
├── DESIGN.md
├── PLAN.md
└── README.md
```

## API

### `GET /api/health`

Returns backend health status.

```json
{
  "status": "ok"
}
```

### `POST /api/download`

Request:

```json
{
  "url": "https://www.instagram.com/reel/..."
}
```

Successful response:

```json
{
  "platform": "instagram",
  "type": "reels",
  "title": "Video by username",
  "thumbnail": "https://...",
  "downloads": [
    {
      "label": "Video",
      "url": "https://...",
      "format": "mp4"
    }
  ]
}
```

Error response:

```json
{
  "error": "URL tidak valid atau konten tidak dapat diakses"
}
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Default backend URL:

```text
http://localhost:3001
```

Health check:

```bash
curl http://localhost:3001/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

In development, Vite proxies `/api` requests to `http://127.0.0.1:3001`.

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=3001
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
IG_COOKIES_PATH=./cookies/ig_cookies.txt
NODE_ENV=production
```

For production on `voiddl.my.id`, use:

```env
PORT=3001
FRONTEND_URL=https://voiddl.my.id,https://www.voiddl.my.id,http://voiddl.my.id,http://www.voiddl.my.id,http://167.172.92.108
IG_COOKIES_PATH=./cookies/ig_cookies.txt
NODE_ENV=production
```

## Instagram Cookies

Instagram downloads require a private cookies file:

```text
backend/cookies/ig_cookies.txt
```

The file must use Netscape HTTP Cookie File format:

```text
# Netscape HTTP Cookie File
.instagram.com  TRUE  /  TRUE  1999999999  sessionid  xxxxx
.instagram.com  TRUE  /  TRUE  1999999999  csrftoken  xxxxx
```

This file is intentionally ignored by git:

```text
backend/cookies/ig_cookies.txt
```

Do not commit or expose this file. Upload it manually to the server after cloning the repository.

## Production Deployment

Target server example:

```text
Ubuntu 24.04
Node.js 22
PM2
Nginx
Domain: voiddl.my.id
Droplet IP: 167.172.92.108
```

Install server dependencies:

```bash
apt update && apt upgrade -y
apt install -y curl git nginx python3 build-essential pkg-config \
  libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

Install PM2 and `yt-dlp`:

```bash
npm install -g pm2

curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp

chmod a+rx /usr/local/bin/yt-dlp
yt-dlp --version
```

Clone and install:

```bash
cd /var/www
git clone https://github.com/AnthonyWisnu/downloader.git
cd /var/www/downloader/backend
npm install
```

Create `backend/.env`, then upload `ig_cookies.txt`:

```bash
chmod 600 /var/www/downloader/backend/cookies/ig_cookies.txt
```

Build frontend:

```bash
cd /var/www/downloader/frontend
npm install
npm run build
```

Start backend:

```bash
cd /var/www/downloader
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

Nginx config:

```nginx
server {
    listen 80;
    server_name voiddl.my.id www.voiddl.my.id 167.172.92.108;

    location / {
        root /var/www/downloader/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
    }
}
```

Enable Nginx config:

```bash
ln -sf /etc/nginx/sites-available/downloader /etc/nginx/sites-enabled/downloader
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Install SSL after DNS points to the droplet:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d voiddl.my.id -d www.voiddl.my.id
```

## Verification

Backend:

```bash
curl http://localhost:3001/api/health
```

Public API:

```bash
curl http://167.172.92.108/api/health
curl https://voiddl.my.id/api/health
```

PM2:

```bash
pm2 status
pm2 logs downloader-backend
```

## Security Notes

- `ig_cookies.txt` is never sent to the frontend
- The backend only passes cookies to `yt-dlp`
- Cookies and `.env` are ignored by git
- CORS is restricted through `FRONTEND_URL`
- User URLs are validated before platform services process them

## Design

The UI follows `DESIGN.md`:

- Monochrome brutalist style
- No gradients
- No shadows
- No rounded corners
- No emoji
- JetBrains Mono typography
- Preview media uses a direct video player when a video URL is available

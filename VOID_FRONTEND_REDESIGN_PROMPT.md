# VOID Downloader - Frontend Redesign Prompt

## Konteks Project

Kamu sedang mengerjakan project **VOID Downloader**, sebuah web tool gratis untuk download video TikTok dan Instagram (Reels, Post, Story, Slideshow) tanpa watermark. Tool ini ditujukan untuk semua orang, dengan tone santai dan fun.

- Frontend: React + Vite, ada di folder `frontend/src/`
- Backend: sudah selesai, **jangan disentuh**
- Jangan ubah endpoint API, nama field response, atau logika `useDownloader.js` secara breaking
- Jangan install dependency baru kecuali benar-benar perlu
- Jangan gunakan em dash di teks manapun
- Jangan gunakan emoji di UI, gunakan icon dari `lucide-react`
- Pastikan `npm run build` berhasil setelah semua perubahan

---

## Struktur Frontend Saat Ini

```
frontend/src/
  components/
    AudioPreview.jsx
    DownloadButton.jsx
    FeatureSection.jsx
    HowItWorks.jsx
    HowToSection.jsx
    PlatformBadge.jsx
    ResultCard.jsx
    SlideshowPreview.jsx
    UrlInput.jsx
  hooks/
    useDownloader.js
  utils/
    detectPlatform.js
    mediaProxy.js
  App.jsx
  globals.css
  main.jsx
```

---

## Masalah UI yang Harus Diperbaiki

Berikut masalah nyata yang terlihat dari kondisi UI sekarang:

1. Seluruh halaman full black (#000000), tidak ada variasi background antar section, semua terasa sama dan monoton
2. Tombol GRAB warnanya abu-abu gelap, hampir tidak terlihat kontrasnya, padahal ini tombol paling penting
3. Input field terlalu flat dan tidak punya visual hierarchy yang jelas
4. Feature cards satu kolom semua di mobile, scroll sangat panjang dan boros ruang
5. How to section pakai card vertikal besar per step, terlalu panjang
6. Tidak ada warna aksen sama sekali pada badge, icon, label, atau step number
7. Footer sangat kosong, hanya ada "VOID v1.0.0" dan "SERVER: OK"
8. Tidak ada section platform support, tidak ada visual yang menjelaskan TikTok dan Instagram didukung
9. Konten halaman terlalu sedikit, terasa seperti dokumentasi bukan landing page produk
10. Hero section tidak punya elemen visual yang kuat, tidak memorable

---

## Tujuan Redesign

Ubah VOID Downloader dari tampilan yang terasa seperti dokumentasi CLI menjadi **landing page produk yang fun, colorful, dan profesional**. Tetap gunakan konsep **neobrutalism** (border tebal, shadow keras, layout tegas, font bold), tapi tambahkan warna cerah agar tidak monoton. Referensi vibe: Saweria, tapi untuk tool downloader.

---

## Palet Warna

Definisikan semua warna sebagai CSS variables di `globals.css`:

```css
:root {
  --ink: #111111;
  --off-white: #fff8e7;
  --yellow: #ffd84d;
  --pink: #ff5fa2;
  --purple: #8b5cf6;
  --cyan: #38d5ff;
  --lime: #9cff57;
  --orange: #ff8a3d;
  --white: #ffffff;

  --border: 2px solid var(--ink);
  --border-thick: 3px solid var(--ink);
  --shadow-sm: 3px 3px 0px var(--ink);
  --shadow-md: 5px 5px 0px var(--ink);
  --shadow-lg: 8px 8px 0px var(--ink);

  --radius-sm: 4px;
  --radius-md: 8px;

  --font-display: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

Boleh sesuaikan font, tapi hindari Arial, Inter, dan Roboto.

---

## Aturan Styling

- Gunakan CSS variables untuk semua warna, shadow, dan border, jangan hardcode nilai
- Jangan install library styling baru
- Tetap gunakan plain CSS
- Rapikan `globals.css`, pisahkan ke `frontend/src/styles/` jika sudah terlalu besar, lalu import dari `main.jsx`
- Utility class boleh dibuat custom
- className harus mudah dibaca dan konsisten
- Setiap komponen punya class sendiri yang tidak bentrok

### Aturan batas baris per jenis file

- Komponen UI: 80-180 baris
- Orchestrator (App.jsx): 250-350 baris
- Hooks: 200-300 baris
- Helper/utils: bebas
- Jika komponen melebihi batas atau punya lebih dari satu tanggung jawab, pecah menjadi komponen terpisah

### Prinsip struktur

- SRP: satu file, satu tanggung jawab
- Pisahkan components, hooks, utils, dan styles ke folder masing-masing
- React components idealnya di bawah 180 baris, pecah jika melewati satu tanggung jawab

---

## Rotasi Background Antar Section

Jangan gunakan background hitam untuk semua section. Gunakan rotasi warna agar halaman terasa hidup:

| Section | Background | Teks utama |
|---|---|---|
| Hero | `--ink` | `--off-white` |
| Downloader Panel | `--yellow` | `--ink` |
| Platform Support | `--off-white` | `--ink` |
| Feature Grid | `--purple` | `--white` |
| How To | `--off-white` | `--ink` |
| FAQ | `--ink` | `--off-white` |
| Footer | `--ink` | `--off-white` |

Boleh disesuaikan, tapi tidak boleh ada dua section berturut-turut dengan background yang sama.

---

## Struktur Halaman yang Diinginkan

Susun halaman dalam urutan berikut di `App.jsx`:

```
1. HeroSection
2. DownloaderPanel  <-- section utama, paling penting
3. ResultSection    <-- muncul hanya jika ada hasil
4. PlatformSupport
5. FeatureGrid
6. HowToSection
7. FAQSection
8. Footer
```

---

## Detail Tiap Section

### 1. HeroSection (komponen baru: `HeroSection.jsx`)

Background: `--ink`, teks: `--off-white`

Konten:
- Label kecil di atas: `[ FREE TOOL ]` dengan background `--yellow`, teks `--ink`, border tebal
- Judul besar: `VOID` dengan ukuran sangat besar (min 5rem mobile, 8rem desktop). Boleh pakai outline text (text-stroke) dengan warna `--yellow` untuk efek
- Subjudul di bawah: `Download TikTok dan Instagram tanpa ribet. No watermark. No login.`
- Baris badge platform horizontal: badge `TikTok`, `Instagram`, `Reels`, `Story`, `Slideshow` masing-masing dengan background warna berbeda (yellow, cyan, pink, lime, orange), border tebal, teks hitam
- Stat row: tiga item dalam satu baris, misalnya `2 Platform`, `No Watermark`, `No Login`, masing-masing dengan border tebal dan background off-white
- Scroll hint ke bawah: icon `ChevronDown` dari lucide-react, animasi bounce ringan

Visual tambahan yang disarankan:
- Pattern dot atau grid tipis sebagai background texture di hero (CSS only, bukan gambar)
- Atau border bottom tebal dengan warna yellow sebagai pemisah ke section berikutnya

### 2. DownloaderPanel (komponen baru: `DownloaderPanel.jsx`)

Background: `--yellow`, teks: `--ink`

Ini section paling penting di halaman. Harus terlihat bold dan menonjol.

Konten:
- Label section: `GRAB YOUR CONTENT`
- Input URL: background `--white`, border tebal hitam, shadow brutalist, font monospace. Placeholder: `Tempel link TikTok atau Instagram di sini...`
- Microcopy di bawah input: `Mendukung TikTok video, Instagram Reels, Post, dan Story`
- Tombol GRAB: background `--ink`, teks `--yellow`, border tebal, shadow brutalist besar (`--shadow-lg`). Saat hover: transform translate(-2px, -2px), shadow lebih besar. Saat active: transform translate(2px, 2px), shadow mengecil. Font bold, uppercase
- Status baris di bawah tombol: tampilkan platform yang terdeteksi (`PLATFORM: TIKTOK` atau `PLATFORM: INSTAGRAM`) dengan badge warna. Jika belum ada input tampilkan `INPUT: KOSONG`
- Loading state: tampilkan spinner atau animasi teks `GRABBING...` dengan warna ink, jangan hanya disabled button
- Error state: card dengan background `--pink`, border tebal, icon `AlertCircle` dari lucide-react, teks error jelas

Gunakan ulang `UrlInput.jsx` dan `useDownloader.js`, refactor tampilannya saja.

### 3. ResultSection

Muncul hanya jika `result` ada. Gunakan ulang atau refactor `ResultCard.jsx`.

Konten ResultCard yang harus ada:
- Badge platform di pojok kiri atas dengan warna platform (TikTok: cyan, Instagram: pink)
- Judul konten jika tersedia
- Preview video atau image slideshow
- Tombol download: background `--yellow`, border tebal, shadow, icon `Download` dari lucide-react
- Jika ada audio only section, tampilkan dalam card terpisah dengan background `--purple`, teks putih
- Jika audio tidak tersedia, tampilkan warning card dengan background `--orange`, icon `VolumeX`, teks penjelasan singkat
- Tombol "Grab Lagi" untuk reset ke input awal

Gunakan ulang `AudioPreview.jsx` dan `SlideshowPreview.jsx`, refactor tampilannya.

### 4. PlatformSupport (komponen baru: `PlatformSupport.jsx`)

Background: `--off-white`, teks: `--ink`

Label section: `PLATFORM YANG DIDUKUNG`

Tampilkan 5 card dalam grid (2 kolom mobile, 3 kolom desktop), masing-masing card punya:
- Icon dari lucide-react yang relevan
- Nama platform/tipe konten
- Deskripsi singkat satu kalimat
- Background warna berbeda tiap card (rotasi dari palet)

Card yang harus ada:
- **TikTok Video**: Download video TikTok tanpa watermark
- **TikTok Slideshow**: Download kumpulan foto dari postingan slideshow TikTok
- **Instagram Reels**: Download Reels langsung dari link Instagram
- **Instagram Post**: Download foto atau video dari postingan Instagram
- **Instagram Story**: Download Story Instagram yang sedang aktif

Setiap card: border tebal, shadow brutalist, hover effect (translate + shadow berubah).

### 5. FeatureGrid (komponen baru: `FeatureGrid.jsx`)

Background: `--purple`, teks: `--white`

Label section: `KENAPA VOID`

Grid 2 kolom mobile, 3 kolom desktop. Setiap card fitur punya:
- Icon dari lucide-react
- Judul fitur
- Deskripsi singkat

Fitur yang harus ada:
- **Preview Dulu**: Lihat video sebelum download, pastikan file yang diambil benar
- **Tanpa Aplikasi**: Buka dari browser di HP, tablet, atau desktop
- **Cepat Dipakai**: Tempel link, klik tombol, pilih file. Tidak ada langkah rumit
- **Aman di Server**: Cookie Instagram diproses di backend, tidak dikirim ke browser
- **Proxy Media**: Media di-proxy lewat server, tidak ada request langsung ke platform
- **Format Jelas**: File yang didownload punya nama dan format yang jelas

Card style: background `rgba(255,255,255,0.1)`, border `1px solid rgba(255,255,255,0.3)`, hover: background lebih terang. Atau gunakan card dengan background `--ink` dan teks `--off-white` agar kontras dengan background purple.

### 6. HowToSection (refactor `HowToSection.jsx`)

Background: `--off-white`, teks: `--ink`

Label section: `CARA PAKAI`

Ubah dari card vertikal besar menjadi layout 3 langkah yang lebih ringkas:
- Di mobile: susun vertikal dengan nomor besar di kiri, konten di kanan
- Di desktop: tiga kolom sejajar

Tiga langkah:
1. **Salin Link**: Buka TikTok atau Instagram. Salin URL video, Reels, post, atau Story.
2. **Tempel ke VOID**: Kembali ke VOID. Tempel URL ke input lalu klik tombol GRAB.
3. **Preview dan Download**: Cek preview media, lalu klik tombol download untuk menyimpan file.

Nomor langkah (01, 02, 03) harus besar dan bold, gunakan warna `--yellow` sebagai aksen.

### 7. FAQSection (komponen baru: `FAQSection.jsx`)

Background: `--ink`, teks: `--off-white`

Label section: `FAQ`

Tampilkan sebagai accordion atau list Q&A yang rapi. Setiap item punya border bottom tipis sebagai pemisah.

FAQ yang harus ada:
- **Apakah VOID gratis?** Ya, VOID sepenuhnya gratis. Tidak ada biaya, tidak ada login, tidak ada batas download.
- **Platform apa saja yang didukung?** Saat ini VOID mendukung TikTok (video dan slideshow) dan Instagram (Reels, Post, Story).
- **Kenapa beberapa audio tidak tersedia?** Beberapa video TikTok menggunakan audio yang dilindungi hak cipta. Jika audio tidak tersedia, hanya video tanpa suara yang bisa didownload.
- **Kenapa Instagram butuh proses lebih lama?** Konten Instagram diproses melalui backend menggunakan autentikasi yang aman. Proses ini sedikit lebih lama tapi lebih andal.
- **Apakah link yang saya masukkan disimpan?** Tidak. Link hanya digunakan untuk mengambil metadata dan media, lalu langsung dibuang.
- **Kenapa video tertentu gagal diunduh?** Beberapa konten private, konten yang sudah dihapus, atau konten dengan pembatasan platform tidak bisa diambil.

### 8. Footer (komponen baru: `Footer.jsx`)

Background: `--ink`, teks: `--off-white`

Konten:
- Logo/nama: `VOID` dalam font besar bold dengan aksen warna `--yellow`
- Tagline: `Built for fast social media access.`
- Teks kecil disclaimer: `VOID hanya untuk konten yang kamu miliki atau punya izin untuk didownload. Gunakan dengan bertanggung jawab.`
- Server status: `SERVER: OK` atau `SERVER: ERROR` dengan dot indicator berwarna (lime untuk OK, pink untuk error)
- Versi: `v1.0.0`

---

## Micro Interaction

- Semua card dan tombol punya hover effect: `transform: translate(-2px, -2px)` dan shadow lebih besar
- Saat active/click: `transform: translate(2px, 2px)` dan shadow mengecil
- Input focus state: border lebih tebal atau warna border berubah ke `--yellow`, outline jelas
- Transition: `transition: all 0.15s ease` cukup, jangan animasi berat
- Loading state: teks animasi atau spinner ringan, bukan hanya button disabled
- Jangan gunakan animasi yang mengganggu performa mobile

---

## Responsiveness

Mobile (default):
- Input dan button full width
- Card satu kolom atau dua kolom tergantung section
- Preview video max-height 280px
- Spacing nyaman, padding section min 2rem
- Font judul hero min 4rem

Desktop (min-width: 768px):
- Hero bisa dua kolom atau centered dengan max-width
- Downloader panel centered dengan max-width 640px
- Feature cards dan platform cards grid 3 kolom
- How to section tiga kolom sejajar
- Tidak ada area yang terlihat kosong

---

## Accessibility

- Setiap input punya label atau aria-label yang jelas
- Button disabled state harus terlihat (opacity berbeda, cursor not-allowed)
- Focus state harus terlihat untuk keyboard navigation
- Contrast teks harus cukup, terutama teks di atas background warna
- Jangan hanya mengandalkan warna untuk menyampaikan status error atau sukses, tambahkan teks atau icon
- Video tetap punya controls jika ditampilkan

---

## Batasan yang Tidak Boleh Dilanggar

- Jangan ubah endpoint API
- Jangan ubah nama field dari response backend
- Jangan hapus fitur: preview video, download button, slideshow, audio preview
- Jangan ubah `useDownloader.js` secara breaking
- Jangan ubah `mediaProxy.js` kecuali benar-benar diperlukan
- Jangan tambahkan dependency baru kecuali benar-benar diperlukan
- Jangan buat desain terlalu ramai sampai fungsi utama download tenggelam
- Jangan gunakan em dash di teks manapun
- Jangan gunakan emoji, gunakan icon dari lucide-react

---

## File yang Perlu Disentuh

Buat atau ubah file berikut:

```
frontend/src/
  App.jsx                          -- refactor struktur section
  globals.css                      -- atau pecah ke styles/
  styles/
    variables.css                  -- CSS variables
    base.css                       -- reset dan base styles
    utilities.css                  -- utility classes
  components/
    HeroSection.jsx                -- BARU
    DownloaderPanel.jsx            -- BARU, wrap UrlInput
    ResultSection.jsx              -- BARU atau refactor ResultCard
    PlatformSupport.jsx            -- BARU
    FeatureGrid.jsx                -- BARU, gantikan FeatureSection
    HowToSection.jsx               -- REFACTOR total
    FAQSection.jsx                 -- BARU
    Footer.jsx                     -- BARU
    UrlInput.jsx                   -- REFACTOR tampilan
    ResultCard.jsx                 -- REFACTOR total
    DownloadButton.jsx             -- REFACTOR tampilan
    AudioPreview.jsx               -- REFACTOR tampilan
    SlideshowPreview.jsx           -- REFACTOR tampilan
    PlatformBadge.jsx              -- REFACTOR tampilan
```

---

## Acceptance Criteria

Pastikan semua poin ini terpenuhi sebelum selesai:

- [ ] Website tetap bisa submit URL dan trigger download flow
- [ ] Loading state muncul saat proses berlangsung
- [ ] Error state tampil jelas jika URL invalid atau API gagal
- [ ] Result card menampilkan preview, judul, platform badge, dan tombol download
- [ ] Slideshow tetap tampil jika result berupa gambar
- [ ] Audio preview tetap tampil jika ada audio only
- [ ] Tombol GRAB adalah elemen paling mencolok di halaman saat belum ada result
- [ ] Background tidak monoton hitam di semua section
- [ ] Minimal ada 4 warna berbeda dipakai sebagai background section
- [ ] Tidak ada section yang terlihat kosong di desktop
- [ ] Mobile layout tidak overflow dan nyaman dipakai
- [ ] Feature cards menggunakan grid 2 kolom di mobile
- [ ] Platform support section ada dan menjelaskan TikTok dan Instagram
- [ ] FAQ section ada dengan minimal 5 pertanyaan
- [ ] Footer ada dan tidak kosong
- [ ] Tidak ada perubahan backend
- [ ] `npm run build` berhasil tanpa error

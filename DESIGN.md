# DESIGN.md — VOID (Social Media Downloader)

## Konsep Visual

**Tema**: Monochrome Brutalist, High-Contrast Dark Mode
**Filosofi**: Ini adalah alat (utility), bukan produk konsumer. Tidak ada dekorasi.
Setiap elemen ada karena fungsi, bukan estetika. Keindahan muncul dari konsistensi dan ketegasan struktur.
**Referensi**: Terminal Linux, dokumentasi teknis, grid sistem cetak era 1970-an.

---

## Palet Warna

```
--color-bg:         #000000   /* latar belakang utama, hitam pekat */
--color-text:       #FFFFFF   /* teks utama, border utama */
--color-accent:     #D4D4D8   /* Zinc 300, elemen interaktif (hover, fokus) */
--color-divider:    #3F3F46   /* Zinc 700, pembatas konten sekunder */
--color-muted:      #71717A   /* Zinc 500, teks placeholder dan label kecil */
--color-success:    #FFFFFF   /* tidak ada warna hijau, sukses = teks putih tebal */
--color-error:      #FFFFFF   /* error tetap putih, dibedakan dengan border merah 1px */
--color-error-border: #EF4444 /* satu-satunya pengecualian warna non-monochrome */
```

Aturan: tidak ada warna selain di atas kecuali `--color-error-border` untuk state error.
Tidak ada gradien. Tidak ada transparansi (opacity 1 untuk semua elemen utama).

---

## Tipografi

**Font Utama**: `JetBrains Mono` (preferred) atau `IBM Plex Mono` sebagai fallback.
Import via Google Fonts:
```
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap
```

```
--font-family:     'JetBrains Mono', 'IBM Plex Mono', monospace

--text-hero:       clamp(4rem, 12vw, 10rem)   /* nama app VOID */
--text-tagline:    clamp(0.75rem, 1.5vw, 1rem)
--text-label:      0.75rem
--text-body:       0.9rem
--text-input:      1rem
--text-button:     0.85rem
--text-footer:     0.7rem

--weight-regular:  400
--weight-bold:     700
--weight-black:    800
```

Semua teks: `letter-spacing: 0.05em` untuk kesan dokumentasi teknis.
Tidak ada huruf kapital otomatis kecuali nama app dan label badge platform.

---

## Border dan Spacing

```
--border-width:    3px
--border-thin:     1px
--border-color:    #FFFFFF
--border-divider:  #3F3F46
--radius:          0px        /* tidak ada border-radius sama sekali */

--space-xs:        8px
--space-sm:        16px
--space-md:        24px
--space-lg:        48px
--space-xl:        80px
--space-hero:      120px
```

Aturan: semua elemen kotak. Tidak ada `border-radius`, tidak ada `pill`, tidak ada `rounded`.

---

## Animasi dan Transisi

**Prinsip**: Instant atau tidak sama sekali.

```
--transition-instant:  0ms
--transition-minimal:  80ms   /* hanya untuk hover state border/warna */
```

- Tidak ada `ease-in-out`, tidak ada `cubic-bezier` yang halus
- `ResultCard` muncul: `display: block` langsung, tanpa fade, tanpa slide
- Loading state: teks berubah dari "DOWNLOAD" ke "LOADING..." secara instan
- Hover tombol: border berubah warna dalam 80ms, tidak ada scale atau shadow
- Tidak ada skeleton loader, cukup teks `[ FETCHING... ]`

---

## Komponen UI

### Hero Section

```
Layout   : teks rata kiri, full width
Nama app : "VOID" — font-size: var(--text-hero), weight: 800, warna: #FFFFFF
Tagline  : satu baris teks kecil di bawah nama app
           contoh: "// download tiktok & instagram. no watermark. no bullshit."
           font-size: var(--text-tagline), color: var(--color-muted)
Separator: garis horizontal 1px warna #FFFFFF full width di bawah hero
```

---

### UrlInput.jsx

```
Container  : width 100%, tidak ada padding kiri-kanan tambahan
Input field:
  - border: 3px solid #FFFFFF
  - background: #000000
  - color: #FFFFFF
  - font: JetBrains Mono, 1rem
  - padding: 16px
  - border-radius: 0
  - placeholder: "PASTE URL HERE_" (underscore untuk kesan cursor terminal)
  - focus: border-color tetap #FFFFFF, outline: none, tidak ada glow

Tombol GRAB:
  - posisi: kanan input,붙어있ang (inline atau absolute kanan)
  - background: #FFFFFF
  - color: #000000
  - border: 3px solid #FFFFFF
  - font: JetBrains Mono, 0.85rem, weight 700
  - padding: 16px 24px
  - border-radius: 0
  - hover: background #000000, color #FFFFFF (inverse, transisi 80ms)
  - label: "[ GRAB ]"
  - loading state: "[ ... ]" teks ganti instan, disabled

Error state:
  - border input berubah ke #EF4444 (1px, bukan 3px)
  - teks error muncul di bawah input: warna #EF4444, font-size 0.75rem
  - format: "ERR: URL tidak valid atau platform tidak didukung"
```

---

### PlatformBadge.jsx

```
Bentuk  : kotak persegi, bukan pill
Border  : 1px solid #FFFFFF
Padding : 2px 8px
Font    : JetBrains Mono, 0.7rem, weight 700
Warna   : background #000000, text #FFFFFF
Label   : "TIKTOK" atau "INSTAGRAM" atau "INSTAGRAM STORY"
Posisi  : pojok kiri atas ResultCard
```

---

### ResultCard.jsx

```
Container:
  - border: 3px solid #FFFFFF
  - padding: 24px
  - background: #000000
  - margin-top: 24px
  - muncul instan (tidak ada animasi)

Struktur internal (atas ke bawah):
  1. Baris atas: PlatformBadge + tipe konten (VIDEO / AUDIO / SLIDESHOW / REELS / STORY)
     dipisah dengan garis vertikal 1px warna #3F3F46
  2. Separator horizontal: 1px solid #3F3F46
  3. Thumbnail (jika ada):
     - max-height: 200px, object-fit: cover
     - border: 1px solid #3F3F46
     - tidak ada border-radius
  4. Judul konten: font 0.85rem, color #D4D4D8, satu baris, overflow ellipsis
  5. Separator horizontal: 1px solid #3F3F46
  6. Daftar DownloadButton (satu per baris, lihat komponen di bawah)
```

---

### DownloadButton.jsx

```
Satu baris per opsi download, full width
Layout: [FORMAT_LABEL]  ----  [ DOWNLOAD ]

Kiri  : label format, contoh "MP4 / NO WATERMARK" atau "MP3 / AUDIO" atau "SLIDESHOW"
         font 0.8rem, color #D4D4D8
Kanan : tombol "[ DOWNLOAD ]"
         border: 1px solid #FFFFFF
         background: #000000
         color: #FFFFFF
         padding: 6px 16px
         font: JetBrains Mono 0.8rem weight 700
         hover: background #FFFFFF, color #000000, transisi 80ms
         border-radius: 0

Separator antar opsi: 1px solid #3F3F46
```

---

### LoadingSpinner.jsx

Tidak ada spinner grafis. Ganti dengan teks terminal:
```
[ FETCHING... ]
```
Teks putih, font monospace, rata tengah atau rata kiri konsisten dengan layout.
Tidak ada animasi putar, tidak ada dots yang bergerak.
Jika ingin ada indikasi "hidup", gunakan blinking cursor CSS:
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
.cursor::after {
  content: '_';
  animation: blink 1s step-end infinite;
}
```

---

### Footer

```
Posisi     : bawah halaman, setelah semua konten
Border     : 1px solid #3F3F46 di atas footer
Padding    : 16px 0
Font       : 0.7rem, color: #71717A (Zinc 500)
Konten     :
  kiri  — "VOID v1.0.0"
  kanan — "SERVER: OK" atau "SERVER: ERROR" (dari GET /api/health)
Layout     : flexbox, space-between
```

---

## Layout Halaman (Single-Page, Mobile-First)

```
max-width: 860px
margin: 0 auto
padding: 0 24px

Urutan vertikal:
  1. Hero Section          (padding-top: 80px)
  2. Separator 1px #FFFFFF (margin: 24px 0)
  3. UrlInput Section      (margin-bottom: 24px)
  4. ResultCard            (muncul di sini jika ada hasil)
  5. Footer                (margin-top: auto, padding-top: 48px)
```

---

## Aturan yang Tidak Boleh Dilanggar

1. Tidak ada `border-radius` di manapun kecuali 0
2. Tidak ada `box-shadow` atau `drop-shadow`
3. Tidak ada `backdrop-filter` atau `blur`
4. Tidak ada gradien
5. Tidak ada warna selain palet di atas (pengecualian: `#EF4444` untuk error border)
6. Tidak ada animasi dengan durasi lebih dari 80ms
7. Tidak ada spinner grafis, ikon loading, atau skeleton loader
8. Tidak ada emoji di seluruh UI, gunakan ikon Lucide jika butuh ikon fungsional
9. Semua teks menggunakan `JetBrains Mono`
10. Semua tombol menggunakan format `[ LABEL ]` dengan bracket kotak

---

## Contoh Teks UI

```
Nama app       : VOID
Tagline        : // download tiktok & instagram. no watermark. no bullshit.
Placeholder    : PASTE URL HERE_
Tombol grab    : [ GRAB ]
Loading        : [ FETCHING... ]
Download       : [ DOWNLOAD ]
Error prefix   : ERR:
Badge TikTok   : TIKTOK
Badge IG       : INSTAGRAM
Badge Story    : INSTAGRAM STORY
Tipe konten    : VIDEO / AUDIO / SLIDESHOW / REELS / STORY
Footer app     : VOID v1.0.0
Footer status  : SERVER: OK
```

---

## Referensi Implementasi React

- Semua style via CSS Modules atau satu file `globals.css` dengan CSS variables
- Tidak menggunakan Tailwind (terlalu banyak utilitas yang berlawanan dengan prinsip ini)
- Atau jika pakai Tailwind, hanya gunakan class yang konsisten dengan palet di atas
- Lucide React untuk ikon fungsional (download, copy link) jika dibutuhkan
- Tidak ada component library seperti shadcn atau MUI

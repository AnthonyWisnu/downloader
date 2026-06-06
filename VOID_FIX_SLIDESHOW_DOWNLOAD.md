# VOID Downloader - Fix Slideshow Download

## Konteks

Ini adalah lanjutan dari redesign frontend VOID Downloader.
Ada dua masalah yang harus diperbaiki sekarang.

Jangan ubah hal lain selain yang disebutkan di sini.
Jangan install dependency baru.
Pastikan `npm run build` berhasil setelah perubahan.

---

## Masalah 1: File gambar slideshow ter-download sebagai file tanpa ekstensi dan ukurannya sangat kecil

### Gejala

Ketika user klik tombol download untuk slideshow image, file yang ter-download:
- Tidak punya ekstensi (nama file hanya `void-download` tanpa `.jpg`)
- Ukurannya sangat kecil (2-13 KB), jauh terlalu kecil untuk gambar
- File tidak bisa dibuka sebagai gambar

### Kemungkinan Penyebab

Backend endpoint untuk download gambar kemungkinan mengembalikan JSON atau response yang salah,
bukan binary image. Atau header `Content-Type` dan `Content-Disposition` tidak di-set dengan benar.

### Yang Harus Diperiksa dan Diperbaiki

**Di backend, periksa file-file berikut:**

1. `cos/download.controller.js` atau `cos/file.controller.js`
   - Cari handler yang menangani download gambar/slideshow
   - Pastikan endpoint melakukan fetch binary dari URL gambar
   - Pastikan response header di-set dengan benar sebelum mengirim data:
     ```
     Content-Type: image/jpeg
     Content-Disposition: attachment; filename="void-image-1.jpg"
     ```
   - Pastikan yang dikirim ke client adalah binary buffer dari gambar, bukan JSON wrapper

2. `services/` atau `utils/` yang handle proxy media gambar
   - Pastikan ketika mem-proxy gambar, response body di-pipe langsung ke client sebagai binary
   - Jangan wrap binary dalam JSON

**Contoh pola yang benar di Express:**

```js
// Fetch gambar dari URL asli
const response = await fetch(imageUrl);
const buffer = await response.arrayBuffer();

// Set header yang benar
res.set({
  'Content-Type': 'image/jpeg',
  'Content-Disposition': `attachment; filename="void-image-${index}.jpg"`,
  'Content-Length': buffer.byteLength,
});

// Kirim binary
res.send(Buffer.from(buffer));
```

**Atau dengan pipe:**

```js
const response = await fetch(imageUrl);

res.set({
  'Content-Type': response.headers.get('content-type') || 'image/jpeg',
  'Content-Disposition': `attachment; filename="void-image-${index}.jpg"`,
});

response.body.pipe(res);
```

**Yang TIDAK boleh dilakukan:**

```js
// SALAH: jangan kirim JSON saat download gambar
res.json({ url: imageUrl });

// SALAH: jangan lupa set Content-Disposition
res.set('Content-Type', 'image/jpeg');
res.send(buffer); // tanpa Content-Disposition, browser tidak akan download
```

### Cara Verifikasi

Setelah fix, coba download salah satu gambar slideshow.
File yang ter-download harus:
- Punya nama seperti `void-image-1.jpg`
- Bisa dibuka sebagai gambar
- Ukurannya wajar untuk gambar (ratusan KB hingga beberapa MB)

---

## Masalah 2: Tombol JPG / SLIDESHOW IMAGE 1, 2, 3... harus dihapus dari result card

### Gejala

Di bawah slideshow viewer dan audio preview, ada daftar tombol download per-gambar:
- JPG / SLIDESHOW IMAGE 1 [DOWNLOAD]
- JPG / SLIDESHOW IMAGE 2 [DOWNLOAD]
- JPG / SLIDESHOW IMAGE 3 [DOWNLOAD]
- dst.

Ini membuat halaman sangat panjang dan redundant karena sudah ada tombol
**DOWNLOAD SLIDE INI** di dalam slideshow viewer yang berfungsi untuk download
gambar yang sedang ditampilkan.

### Yang Harus Dilakukan

**Di frontend, cari di file berikut:**

- `frontend/src/components/ResultCard.jsx`
- `frontend/src/components/SlideshowPreview.jsx`
- atau file komponen apapun yang me-render list download per-image

**Hapus bagian yang me-render tombol download per-image dari list.**

Biasanya terlihat seperti ini (pola yang harus dihapus):

```jsx
{/* Hapus seluruh blok ini */}
{result.images && result.images.map((img, index) => (
  <div key={index} className="download-item">
    <span>JPG / SLIDESHOW IMAGE {index + 1}</span>
    <DownloadButton url={img.url} filename={`void-image-${index + 1}.jpg`} />
  </div>
))}
```

Atau pola serupa dengan nama variabel yang berbeda.

**Yang HARUS tetap ada dan jangan dihapus:**
- Tombol DOWNLOAD SLIDE INI di dalam SlideshowPreview (ini yang dipakai user)
- Tombol download untuk MP4 / VIDEO
- Tombol download untuk MP3 / AUDIO ONLY
- AudioPreview component
- SlideshowPreview component beserta navigasi antar slide

**Yang HARUS dihapus:**
- Hanya daftar tombol JPG per-image di bawah slideshow
- Jangan hapus fungsionalitas download gambar dari tombol DOWNLOAD SLIDE INI

### Hasil yang Diharapkan

Setelah fix, result card untuk slideshow hanya menampilkan:
1. Badge platform
2. Judul konten
3. SlideshowPreview dengan tombol DOWNLOAD SLIDE INI
4. AudioPreview (jika ada audio)
5. Tombol MP3 / AUDIO ONLY (jika ada)

Tidak ada lagi daftar panjang tombol per-image di bawahnya.

---

## Acceptance Criteria

- [ ] Download gambar slideshow menghasilkan file `.jpg` yang bisa dibuka
- [ ] Ukuran file gambar yang ter-download wajar (bukan 2-13 KB)
- [ ] Tidak ada lagi daftar tombol JPG / SLIDESHOW IMAGE 1, 2, 3 di result card
- [ ] Tombol DOWNLOAD SLIDE INI di slideshow viewer tetap berfungsi
- [ ] Download video (MP4) tetap berfungsi seperti sebelumnya
- [ ] Download audio (MP3) tetap berfungsi seperti sebelumnya
- [ ] `npm run build` berhasil tanpa error
- [ ] Tidak ada perubahan pada bagian lain yang tidak disebutkan di sini

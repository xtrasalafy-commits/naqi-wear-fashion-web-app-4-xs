# OPEN SOURCE — NAQI WEAR

> Proyek ini **100% Open Source** dan bebas diubah, di-copy, dan di-*fork*.

## Lisensi
**MIT License** — lihat file `LICENSE` untuk teks lengkap.

Hak Cipta (c) 2026 **MZF - 2026**.

## Komponen Pihak Ketiga
Proyek ini menggunakan library/komponen berikut (masing-masing memiliki lisensinya sendiri):

| Komponen | Lisensi | Catatan |
|---|---|---|
| Next.js (App Router) | MIT | Framework |
| React & ReactDOM | MIT | Library UI |
| TypeScript | Apache-2.0 | Bahasa pemrograman |
| Tailwind CSS v4 | MIT | Framework CSS |
| Drizzle ORM | MIT | ORM database |
| `pg` (node-postgres) | MIT | Driver PostgreSQL |
| Zustand | MIT | State management |
| Framer Motion | MIT | Animasi |
| Lucide React | MIT | Ikon |
| `qrcode` | MIT | Generate QR Code |
| Gambar contoh | Pexels | Sumber gambar uji coba |

## Kredit
- Nama merek **"NAQI WEAR"** adalah nama unik yang diciptakan khusus untuk proyek ini
  dan tidak terikat dengan perusahaan, merek, atau bisnis mana pun.
- Palet warna Islami: Hijau Zamrud `#1B4332`, Emas `#D4AF37`, Krem `#FDF6E3`,
  Coklat Tanah `#6D4C3D`.

## Cara Mengunduh Source Code
1. Buka halaman beranda proyek di GitHub: `https://github.com/MZF-2026/naqi-wear-fashion-web-app`
2. Klik tombol **"Code"** → pilih **"Download ZIP"**.
3. Atau jalankan perintah berikut di terminal Anda:
   ```bash
   git clone https://github.com/MZF-2026/naqi-wear-fashion-web-app.git
   ```

## Cara Berkontribusi
1. Fork proyek ini.
2. Buat branch baru untuk fitur/fix Anda.
3. Buat commit dengan pesan yang jelas.
4. Buka *Pull Request* ke branch `main`.

## Kebijakan Kode
- Gunakan **TypeScript** untuk semua file baru.
- Ikuti gaya tulis yang sudah ada (2 spasi, koma terakhir, `use client` di komponen klien).
- Tambahkan komentar hanya jika benar-benar diperlukan.
- Pastikan `npm run typecheck` dan `npm run build` lolos sebelum mengirim PR.

## Catatan
- Proyek ini dirancang untuk **deploy di Vercel**.
- Gunakan PostgreSQL (misalnya Neon) sebagai database.
- Semua halaman, API, dan pesan error menggunakan **Bahasa Indonesia**.
# NAQI WEAR — Toko Online Fashion Muslim Keluarga

> **Tampil Syar'i, Nyaman, dan Elegan Setiap Hari.**
> NAQI WEAR adalah nama unik yang diciptakan khusus untuk proyek ini — tidak terikat perusahaan, merek, atau bisnis mana pun.

Web app toko fashion muslim lengkap untuk **wanita, pria, anak, dan keluarga**: hijab, gamis, mukena, baju koko, sarimbit, hingga paket promo. Dirancang sangat mudah dipahami, 100% berbahasa Indonesia yang santun, dengan warna Islami elegan (Hijau Zamrud `#1B4332`, Emas `#D4AF37`, Krem `#FDF6E3`, Coklat Tanah `#6D4C3D`).

## Menjalankan Proyek Ini

```bash
npm install
npm run dev
```

Aplikasi berjalan dengan database PostgreSQL lokal (sudah berisi data contoh lengkap: 37 produk, kategori, voucher, banner, artikel, ulasan).

**Akun demo:**
| Peran | Email | Kata Sandi |
|---|---|---|
| Pelanggan | demo@naqiwear.id | demo123 |
| Admin | admin@naqiwear.id | admin123 |

## Fitur Customer
1. **Halaman Utama** — hero banner + slider, menu kategori besar, kategori populer, produk terlaris, banner promo tengah, produk terbaru, keunggulan toko, testimoni, artikel Islami, footer lengkap.
2. **Katalog** — breadcrumb, filter harga (slider), ukuran, warna, promo, sortir (Terbaru/Terlaris/Murah/Mahal/Rating), skeleton loading, kartu produk dengan zoom hover.
3. **Detail Produk** — galeri + thumbnail zoom, badge syar'i (Tidak Menerawang, Wudhu Friendly, dll), pilih warna & ukuran dengan indikator stok, size chart (modal), estimasi ongkir per kode pos, tab Deskripsi & Ulasan (filter dengan foto), produk terkait.
4. **Keranjang** — ubah qty, hapus, rekomendasi pelengkap, kode voucher, ringkasan besar.
5. **Checkout 3 Langkah** — Alamat → Pengiriman & Pembayaran (JNE/SiCepat/GoSend; QRIS/VA/Transfer/E-Wallet/Kartu/COD) → Review & Buat Pesanan → halaman sukses dengan instruksi bayar + tombol WhatsApp admin.
6. **Akun & Pesanan** — profil, alamat, ubah sandi, riwayat pesanan berwarna sesuai status, timeline visual (Dibuat → Dibayar → Diproses → Dikirim → Selesai), ajukan retur dengan foto.
7. **Wishlist** — simpan, hapus, pindahkan ke keranjang.
8. **Ulasan** — bintang 1–5, judul, komentar, lencana "Pembelian Terverifikasi".
9. **Chat CS** — tombol WhatsApp melayang di semua halaman.
10. **Promo** — semua voucher aktif dengan tombol "Salin Kode".
11. **Artikel Islami** — panduan hijab, tips ukuran gamis, inspirasi sarimbit, dll.

## Fitur Admin (`/admin`)
- **Dashboard**: penjualan hari ini, pesanan baru, pelanggan baru, produk terjual, grafik garis 7 hari, 5 pesanan terbaru.
- **Produk**: tabel + form lengkap (kategori, harga/diskon, varian warna-ukuran-stok-SKU, foto).
- **Pesanan**: filter status, verifikasi bayar, ubah status (Proses → Kemas → Kirim + resi → Selesai), batalkan & kembalikan stok.
- **Pelanggan**: total belanja per pelanggan.
- **Voucher, Banner, Artikel, Konten** (Tentang/S&K/Retur/FAQ): kelola penuh.
- **Laporan**: ekspor CSV penjualan per periode + produk terlaris.

## Struktur Database

Tabel pada PostgreSQL mencerminkan satu-ke-satu rancangan Google Sheets **"NAQI_WEARDATA"**:

`Users`, `Categories`, `Products`, `ProductVariants`, `ProductImages`, `Orders`, `OrderItems`, `Payments`, `Reviews`, `Wishlists`, `Coupons`, `Banners`, `Notifications` — ditambah `Articles`, `Returns`, dan `ContentPages`.

## Varian Deploy Google (Sheets + Drive + Apps Script)

Sesuai konsep awal proyek, tersedia kode backend alternatif berbasis Google:

1. Buat Spreadsheet Google bernama **`NAQI_WEARDATA`** dengan tab sesuai daftar tabel di atas (baris pertama = nama kolom, misalnya pada tab `Products`: `id, category_id, nama, slug, deskripsi, bahan, gender, harga_dasar, harga_diskon, berat_gram, status, unggulan, terlaris, created_at`).
2. Buat folder Google Drive **`NAQI_WEAR_ASSETS`** (semua gambar produk/banner) dan **`NAQI_WEAR_DB`** (cadangan JSON otomatis).
3. Salin isi **`apps-script/Code.gs`** ke Extensions → Apps Script pada spreadsheet, lalu **Deploy → Web App** (Execute as: Me, Access: Anyone).
4. Masukkan URL Web App ke konfigurasi frontend (`.env` → `VITE_API_URL=<URL>` untuk varian React Vite).
5. Semua gambar dirender lewat komponen `ImageLoader` yang mendukung format URL langsung Drive:
   `https://drive.google.com/uc?export=view&id=FILE_ID`

## Struktur Proyek (frontend)

```
src/
├── components/   Header, Footer, BottomNav, ProductCard, ImageLoader,
│                 Skeletons, Toast(er), Modal, QtyInput, Stars, Reveal, FloatingWA
├── app/(shop)/   Home, katalog, produk/[slug], keranjang, checkout(+sukses),
│                 pesanan(+detail), akun, wishlist, promo, artikel, masuk, daftar
├── app/admin/    Dashboard, produk, pesanan, pelanggan, voucher, banner,
│                 artikel, konten, laporan
├── app/api/      REST API (katalog, produk, auth, wishlist, pesanan, voucher,
│                 ongkir, ulasan, admin/*)
├── store/        Zustand: cart (persist), auth, toast
└── db/           Skema Drizzle + seed data
apps-script/Code.gs   Backend alternatif Google Apps Script
```

## Teknologi
Next.js (App Router) • React • TypeScript • Tailwind CSS v4 • Drizzle ORM + PostgreSQL • Zustand • Framer Motion • Lucide Icons

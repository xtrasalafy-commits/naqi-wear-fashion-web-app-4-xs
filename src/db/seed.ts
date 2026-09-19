import "dotenv/config";
import { db } from "./index";
import {
  users, categories, products, productVariants, productImages,
  reviews, coupons, banners, articles, notifications, contentPages,
} from "./schema";
import { scryptSync, randomBytes } from "crypto";

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;

function hashPassword(pw: string) {
  const salt = randomBytes(8).toString("hex");
  return salt + ":" + scryptSync(pw, salt, 32).toString("hex");
}

const UKURAN_BAJU = ["S", "M", "L", "XL", "XXL"];

type ProdSeed = {
  cat: string; nama: string; slug: string; harga: number; diskon: number;
  gender: string; bahan: string; motif: string; badge: string;
  imgs: number[]; warna: string[]; ukuran?: string[];
  unggulan?: boolean; terlaris?: boolean; berat?: number;
  deskripsi?: string;
};

const P: ProdSeed[] = [
  // ===== WANITA =====
  { cat: "gamis", nama: "Gamis Aisyah Premium", slug: "gamis-aisyah-premium", harga: 259000, diskon: 199000, gender: "wanita", bahan: "Wolfis Premium", motif: "Polos", badge: "Tidak Menerawang|Panjang Syar'i", imgs: [38804555, 38795837], warna: ["Hijau Zamrud", "Krem", "Hitam"], unggulan: true, terlaris: true, berat: 450, deskripsi: "Gamis potongan A-line yang anggun dengan bahan wolfis premium yang jatuh, tebal, dan tidak menerawang. Dilengkapi saku dalam dan resleting depan (busui friendly). Cocok untuk harian maupun acara resmi." },
  { cat: "gamis", nama: "Gamis Khadijah Soft", slug: "gamis-khadijah-soft", harga: 289000, diskon: 239000, gender: "wanita", bahan: "Ceruty Babydoll", motif: "Polos", badge: "Tidak Menerawang|Busui Friendly", imgs: [32347431, 8911579], warna: ["Dusty Pink", "Mocca"], unggulan: true, berat: 420 },
  { cat: "tunik", nama: "Tunik Zahra Flow", slug: "tunik-zahra-flow", harga: 179000, diskon: 145000, gender: "wanita", bahan: "Rayon Twill", motif: "Polos", badge: "Tidak Menerawang", imgs: [18435659, 38560280], warna: ["Broken White", "Maroon"], berat: 320 },
  { cat: "abaya", nama: "Abaya Madinah Classic", slug: "abaya-madinah-classic", harga: 329000, diskon: 279000, gender: "wanita", bahan: "Jetblack Premium", motif: "Polos", badge: "Tidak Menerawang|Panjang Syar'i", imgs: [37558000, 32279501], warna: ["Hitam Jetblack"], unggulan: true, berat: 480 },
  { cat: "abaya", nama: "Abaya Ummu Kaltsum Bordir", slug: "abaya-ummu-kaltsum-bordir", harga: 399000, diskon: 339000, gender: "wanita", bahan: "Nidha Dubai", motif: "Bordir", badge: "Tidak Menerawang|Panjang Syar'i", imgs: [35324601, 37577301], warna: ["Hitam", "Navy"], berat: 500 },
  { cat: "hijab-segiempat", nama: "Hijab Segiempat Voal Signature", slug: "hijab-segiempat-voal-signature", harga: 79000, diskon: 59000, gender: "wanita", bahan: "Voal Ultrafine", motif: "Polos", badge: "Tidak Menerawang|Wudhu Friendly", imgs: [36193665, 36147549], warna: ["Hijau Zamrud", "Krem", "Dusty Pink", "Mocca", "Hitam", "Navy"], ukuran: ["All Size"], unggulan: true, terlaris: true, berat: 120 },
  { cat: "hijab-segiempat", nama: "Hijab Segiempat Motif Turki", slug: "hijab-segiempat-motif-turki", harga: 89000, diskon: 69000, gender: "wanita", bahan: "Voal Premium", motif: "Motif Turki", badge: "Tidak Menerawang", imgs: [4566670, 14856271], warna: ["Biru Turquoise", "Merah Bata"], ukuran: ["All Size"], berat: 130 },
  { cat: "pashmina", nama: "Pashmina Ceruty Babydoll", slug: "pashmina-ceruty-babydoll", harga: 65000, diskon: 49000, gender: "wanita", bahan: "Ceruty Babydoll", motif: "Polos", badge: "Tidak Menerawang", imgs: [34100445, 36147549], warna: ["Salem", "Krem", "Hijau Sage"], ukuran: ["All Size"], terlaris: true, berat: 110 },
  { cat: "pashmina", nama: "Pashmina Jersey Premium", slug: "pashmina-jersey-premium", harga: 72000, diskon: 55000, gender: "wanita", bahan: "Jersey Zeply", motif: "Polos", badge: "Tidak Menerawang", imgs: [37842436, 14933840], warna: ["Hitam", "Abu Misty", "Coklat Susu"], ukuran: ["All Size"], berat: 150 },
  { cat: "bergo", nama: "Bergo Syar'i Maryam Jumbo", slug: "bergo-syari-maryam-jumbo", harga: 119000, diskon: 95000, gender: "wanita", bahan: "Jersey Premium", motif: "Polos", badge: "Panjang Syar'i|Tidak Menerawang", imgs: [19250798, 19298246], warna: ["Hitam", "Hijau Zamrud", "Mocca"], ukuran: ["All Size", "Jumbo"], berat: 260 },
  { cat: "khimar", nama: "Khimar Ummu Fahma 2 Layer", slug: "khimar-ummu-fahma-2-layer", harga: 139000, diskon: 115000, gender: "wanita", bahan: "Ceruty Double Layer", motif: "Polos", badge: "Panjang Syar'i|Tidak Menerawang", imgs: [19298246, 19250798], warna: ["Hitam", "Dusty Pink"], ukuran: ["All Size", "Jumbo"], berat: 280 },
  { cat: "mukena-dewasa", nama: "Mukena Rayon Premium Aisyah", slug: "mukena-rayon-premium-aisyah", harga: 249000, diskon: 189000, gender: "wanita", bahan: "Rayon Premium", motif: "Polos", badge: "Tidak Menerawang", imgs: [34464775, 7956909], warna: ["Putih", "Krem", "Hijau Sage"], ukuran: ["All Size", "Jumbo"], unggulan: true, terlaris: true, berat: 600 },
  { cat: "mukena-dewasa", nama: "Mukena Sutra Sakinah + Tas", slug: "mukena-sutra-sakinah-tas", harga: 329000, diskon: 269000, gender: "wanita", bahan: "Sutra Organik", motif: "Renda", badge: "Tidak Menerawang", imgs: [7249394, 8489077], warna: ["Putih Gading", "Pink Muda"], ukuran: ["All Size"], unggulan: true, berat: 550 },
  { cat: "one-set", nama: "One Set Nayla Atasan Celana", slug: "one-set-nayla", harga: 299000, diskon: 249000, gender: "wanita", bahan: "Mosscrepe", motif: "Polos", badge: "Tidak Menerawang|Wudhu Friendly", imgs: [12055312, 38560280], warna: ["Mocca", "Hitam"], ukuran: ["M", "L", "XL"], berat: 520 },
  { cat: "cadar-niqab", nama: "Cadar Niqab 2 Layer Breathable", slug: "cadar-niqab-2-layer", harga: 59000, diskon: 45000, gender: "wanita", bahan: "Ceruty Double Layer", motif: "Polos", badge: "Panjang Syar'i", imgs: [19250798, 19298246], warna: ["Hitam"], ukuran: ["All Size"], berat: 80 },
  { cat: "ciput-inner", nama: "Ciput Rajut Anti Tembem", slug: "ciput-rajut-anti-tembem", harga: 35000, diskon: 25000, gender: "wanita", bahan: "Rajut Spandex", motif: "Polos", badge: "Wudhu Friendly", imgs: [8911579, 18435659], warna: ["Hitam", "Krem", "Coklat Susu"], ukuran: ["All Size"], berat: 60 },
  { cat: "kaos-kaki-wudhu", nama: "Kaos Kaki Wudhu 3 Pasang", slug: "kaos-kaki-wudhu-3-pasang", harga: 45000, diskon: 35000, gender: "wanita", bahan: "Katun Spandex", motif: "Polos", badge: "Wudhu Friendly", imgs: [10133275, 34100445], warna: ["Hitam", "Putih"], ukuran: ["All Size"], berat: 120 },
  // ===== PRIA =====
  { cat: "baju-koko", nama: "Baju Koko Armstrong", slug: "baju-koko-armstrong", harga: 189000, diskon: 149000, gender: "pria", bahan: "Katun Toyobo", motif: "Polos", badge: "Tidak Menerawang", imgs: [7129571, 7129615], warna: ["Putih", "Hijau Zamrud", "Hitam"], unggulan: true, terlaris: true, berat: 300 },
  { cat: "baju-koko", nama: "Baju Koko Pakistan Premium", slug: "baju-koko-pakistan-premium", harga: 219000, diskon: 179000, gender: "pria", bahan: "Katun Madinah", motif: "Bordir", badge: "Tidak Menerawang", imgs: [7129615, 9127600], warna: ["Putih", "Krem"], berat: 320 },
  { cat: "gamis-pria", nama: "Gamis Pria Bilal", slug: "gamis-pria-bilal", harga: 259000, diskon: 215000, gender: "pria", bahan: "Katun Twill", motif: "Polos", badge: "Tidak Menerawang", imgs: [9127600, 8489310], warna: ["Putih", "Abu Misty"], unggulan: true, berat: 420 },
  { cat: "setelan-muslim-pria", nama: "Setelan Muslim Koko + Sarung", slug: "setelan-muslim-koko-sarung", harga: 349000, diskon: 295000, gender: "pria", bahan: "Katun Toyobo", motif: "Polos", badge: "Tidak Menerawang", imgs: [7129552, 7129571], warna: ["Hijau Zamrud", "Hitam"], berat: 650 },
  { cat: "sarung", nama: "Sarung Tenun Bawean", slug: "sarung-tenun-bawean", harga: 159000, diskon: 129000, gender: "pria", bahan: "Tenun ATBM", motif: "Kotak", badge: "Tidak Menerawang", imgs: [7129752, 7129731], warna: ["Hijau Zamrud", "Merah Bata"], berat: 450 },
  { cat: "peci-kopiah", nama: "Peci Hitam Nasional Premium", slug: "peci-hitam-nasional-premium", harga: 55000, diskon: 42000, gender: "pria", bahan: "Beludru Premium", motif: "Polos", badge: "Tidak Menerawang", imgs: [7129731, 7129752], warna: ["Hitam"], ukuran: ["M", "L", "XL"], berat: 150 },
  { cat: "sorban", nama: "Sorban Motif Madinah", slug: "sorban-motif-madinah", harga: 89000, diskon: 69000, gender: "pria", bahan: "Katun Halus", motif: "Motif Madinah", badge: "Tidak Menerawang", imgs: [7129754, 7129752], warna: ["Putih Hijau", "Merah Bata"], ukuran: ["All Size"], berat: 200 },
  // ===== ANAK =====
  { cat: "gamis-anak-perempuan", nama: "Gamis Anak Fatimah", slug: "gamis-anak-fatimah", harga: 159000, diskon: 125000, gender: "anak", bahan: "Katun Bambu", motif: "Polos", badge: "Tidak Menerawang", imgs: [35105940, 35105938], warna: ["Dusty Pink", "Hijau Sage"], ukuran: ["4-6 Tahun", "7-9 Tahun", "10-12 Tahun"], berat: 250 },
  { cat: "baju-koko-anak", nama: "Baju Koko Anak Abyan", slug: "baju-koko-anak-abyan", harga: 129000, diskon: 99000, gender: "anak", bahan: "Katun Combed", motif: "Polos", badge: "Tidak Menerawang", imgs: [12530590, 36266214], warna: ["Putih", "Hijau Zamrud"], ukuran: ["4-6 Tahun", "7-9 Tahun", "10-12 Tahun"], terlaris: true, berat: 220 },
  { cat: "hijab-anak", nama: "Hijab Anak Instan Ceria", slug: "hijab-anak-instan-ceria", harga: 49000, diskon: 39000, gender: "anak", bahan: "Jersey Adem", motif: "Polos", badge: "Tidak Menerawang", imgs: [35105938, 35105940], warna: ["Dusty Pink", "Krem"], ukuran: ["4-6 Tahun", "7-12 Tahun"], berat: 90 },
  { cat: "mukena-anak", nama: "Mukena Anak Aleya", slug: "mukena-anak-aleya", harga: 139000, diskon: 109000, gender: "anak", bahan: "Rayon Halus", motif: "Polos", badge: "Tidak Menerawang", imgs: [36266214, 35105938], warna: ["Putih", "Pink Muda"], ukuran: ["4-6 Tahun", "7-12 Tahun"], berat: 350 },
  // ===== COUPLE & KELUARGA =====
  { cat: "sarimbit-pasangan", nama: "Sarimbit Pasangan Harmoni", slug: "sarimbit-pasangan-harmoni", harga: 459000, diskon: 389000, gender: "keluarga", bahan: "Katun Premium", motif: "Sarimbit", badge: "Tidak Menerawang", imgs: [35105927, 35646451], warna: ["Hijau Zamrud", "Mocca"], ukuran: ["Paket 2 Orang"], unggulan: true, berat: 800 },
  { cat: "sarimbit-keluarga", nama: "Sarimbit Keluarga Barakah", slug: "sarimbit-keluarga-barakah", harga: 699000, diskon: 579000, gender: "keluarga", bahan: "Katun Premium", motif: "Sarimbit", badge: "Tidak Menerawang", imgs: [35105924, 35105927], warna: ["Hijau Zamrud", "Krem"], ukuran: ["Paket 4 Orang"], unggulan: true, terlaris: true, berat: 1400 },
  { cat: "paket-ibu-anak", nama: "Paket Ibu Anak Serasi", slug: "paket-ibu-anak-serasi", harga: 399000, diskon: 339000, gender: "keluarga", bahan: "Katun Premium", motif: "Sarimbit", badge: "Tidak Menerawang", imgs: [35646451, 35105924], warna: ["Dusty Pink", "Krem"], ukuran: ["Paket 2 Orang"], berat: 700 },
  { cat: "paket-ayah-anak", nama: "Paket Ayah Anak Sholeh", slug: "paket-ayah-anak-sholeh", harga: 379000, diskon: 319000, gender: "keluarga", bahan: "Katun Toyobo", motif: "Sarimbit", badge: "Tidak Menerawang", imgs: [35105909, 12530590], warna: ["Putih", "Hijau Zamrud"], ukuran: ["Paket 2 Orang"], berat: 650 },
  // ===== PAKET PROMO =====
  { cat: "paket-hijab-3-warna", nama: "Paket Hijab 3 Warna", slug: "paket-hijab-3-warna", harga: 199000, diskon: 149000, gender: "wanita", bahan: "Voal Ultrafine", motif: "Polos", badge: "Tidak Menerawang", imgs: [36147549, 36193665], warna: ["Set Zamrud Krem Mocca", "Set Salem Pink Putih"], ukuran: ["Paket 3 Pcs"], unggulan: true, berat: 350 },
  { cat: "paket-mukena-tas", nama: "Paket Mukena + Tas Eksklusif", slug: "paket-mukena-tas-eksklusif", harga: 329000, diskon: 279000, gender: "wanita", bahan: "Rayon Premium", motif: "Renda", badge: "Tidak Menerawang", imgs: [8489077, 34464775], warna: ["Putih Gading", "Hijau Sage"], ukuran: ["Paket Mukena + Tas"], berat: 700 },
  { cat: "paket-koko-sarung-peci", nama: "Paket Koko + Sarung + Peci", slug: "paket-koko-sarung-peci", harga: 399000, diskon: 329000, gender: "pria", bahan: "Katun Toyobo", motif: "Polos", badge: "Tidak Menerawang", imgs: [8489310, 7129552], warna: ["Hijau Zamrud", "Hitam"], ukuran: ["Paket 3 Item"], berat: 900 },
  { cat: "paket-ramadan", nama: "Paket Ramadan Berkah", slug: "paket-ramadan-berkah", harga: 499000, diskon: 399000, gender: "keluarga", bahan: "Campuran Premium", motif: "Sarimbit", badge: "Tidak Menerawang", imgs: [36211998, 7249394], warna: ["Paket Ibadah Lengkap"], ukuran: ["Paket Spesial"], terlaris: true, berat: 1200 },
  { cat: "paket-hadiah-islami", nama: "Paket Hadiah Islami", slug: "paket-hadiah-islami", harga: 459000, diskon: 379000, gender: "keluarga", bahan: "Campuran Premium", motif: "Polos", badge: "Tidak Menerawang", imgs: [7249446, 35324601], warna: ["Paket Kado Premium"], ukuran: ["Paket Kado"], berat: 1000 },
];

async function main() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    console.log("Database sudah berisi data, seed dilewati.");
    return;
  }

  // ===== USERS =====
  const admin = (await db.insert(users).values({
    nama: "Admin NAQI", email: "admin@naqiwear.id", password_hash: hashPassword("admin123"),
    role: "admin", nomor_wa: "081234567890",
  }).returning())[0];
  const demo = (await db.insert(users).values({
    nama: "Siti Aminah", email: "demo@naqiwear.id", password_hash: hashPassword("demo123"),
    role: "customer", nomor_wa: "081298765432", gender: "wanita",
    alamat_json: { penerima: "Siti Aminah", wa: "081298765432", alamat: "Jl. Melati No. 12 RT 03 RW 05", provinsi: "DKI Jakarta", kota: "Jakarta Selatan", kecamatan: "Tebet", kodepos: "12810" },
  }).returning())[0];
  const extraUsers = await db.insert(users).values([
    { nama: "Ahmad Fauzi", email: "ahmad@example.com", password_hash: hashPassword("rahasia123"), nomor_wa: "081111111111", gender: "pria" },
    { nama: "Nurul Hidayah", email: "nurul@example.com", password_hash: hashPassword("rahasia123"), nomor_wa: "082222222222", gender: "wanita" },
    { nama: "Rizky Pratama", email: "rizky@example.com", password_hash: hashPassword("rahasia123"), nomor_wa: "083333333333", gender: "pria" },
    { nama: "Fatimah Zahra", email: "fatimah@example.com", password_hash: hashPassword("rahasia123"), nomor_wa: "084444444444", gender: "wanita" },
  ]).returning();
  void admin;

  // ===== CATEGORIES =====
  const catDefs: Array<{ nama: string; slug: string; gambar: number; anak?: Array<[string, string]> }> = [
    { nama: "Wanita", slug: "wanita", gambar: 38804555, anak: [["Hijab Segiempat", "hijab-segiempat"], ["Pashmina", "pashmina"], ["Bergo", "bergo"], ["Khimar", "khimar"], ["Gamis", "gamis"], ["Tunik", "tunik"], ["One Set Atas Bawah", "one-set"], ["Mukena Dewasa", "mukena-dewasa"], ["Abaya", "abaya"], ["Cadar Niqab", "cadar-niqab"], ["Ciput Inner", "ciput-inner"], ["Kaos Kaki Wudhu", "kaos-kaki-wudhu"]] },
    { nama: "Pria", slug: "pria", gambar: 7129571, anak: [["Baju Koko", "baju-koko"], ["Gamis Pria", "gamis-pria"], ["Setelan Muslim Pria", "setelan-muslim-pria"], ["Sarung", "sarung"], ["Sorban", "sorban"], ["Peci Kopiah", "peci-kopiah"]] },
    { nama: "Anak", slug: "anak", gambar: 35105938, anak: [["Gamis Anak Perempuan", "gamis-anak-perempuan"], ["Baju Koko Anak", "baju-koko-anak"], ["Hijab Anak", "hijab-anak"], ["Mukena Anak", "mukena-anak"]] },
    { nama: "Couple & Keluarga", slug: "keluarga", gambar: 35105924, anak: [["Sarimbit Pasangan", "sarimbit-pasangan"], ["Sarimbit Keluarga", "sarimbit-keluarga"], ["Paket Ibu Anak", "paket-ibu-anak"], ["Paket Ayah Anak", "paket-ayah-anak"]] },
    { nama: "Paket Promo", slug: "paket-promo", gambar: 36147549, anak: [["Paket Hijab 3 Warna", "paket-hijab-3-warna"], ["Paket Mukena + Tas", "paket-mukena-tas"], ["Paket Koko Sarung Peci", "paket-koko-sarung-peci"], ["Paket Ramadan", "paket-ramadan"], ["Paket Hadiah Islami", "paket-hadiah-islami"]] },
  ];
  const catIdBySlug = new Map<string, number>();
  let urutan = 1;
  for (const c of catDefs) {
    const parent = (await db.insert(categories).values({ nama: c.nama, slug: c.slug, gambar_url: px(c.gambar), urutan: urutan++ }).returning())[0];
    catIdBySlug.set(c.slug, parent.id);
    for (const [nama, slug] of c.anak ?? []) {
      const child = (await db.insert(categories).values({ parent_id: parent.id, nama, slug, gambar_url: px(c.gambar), urutan: urutan++ }).returning())[0];
      catIdBySlug.set(slug, child.id);
    }
  }

  // ===== PRODUCTS + VARIANTS + IMAGES =====
  const slugToProduct = new Map<string, number>();
  let i = 0;
  for (const p of P) {
    i++;
    const categoryId = catIdBySlug.get(p.cat) ?? 1;
    const created = new Date(Date.now() - (P.length - i) * 2 * 24 * 3600 * 1000);
    const prod = (await db.insert(products).values({
      category_id: categoryId, nama: p.nama, slug: p.slug,
      deskripsi: p.deskripsi ?? `${p.nama} dari NAQI WEAR dibuat dari bahan ${p.bahan} berkualitas yang nyaman dipakai seharian. Jahitan rapi, warna tidak mudah pudar, dan melalui proses quality control yang ketat. Pilihan tepat untuk tampil syar'i dan elegan setiap hari.`,
      bahan: p.bahan, gender: p.gender, harga_dasar: p.harga, harga_diskon: p.diskon ?? null,
      berat_gram: p.berat ?? 300, unggulan: p.unggulan ?? false, terlaris: p.terlaris ?? false,
      motif: p.motif, badge_syari: p.badge, created_at: created,
    }).returning())[0];
    slugToProduct.set(p.slug, prod.id);

    const ukuranList = p.ukuran ?? UKURAN_BAJU;
    const hargaVarian = p.diskon ?? p.harga;
    let vIdx = 0;
    for (const warna of p.warna) {
      for (const ukuran of ukuranList) {
        vIdx++;
        const stok = ((i * 7 + vIdx * 13) % 9) === 0 ? 0 : 8 + ((i * 3 + vIdx * 5) % 30);
        await db.insert(productVariants).values({
          product_id: prod.id, sku: `NQW-${String(prod.id).padStart(4, "0")}-${String(vIdx).padStart(2, "0")}`,
          warna, ukuran, harga: hargaVarian, stok,
          gambar_url: px(p.imgs[0]), berat_gram: p.berat ?? 300,
        });
      }
    }
    let ur = 0;
    for (const img of p.imgs) {
      await db.insert(productImages).values({
        product_id: prod.id, gambar_url: px(img), alt_text: p.nama, urutan: ur, utama: ur === 0,
      });
      ur++;
    }
  }

  // ===== REVIEWS =====
  const revDefs: Array<[string, number, string, string, number]> = [
    ["Siti Aminah", slugToProduct.get("gamis-aisyah-premium")!, "Gamisnya cantik sekali", "Bahannya adem dan tidak menerawang, jahitan rapi. Suami juga bilang bagus. Pengiriman cepat, packing aman. InsyaAllah order lagi.", 5],
    ["Nurul Hidayah", slugToProduct.get("gamis-aisyah-premium")!, "Puas banget", "Warna hijau zamrudnya sesuai foto. Ukuran L pas di badan saya. Recommended!", 5],
    ["Ahmad Fauzi", slugToProduct.get("baju-koko-armstrong")!, "Koko terbaik", "Bahannya halus, dipakai shalat Jumat nyaman sekali. Ukuran sesuai size chart.", 5],
    ["Rizky Pratama", slugToProduct.get("baju-koko-armstrong")!, "Bagus untuk hadiah", "Beli untuk ayah, beliau suka sekali. Terima kasih NAQI WEAR.", 4],
    ["Fatimah Zahra", slugToProduct.get("mukena-rayon-premium-aisyah")!, "Mukenanya sejuk", "Rayonnya adem, tidak panas, dan tebal. Sangat nyaman untuk shalat tarawih.", 5],
    ["Siti Aminah", slugToProduct.get("hijab-segiempat-voal-signature")!, "Voal terbaik", "Mudah dibentuk, tidak licin, dan warna kremnya cantik. Beli 3 langsung.", 5],
    ["Nurul Hidayah", slugToProduct.get("sarimbit-keluarga-barakah")!, "Sarimbit idaman", "Dipakai sekeluarga saat Lebaran, serasi sekali. Bahannya adem untuk anak-anak.", 5],
    ["Ahmad Fauzi", slugToProduct.get("sarung-tenun-bawean")!, "Tenunnya halus", "Sarung tebal tapi tidak panas. Motifnya klasik dan elegan.", 4],
    ["Fatimah Zahra", slugToProduct.get("pashmina-ceruty-babydoll")!, "Warnanya lembut", "Ceruty-nya jatuh dan mudah diatur. Harga terjangkau untuk kualitas seperti ini.", 5],
    ["Rizky Pratama", slugToProduct.get("gamis-pria-bilal")!, "Gamis pria nyaman", "Potongannya rapi, panjangnya pas. Dipakai ke masjid sangat nyaman.", 5],
    ["Siti Aminah", slugToProduct.get("mukena-sutra-sakinah-tas")!, "Cantik dan mewah", "Sutraya lembut, tasnya juga eksklusif. Cocok untuk hadiah.", 5],
    ["Nurul Hidayah", slugToProduct.get("gamis-anak-fatimah")!, "Anak saya suka", "Bahannya adem, anak betah memakainya seharian. Ukurannya sesuai.", 4],
    ["Fatimah Zahra", slugToProduct.get("abaya-madinah-classic")!, "Jetblack pekat", "Warna hitamnya pekat dan tidak menerawang. Potongan sangat elegan.", 5],
    ["Ahmad Fauzi", slugToProduct.get("paket-koko-sarung-peci")!, "Paket lengkap hemat", "Satu paket langsung lengkap untuk shalat Id. Kualitas semua item bagus.", 5],
    ["Siti Aminah", slugToProduct.get("paket-hijab-3-warna")!, "Hemat dan cantik", "Tiga warna sekaligus dengan harga segini sangat worth it.", 5],
  ];
  const userByName = new Map([[demo.nama, demo.id], ...extraUsers.map((u) => [u.nama, u.id] as [string, number])]);
  for (let r = 0; r < revDefs.length; r++) {
    const [nama, prodId, judul, komentar, rating] = revDefs[r];
    await db.insert(reviews).values({
      user_id: userByName.get(nama) ?? demo.id, product_id: prodId, rating, judul, komentar,
      terverifikasi: true, gambar_url_json: r % 4 === 0 ? [px(34464775)] : [],
      created_at: new Date(Date.now() - (revDefs.length - r) * 3 * 24 * 3600 * 1000),
    });
  }

  // ===== COUPONS =====
  const today = new Date();
  const d = (offset: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };
  await db.insert(coupons).values([
    { kode: "NAQI15", tipe: "persen", nilai: 15, minimal_order: 99000, maksimal_diskon: 30000, kuota: 200, mulai: d(-5), berakhir: d(60), aktif: true },
    { kode: "LEBARAN25", tipe: "persen", nilai: 25, minimal_order: 199000, maksimal_diskon: 50000, kuota: 100, mulai: d(-5), berakhir: d(90), aktif: true },
    { kode: "KELUARGA50", tipe: "nominal", nilai: 50000, minimal_order: 499000, maksimal_diskon: 50000, kuota: 80, mulai: d(-5), berakhir: d(90), aktif: true },
    { kode: "HIJAB10", tipe: "nominal", nilai: 10000, minimal_order: 79000, maksimal_diskon: 10000, kuota: 300, mulai: d(-5), berakhir: d(45), aktif: true },
    { kode: "BARKAH20", tipe: "persen", nilai: 20, minimal_order: 149000, maksimal_diskon: 40000, kuota: 150, mulai: d(-5), berakhir: d(75), aktif: true },
  ]);

  // ===== BANNERS =====
  await db.insert(banners).values([
    { judul: "Koleksi Gamis Syar'i Terbaru", subjudul: "Bahan premium, tidak menerawang, potongan anggun untuk setiap kesempatan.", gambar_url: px(38804555), tautan: "/katalog?kategori=gamis", mulai: d(-10), berakhir: d(120), aktif: true, urutan: 1 },
    { judul: "Sarimbit Keluarga Barakah", subjudul: "Tampil serasi sekeluarga di hari istimewa. Hemat hingga 20%.", gambar_url: px(35105924), tautan: "/katalog?kategori=keluarga", mulai: d(-10), berakhir: d(120), aktif: true, urutan: 2 },
    { judul: "Paket Hijab 3 Warna Rp149rb", subjudul: "Tiga warna pilihan dalam satu paket hemat. Stok terbatas.", gambar_url: px(36147549), tautan: "/katalog?kategori=paket-promo", mulai: d(-10), berakhir: d(120), aktif: true, urutan: 3 },
    { judul: "Mukena Adem untuk Ramadhan", subjudul: "Rayon premium yang sejuk menemani ibadah Anda.", gambar_url: px(34464775), tautan: "/katalog?kategori=mukena-dewasa", mulai: d(-10), berakhir: d(120), aktif: true, urutan: 4 },
  ]);

  // ===== ARTICLES =====
  await db.insert(articles).values([
    { slug: "panduan-memilih-hijab", judul: "Panduan Memilih Hijab yang Nyaman untuk Aktivitas Harian", ringkasan: "Kenali bahan voal, ceruty, dan jersey agar hijab Anda nyaman dipakai seharian tanpa gerah.", gambar_url: px(36193665), kategori: "Panduan", konten: "Memilih hijab yang tepat dimulai dari memahami bahan. Voal ultrafine adalah pilihan terbaik untuk aktivitas harian karena ringan, mudah dibentuk, dan menyerap keringat. Ceruty babydoll memberikan kesan jatuh yang anggun, cocok untuk acara resmi. Sementara jersey premium cocok bagi Anda yang menyukai gaya praktis tanpa banyak jarum pentul.\n\nPerhatikan juga warna. Warna netral seperti krem, mocca, dan hijau zamrud mudah dipadukan dengan berbagai gamis dan tunik. Untuk wajah bulat, pilih ciput yang tidak terlalu ketat dan biarkan hijab sedikit longgar di bagian pipi.\n\nTerakhir, pastikan hijab tidak menerawang saat terkena cahaya. Semua hijab NAQI WEAR telah melewati uji ketebalan sehingga aman dan nyaman dipakai beribadah maupun beraktivitas." },
    { slug: "tips-memilih-ukuran-gamis", judul: "Tips Memilih Ukuran Gamis agar Pas dan Nyaman", ringkasan: "Panduan mengukur lingkar dada dan panjang gamis agar tidak salah pilih ukuran S sampai XXL.", gambar_url: px(38804555), kategori: "Panduan", konten: "Sebelum membeli gamis, siapkan meteran kain dan ukur tiga bagian penting: lingkar dada, panjang lengan, dan panjang gamis dari bahu hingga mata kaki.\n\nSebagai patokan umum ukuran NAQI WEAR: S untuk lingkar dada 88-92 cm, M 93-98 cm, L 99-104 cm, XL 105-112 cm, dan XXL 113-122 cm. Jika ragu di antara dua ukuran, pilihlah ukuran yang lebih besar agar tetap longgar dan sesuai syariat.\n\nUntuk panjang gamis syar'i, idealnya menutupi mata kaki. Tinggi badan 150-155 cm umumnya cocok dengan panjang gamis 130-132 cm, sedangkan tinggi 160-170 cm cocok dengan panjang 138-142 cm.\n\nJika masih ragu, tim CS kami siap membantu melalui WhatsApp setiap hari pukul 08.00-21.00." },
    { slug: "inspirasi-sarimbit-keluarga", judul: "Inspirasi Sarimbit Keluarga untuk Momen Istimewa", ringkasan: "Ide padu padan sarimbit pasangan dan keluarga agar tampil serasi di Lebaran dan acara resmi.", gambar_url: px(35105924), kategori: "Inspirasi", konten: "Sarimbit bukan sekadar baju seragam keluarga, melainkan simbol kekompakan dan kehangatan. Untuk Lebaran, warna hijau zamrud dan krem adalah kombinasi yang paling banyak dipilih karena kesan elegan dan sejuk.\n\nUntuk acara akikah atau walimah, warna dusty pink dan mocca memberikan nuansa lembut yang fotogenik. Padukan gamis ibu dengan koko ayah dalam satu warna, lalu pilih warna senada untuk gamis anak.\n\nTips dari tim NAQI WEAR: pilih bahan katun premium yang adem agar anak-anak tetap nyaman sepanjang acara. Koleksi Sarimbit Barakah kami tersedia dalam paket 2 hingga 4 orang dengan potongan yang sama-sama nyaman untuk dewasa dan anak." },
    { slug: "cara-merawat-mukena", judul: "Cara Merawat Mukena agar Awet dan Tetap Harum", ringkasan: "Langkah sederhana mencuci dan menyimpan mukena agar tidak bau dan warnanya tetap cerah.", gambar_url: px(7249394), kategori: "Tips", konten: "Mukena yang terawat membuat ibadah lebih khusyuk. Berikut tips dari NAQI WEAR:\n\nPertama, angin-anginkan mukena setelah digunakan sebelum dilipat. Kedua, cuci dengan deterjen lembut maksimal seminggu sekali, hindari pemutih untuk mukena berwarna. Ketiga, jemur di tempat teduh agar serat kain tidak cepat rusak.\n\nUntuk mukena rayon, setrika dengan suhu rendah dan simpan dengan cara digantung agar tidak kusut. Tambahkan pewangi pakaian secukupnya. Mukena rayon premium NAQI WEAR dirancang tahan hingga ratusan kali cuci jika dirawat dengan benar." },
  ]);

  // ===== CONTENT PAGES =====
  await db.insert(contentPages).values([
    { kunci: "tentang", judul: "Tentang NAQI WEAR", konten: "NAQI WEAR adalah toko online fashion muslim keluarga yang lahir dari keinginan sederhana: menghadirkan pakaian syar'i yang nyaman, berkualitas, dan mudah dibeli oleh siapa pun. Kami melayani kebutuhan wanita, pria, anak, hingga keluarga dengan koleksi hijab, gamis, mukena, koko, dan sarimbit pilihan. Setiap produk melewati quality control ketat agar sampai di tangan Anda dalam kondisi terbaik." },
    { kunci: "syarat-ketentuan", judul: "Syarat & Ketentuan", konten: "1. Dengan berbelanja di NAQI WEAR, pelanggan menyetujui seluruh syarat dan ketentuan yang berlaku.\n2. Harga yang tertera sudah final dan dapat berubah sewaktu-waktu tanpa pemberitahuan.\n3. Pesanan diproses maksimal 2 hari kerja setelah pembayaran terverifikasi.\n4. Keterlambatan pengiriman oleh pihak ekspedisi di luar tanggung jawab NAQI WEAR, namun kami bantu penelusuran resi.\n5. Pesanan yang sudah dibayar tidak dapat dibatalkan kecuali stok kosong." },
    { kunci: "kebijakan-retur", judul: "Kebijakan Retur", konten: "1. Retur dapat diajukan maksimal 3 hari setelah pesanan diterima.\n2. Syarat retur: produk belum dicuci, belum dipakai, label masih terpasang, dan disertai video unboxing.\n3. Retur karena kesalahan ukuran dilayani dengan penukaran ukuran selama stok tersedia.\n4. Produk cacat produksi akan diganti baru atau uang dikembalikan 100%.\n5. Ajukan retur melalui halaman Pesanan Saya atau hubungi CS WhatsApp kami." },
    { kunci: "faq", judul: "Pertanyaan Umum (FAQ)", konten: "Q: Bagaimana cara mengetahui ukuran saya?\nA: Lihat tabel ukuran di halaman detail produk atau hubungi CS kami melalui WhatsApp.\n\nQ: Berapa lama pengiriman?\nA: Jabodetabek 1-2 hari, Pulau Jawa 2-4 hari, luar Jawa 3-7 hari kerja.\n\nQ: Apakah bisa bayar di tempat (COD)?\nA: Bisa. Pilih metode COD saat checkout.\n\nQ: Bahan apakah tidak menerawang?\nA: Semua produk NAQI WEAR telah diuji ketebalannya dan diberi label Tidak Menerawang." },
  ]);

  // ===== NOTIFICATIONS =====
  await db.insert(notifications).values([
    { user_id: demo.id, tipe: "promo", judul: "Selamat datang di NAQI WEAR", pesan: "Gunakan kode NAQI15 untuk diskon 15% belanja pertama Anda.", dibaca: false },
    { user_id: demo.id, tipe: "info", judul: "Koleksi Ramadhan telah tiba", pesan: "Lihat paket mukena dan sarimbit terbaru untuk keluarga Anda.", dibaca: false },
  ]);

  console.log("Seed selesai: users, kategori, produk, varian, gambar, ulasan, kupon, banner, artikel, konten.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

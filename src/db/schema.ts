import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  nomor_wa: text("nomor_wa").notNull().default(""),
  alamat_json: jsonb("alamat_json").$type<Record<string, string>>(),
  gender: text("gender").notNull().default(""),
  tanggal_lahir: text("tanggal_lahir").notNull().default(""),
  role: text("role").notNull().default("customer"),
  avatar_url: text("avatar_url").notNull().default(""),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parent_id: integer("parent_id"),
  nama: text("nama").notNull(),
  slug: text("slug").notNull().unique(),
  gambar_url: text("gambar_url").notNull().default(""),
  urutan: integer("urutan").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id").notNull(),
  nama: text("nama").notNull(),
  slug: text("slug").notNull().unique(),
  deskripsi: text("deskripsi").notNull().default(""),
  bahan: text("bahan").notNull().default(""),
  gender: text("gender").notNull().default("wanita"),
  harga_dasar: integer("harga_dasar").notNull(),
  harga_diskon: integer("harga_diskon"),
  berat_gram: integer("berat_gram").notNull().default(300),
  status: text("status").notNull().default("aktif"),
  unggulan: boolean("unggulan").notNull().default(false),
  terlaris: boolean("terlaris").notNull().default(false),
  motif: text("motif").notNull().default("Polos"),
  badge_syari: text("badge_syari").notNull().default("Tidak Menerawang"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull(),
  sku: text("sku").notNull(),
  warna: text("warna").notNull(),
  ukuran: text("ukuran").notNull(),
  harga: integer("harga").notNull(),
  stok: integer("stok").notNull().default(0),
  gambar_url: text("gambar_url").notNull().default(""),
  berat_gram: integer("berat_gram").notNull().default(300),
  aktif: boolean("aktif").notNull().default(true),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id").notNull(),
  gambar_url: text("gambar_url").notNull(),
  alt_text: text("alt_text").notNull().default(""),
  urutan: integer("urutan").notNull().default(0),
  utama: boolean("utama").notNull().default(false),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  nomor_pesanan: text("nomor_pesanan").notNull().unique(),
  user_id: integer("user_id").notNull(),
  snapshot_alamat: jsonb("snapshot_alamat").$type<Record<string, string>>().notNull(),
  subtotal: integer("subtotal").notNull(),
  diskon: integer("diskon").notNull().default(0),
  ongkir: integer("ongkir").notNull().default(0),
  total: integer("total").notNull(),
  kurir: text("kurir").notNull().default(""),
  layanan: text("layanan").notNull().default(""),
  resi: text("resi").notNull().default(""),
  kupon_kode: text("kupon_kode").notNull().default(""),
  metode_bayar: text("metode_bayar").notNull().default(""),
  status_pembayaran: text("status_pembayaran").notNull().default("menunggu"),
  status_pesanan: text("status_pesanan").notNull().default("menunggu_pembayaran"),
  catatan: text("catatan").notNull().default(""),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  product_id: integer("product_id").notNull(),
  variant_id: integer("variant_id"),
  snapshot_nama: text("snapshot_nama").notNull(),
  snapshot_sku: text("snapshot_sku").notNull().default(""),
  snapshot_varian: text("snapshot_varian").notNull().default(""),
  qty: integer("qty").notNull(),
  harga: integer("harga").notNull(),
  subtotal: integer("subtotal").notNull(),
  gambar_url: text("gambar_url").notNull().default(""),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  metode: text("metode").notNull(),
  id_transaksi: text("id_transaksi").notNull().default(""),
  jumlah: integer("jumlah").notNull(),
  status: text("status").notNull().default("menunggu"),
  dibayar_pada: timestamp("dibayar_pada"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  product_id: integer("product_id").notNull(),
  order_id: integer("order_id"),
  rating: integer("rating").notNull().default(5),
  judul: text("judul").notNull().default(""),
  komentar: text("komentar").notNull().default(""),
  gambar_url_json: jsonb("gambar_url_json").$type<string[]>(),
  terverifikasi: boolean("terverifikasi").notNull().default(false),
  status: text("status").notNull().default("tayang"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    product_id: integer("product_id").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("wishlists_user_product_idx").on(t.user_id, t.product_id)]
);

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  kode: text("kode").notNull().unique(),
  tipe: text("tipe").notNull().default("persen"),
  nilai: integer("nilai").notNull().default(0),
  minimal_order: integer("minimal_order").notNull().default(0),
  maksimal_diskon: integer("maksimal_diskon").notNull().default(0),
  kuota: integer("kuota").notNull().default(100),
  terpakai: integer("terpakai").notNull().default(0),
  mulai: date("mulai").notNull(),
  berakhir: date("berakhir").notNull(),
  aktif: boolean("aktif").notNull().default(true),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  judul: text("judul").notNull(),
  gambar_url: text("gambar_url").notNull(),
  tautan: text("tautan").notNull().default("/katalog"),
  subjudul: text("subjudul").notNull().default(""),
  mulai: date("mulai").notNull(),
  berakhir: date("berakhir").notNull(),
  aktif: boolean("aktif").notNull().default(true),
  urutan: integer("urutan").notNull().default(0),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  tipe: text("tipe").notNull().default("info"),
  judul: text("judul").notNull().default(""),
  pesan: text("pesan").notNull().default(""),
  dibaca: boolean("dibaca").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  judul: text("judul").notNull(),
  ringkasan: text("ringkasan").notNull().default(""),
  konten: text("konten").notNull().default(""),
  gambar_url: text("gambar_url").notNull().default(""),
  penulis: text("penulis").notNull().default("Tim NAQI WEAR"),
  kategori: text("kategori").notNull().default("Panduan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  user_id: integer("user_id").notNull(),
  alasan: text("alasan").notNull(),
  foto_url_json: jsonb("foto_url_json").$type<string[]>(),
  status: text("status").notNull().default("diajukan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  kunci: text("kunci").notNull().unique(),
  judul: text("judul").notNull(),
  konten: text("konten").notNull().default(""),
});

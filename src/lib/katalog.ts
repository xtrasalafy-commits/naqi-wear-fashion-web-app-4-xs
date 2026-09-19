import { db } from "@/db";
import { products, productVariants, productImages, reviews, categories } from "@/db/schema";
import { eq, and, sql, desc, asc, inArray, ilike, or, isNotNull, exists } from "drizzle-orm";

export type OpsiKatalog = {
  kategoriSlug?: string;
  kategoriId?: number;
  cari?: string;
  urut?: string;
  hargaMin?: number;
  hargaMax?: number;
  ukuran?: string[];
  warna?: string[];
  promo?: boolean;
  gender?: string;
  limit?: number;
  offset?: number;
};

const GRUP_VIRTUAL: Record<string, string[]> = {
  hijab: ["hijab-segiempat", "pashmina", "bergo", "khimar", "hijab-anak", "ciput-inner"],
  mukena: ["mukena-dewasa", "mukena-anak"],
};

const hargaFinal = sql<number>`coalesce(${products.harga_diskon}, ${products.harga_dasar})`;

async function idsKategori(slug: string): Promise<number[]> {
  const virtual = GRUP_VIRTUAL[slug];
  const slugs = virtual ?? [slug];
  const found = await db
    .select({ id: categories.id, parent_id: categories.parent_id })
    .from(categories)
    .where(inArray(categories.slug, slugs));
  const ids = found.map((f) => f.id);
  // jika slug adalah kategori induk, ikutsertakan semua anaknya
  if (ids.length > 0) {
    const anak = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.parent_id, ids));
    ids.push(...anak.map((a) => a.id));
  }
  return ids;
}

export async function ambilProduk(opts: OpsiKatalog) {
  const { limit = 12, offset = 0 } = opts;
  const kondisi: ReturnType<typeof eq>[] = [eq(products.status, "aktif")];

  if (opts.kategoriSlug) {
    const ids = await idsKategori(opts.kategoriSlug);
    if (ids.length === 0) return { items: [], total: 0 };
    kondisi.push(inArray(products.category_id, ids) as ReturnType<typeof eq>);
  }
  if (opts.kategoriId) kondisi.push(eq(products.category_id, opts.kategoriId) as ReturnType<typeof eq>);
  if (opts.cari) kondisi.push(ilike(products.nama, `%${opts.cari}%`) as ReturnType<typeof eq>);
  if (opts.promo) kondisi.push(isNotNull(products.harga_diskon) as ReturnType<typeof eq>);
  if (opts.gender) kondisi.push(eq(products.gender, opts.gender) as ReturnType<typeof eq>);
  if (opts.hargaMin) kondisi.push(sql`${hargaFinal} >= ${opts.hargaMin}` as unknown as ReturnType<typeof eq>);
  if (opts.hargaMax) kondisi.push(sql`${hargaFinal} <= ${opts.hargaMax}` as unknown as ReturnType<typeof eq>);

  if (opts.ukuran?.length || opts.warna?.length) {
    const syaratVarian: ReturnType<typeof eq>[] = [];
    if (opts.ukuran?.length) syaratVarian.push(inArray(productVariants.ukuran, opts.ukuran) as ReturnType<typeof eq>);
    if (opts.warna?.length) syaratVarian.push(inArray(productVariants.warna, opts.warna) as ReturnType<typeof eq>);
    kondisi.push(
      exists(
        db
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(
            and(eq(productVariants.product_id, products.id), or(...syaratVarian))
          )
      ) as unknown as ReturnType<typeof eq>
    );
  }

  let urut = desc(products.created_at);
  if (opts.urut === "murah") urut = asc(hargaFinal);
  else if (opts.urut === "mahal") urut = desc(hargaFinal);
  else if (opts.urut === "terlaris") urut = desc(sql`${products.terlaris} desc, ${products.unggulan}`);
  else if (opts.urut === "rating") urut = desc(products.id); // dihitung setelah ambil data

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      nama: products.nama,
      harga_dasar: products.harga_dasar,
      harga_diskon: products.harga_diskon,
      terlaris: products.terlaris,
      unggulan: products.unggulan,
      created_at: products.created_at,
      category_id: products.category_id,
    })
    .from(products)
    .where(and(...kondisi))
    .orderBy(urut)
    .limit(opts.urut === "rating" ? 200 : limit)
    .offset(opts.urut === "rating" ? 0 : offset);

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return { items: [], total: 0 };

  const [gambarUtama, varianPertama, ratingRows, kategoriRows, totalRow] = await Promise.all([
    db
      .select({ product_id: productImages.product_id, gambar_url: productImages.gambar_url })
      .from(productImages)
      .where(inArray(productImages.product_id, ids)),
    db
      .select({
        product_id: productVariants.product_id,
        id: productVariants.id,
        warna: productVariants.warna,
        ukuran: productVariants.ukuran,
        harga: productVariants.harga,
        stok: productVariants.stok,
        berat_gram: productVariants.berat_gram,
      })
      .from(productVariants)
      .where(and(inArray(productVariants.product_id, ids), eq(productVariants.aktif, true)))
      .orderBy(productVariants.id),
    db
      .select({
        product_id: reviews.product_id,
        avg_rating: sql<number>`avg(${reviews.rating})::float`,
        jumlah: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(inArray(reviews.product_id, ids), eq(reviews.status, "tayang")))
      .groupBy(reviews.product_id),
    db.select({ id: categories.id, nama: categories.nama }).from(categories),
    db
      .select({ jumlah: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...kondisi)),
  ]);

  const gambarByProduk = new Map<number, string>();
  for (const g of gambarUtama) if (!gambarByProduk.has(g.product_id)) gambarByProduk.set(g.product_id, g.gambar_url);

  const varianByProduk = new Map<number, { id: number; warna: string; ukuran: string; harga: number; stok: number; berat_gram: number }>();
  for (const v of varianPertama) {
    const ada = varianByProduk.get(v.product_id);
    if (!ada || (ada.stok <= 0 && v.stok > 0)) varianByProduk.set(v.product_id, v);
  }

  const ratingByProduk = new Map<number, { avg: number; count: number }>();
  for (const r of ratingRows) ratingByProduk.set(r.product_id, { avg: r.avg_rating, count: r.jumlah });

  const namaKategori = new Map(kategoriRows.map((k) => [k.id, k.nama]));
  const BATAS_BARU = Date.now() - 21 * 24 * 3600 * 1000;

  let items = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nama: r.nama,
    gambar: gambarByProduk.get(r.id) ?? "",
    harga_dasar: r.harga_dasar,
    harga_diskon: r.harga_diskon,
    rating_avg: ratingByProduk.get(r.id)?.avg ?? 0,
    rating_count: ratingByProduk.get(r.id)?.count ?? 0,
    terlaris: r.terlaris,
    unggulan: r.unggulan,
    baru: r.created_at.getTime() > BATAS_BARU,
    kategori_nama: namaKategori.get(r.category_id) ?? "",
    first_variant: varianByProduk.get(r.id) ?? null,
  }));

  if (opts.urut === "rating") {
    items.sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count);
    items = items.slice(offset, offset + limit);
  }

  return { items, total: totalRow[0]?.jumlah ?? 0 };
}

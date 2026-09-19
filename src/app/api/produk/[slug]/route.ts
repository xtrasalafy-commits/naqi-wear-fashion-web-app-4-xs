import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productImages, productVariants, reviews, users, categories } from "@/db/schema";
import { eq, and, desc, sql, ne } from "drizzle-orm";
import { ambilProduk } from "@/lib/katalog";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prodRows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const prod = prodRows[0];
  if (!prod) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  const [gambar, varian, ulasanRows, ratingRow, kategoriRow, terkait] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.product_id, prod.id)).orderBy(productImages.urutan),
    db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.product_id, prod.id), eq(productVariants.aktif, true)))
      .orderBy(productVariants.warna, productVariants.id),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        judul: reviews.judul,
        komentar: reviews.komentar,
        gambar_url_json: reviews.gambar_url_json,
        terverifikasi: reviews.terverifikasi,
        created_at: reviews.created_at,
        nama: users.nama,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(and(eq(reviews.product_id, prod.id), eq(reviews.status, "tayang")))
      .orderBy(desc(reviews.created_at)),
    db
      .select({
        avg_rating: sql<number>`coalesce(avg(${reviews.rating})::float, 0)`,
        jumlah: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(eq(reviews.product_id, prod.id), eq(reviews.status, "tayang"))),
    db.select().from(categories).where(eq(categories.id, prod.category_id)).limit(1),
    ambilProduk({ kategoriId: prod.category_id, limit: 5 }),
  ]);

  return NextResponse.json({
    produk: prod,
    kategori: kategoriRow[0] ?? null,
    gambar,
    varian,
    ulasan: ulasanRows,
    rating_avg: ratingRow[0]?.avg_rating ?? 0,
    rating_count: ratingRow[0]?.jumlah ?? 0,
    terkait: terkait.items.filter((t) => t.id !== prod.id).slice(0, 4),
  });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { banners, categories, articles, reviews, users } from "@/db/schema";
import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm";
import { ambilProduk } from "@/lib/katalog";

export async function GET() {
  try {
    const hariIni = new Date().toISOString().slice(0, 10);
    const [bannerRows, kategoriInduk, artikelRows, testimoniRows, terlaris, terbaru] = await Promise.all([
      db
        .select()
        .from(banners)
        .where(and(eq(banners.aktif, true), lte(banners.mulai, hariIni), gte(banners.berakhir, hariIni)))
        .orderBy(banners.urutan),
      db
        .select()
        .from(categories)
        .where(sql`${categories.parent_id} is null`)
        .orderBy(categories.urutan),
      db.select().from(articles).orderBy(desc(articles.created_at)).limit(3),
      db
        .select({
          rating: reviews.rating,
          komentar: reviews.komentar,
          nama: users.nama,
          created_at: reviews.created_at,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.user_id, users.id))
        .where(eq(reviews.status, "tayang"))
        .orderBy(desc(reviews.rating), desc(reviews.created_at))
        .limit(3),
      ambilProduk({ urut: "terlaris", limit: 8 }),
      ambilProduk({ urut: "terbaru", limit: 4 }),
    ]);
    return NextResponse.json({
      banners: bannerRows,
      kategori: kategoriInduk,
      artikel: artikelRows,
      testimoni: testimoniRows,
      terlaris: terlaris.items,
      terbaru: terbaru.items,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Maaf, data belum tersedia. Silakan coba lagi nanti." }, { status: 500 });
  }
}

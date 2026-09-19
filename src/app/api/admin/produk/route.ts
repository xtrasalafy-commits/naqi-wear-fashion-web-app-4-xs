import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants, productImages, categories } from "@/db/schema";
import { eq, ilike, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const cari = new URL(req.url).searchParams.get("cari");
  const rows = await db
    .select({
      id: products.id,
      nama: products.nama,
      slug: products.slug,
      harga_dasar: products.harga_dasar,
      harga_diskon: products.harga_diskon,
      status: products.status,
      unggulan: products.unggulan,
      terlaris: products.terlaris,
      stok_total: sql<number>`(select coalesce(sum(${productVariants.stok}),0)::int from ${productVariants} where ${productVariants.product_id} = ${products.id})`,
      kategori: categories.nama,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .orderBy(desc(products.id));
  const hasil = cari ? rows.filter((r) => r.nama.toLowerCase().includes(cari.toLowerCase())) : rows;
  return NextResponse.json({ produk: hasil });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const nama = String(body?.nama ?? "").trim();
  if (!nama) return NextResponse.json({ error: "Nama produk wajib diisi." }, { status: 400 });

  let slug = slugify(nama);
  const cek = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (cek.length > 0) slug = `${slug}-${Date.now().toString(36)}`;

  const prod = (
    await db
      .insert(products)
      .values({
        category_id: Number(body?.category_id ?? 1),
        nama,
        slug,
        deskripsi: String(body?.deskripsi ?? ""),
        bahan: String(body?.bahan ?? ""),
        gender: String(body?.gender ?? "wanita"),
        harga_dasar: Number(body?.harga_dasar ?? 0),
        harga_diskon: body?.harga_diskon ? Number(body.harga_diskon) : null,
        berat_gram: Number(body?.berat_gram ?? 300),
        motif: String(body?.motif ?? "Polos"),
        badge_syari: String(body?.badge_syari ?? "Tidak Menerawang"),
        unggulan: Boolean(body?.unggulan),
        terlaris: Boolean(body?.terlaris),
      })
      .returning()
  )[0];

  const gambarUrl = String(body?.gambar_url ?? "");
  if (gambarUrl) {
    await db.insert(productImages).values({ product_id: prod.id, gambar_url: gambarUrl, alt_text: nama, urutan: 0, utama: true });
  }
  const varian = Array.isArray(body?.varian) ? body.varian : [];
  let i = 0;
  for (const v of varian) {
    i++;
    await db.insert(productVariants).values({
      product_id: prod.id,
      sku: `NQW-${String(prod.id).padStart(4, "0")}-${String(i).padStart(2, "0")}`,
      warna: String(v.warna ?? "Polos"),
      ukuran: String(v.ukuran ?? "All Size"),
      harga: Number(v.harga ?? body?.harga_diskon ?? body?.harga_dasar ?? 0),
      stok: Number(v.stok ?? 0),
      gambar_url: gambarUrl,
      berat_gram: Number(body?.berat_gram ?? 300),
    });
  }
  return NextResponse.json({ sukses: true, id: prod.id, slug: prod.slug });
}

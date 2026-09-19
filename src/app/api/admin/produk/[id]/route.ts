import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants, productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const prod = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!prod[0]) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  const varian = await db.select().from(productVariants).where(eq(productVariants.product_id, id)).orderBy(productVariants.id);
  const gambar = await db.select().from(productImages).where(eq(productImages.product_id, id)).orderBy(productImages.urutan);
  return NextResponse.json({ produk: prod[0], varian, gambar });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const body = await req.json().catch(() => null);

  const update: Record<string, unknown> = {};
  const bidang = ["nama", "deskripsi", "bahan", "gender", "motif", "badge_syari", "status", "category_id"];
  for (const b of bidang) if (body?.[b] !== undefined) update[b] = b === "category_id" ? Number(body[b]) : String(body[b]);
  for (const n of ["harga_dasar", "berat_gram"]) if (body?.[n] !== undefined) update[n] = Number(body[n]);
  if (body && "harga_diskon" in body) update.harga_diskon = body.harga_diskon ? Number(body.harga_diskon) : null;
  if (body?.unggulan !== undefined) update.unggulan = Boolean(body.unggulan);
  if (body?.terlaris !== undefined) update.terlaris = Boolean(body.terlaris);
  if (Object.keys(update).length > 0) await db.update(products).set(update).where(eq(products.id, id));

  if (Array.isArray(body?.varian)) {
    await db.delete(productVariants).where(eq(productVariants.product_id, id));
    let i = 0;
    for (const v of body.varian) {
      i++;
      await db.insert(productVariants).values({
        product_id: id,
        sku: String(v.sku ?? `NQW-${String(id).padStart(4, "0")}-${String(i).padStart(2, "0")}`),
        warna: String(v.warna ?? "Polos"),
        ukuran: String(v.ukuran ?? "All Size"),
        harga: Number(v.harga ?? 0),
        stok: Number(v.stok ?? 0),
        gambar_url: String(v.gambar_url ?? ""),
        berat_gram: Number(v.berat_gram ?? 300),
        aktif: v.aktif !== false,
      });
    }
  }
  if (body?.gambar_url) {
    await db.delete(productImages).where(eq(productImages.product_id, id));
    const urls: string[] = Array.isArray(body.gambar_url) ? body.gambar_url : [String(body.gambar_url)];
    let ur = 0;
    for (const u of urls.filter(Boolean)) {
      await db.insert(productImages).values({ product_id: id, gambar_url: u, alt_text: String(body?.nama ?? ""), urutan: ur, utama: ur === 0 });
      ur++;
    }
  }
  return NextResponse.json({ sukses: true });
}

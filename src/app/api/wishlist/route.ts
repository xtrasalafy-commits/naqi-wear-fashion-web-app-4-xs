import { NextResponse } from "next/server";
import { db } from "@/db";
import { wishlists, products, productImages, productVariants } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const hanyaId = new URL(req.url).searchParams.get("hanyaId") === "1";
  const rows = await db.select().from(wishlists).where(eq(wishlists.user_id, user.id));
  if (hanyaId) return NextResponse.json({ ids: rows.map((r) => r.product_id) });

  const ids = rows.map((r) => r.product_id);
  if (ids.length === 0) return NextResponse.json({ items: [] });
  const [prods, imgs, varian] = await Promise.all([
    db.select().from(products).where(inArray(products.id, ids)),
    db.select().from(productImages).where(inArray(productImages.product_id, ids)),
    db
      .select()
      .from(productVariants)
      .where(and(inArray(productVariants.product_id, ids), eq(productVariants.aktif, true)))
      .orderBy(productVariants.id),
  ]);
  const gambarMap = new Map<number, string>();
  for (const g of imgs) if (!gambarMap.has(g.product_id)) gambarMap.set(g.product_id, g.gambar_url);
  const varianMap = new Map<number, (typeof varian)[number]>();
  for (const v of varian) {
    const ada = varianMap.get(v.product_id);
    if (!ada || (ada.stok <= 0 && v.stok > 0)) varianMap.set(v.product_id, v);
  }
  return NextResponse.json({
    items: prods.map((p) => ({
      ...p,
      gambar: gambarMap.get(p.id) ?? "",
      first_variant: varianMap.get(p.id) ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const product_id = Number(body?.product_id);
  if (!product_id) return NextResponse.json({ error: "Produk tidak valid." }, { status: 400 });

  const ada = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.user_id, user.id), eq(wishlists.product_id, product_id)))
    .limit(1);

  let ditambahkan: boolean;
  if (ada.length > 0) {
    await db.delete(wishlists).where(eq(wishlists.id, ada[0].id));
    ditambahkan = false;
  } else {
    await db.insert(wishlists).values({ user_id: user.id, product_id });
    ditambahkan = true;
  }
  const sisa = await db.select({ product_id: wishlists.product_id }).from(wishlists).where(eq(wishlists.user_id, user.id));
  return NextResponse.json({ ditambahkan, ids: sisa.map((s) => s.product_id) });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders, orderItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu untuk menulis ulasan." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const product_id = Number(body?.product_id);
  const rating = Math.min(5, Math.max(1, Number(body?.rating ?? 5)));
  const judul = String(body?.judul ?? "").trim();
  const komentar = String(body?.komentar ?? "").trim();
  const gambar = Array.isArray(body?.gambar) ? body.gambar.slice(0, 3).map(String) : [];

  if (!product_id || !komentar) {
    return NextResponse.json({ error: "Mohon isi rating dan komentar ulasan." }, { status: 400 });
  }

  const pembelian = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.order_id, orders.id))
    .where(and(eq(orders.user_id, user.id), eq(orderItems.product_id, product_id), eq(orders.status_pesanan, "selesai")))
    .limit(1);

  await db.insert(reviews).values({
    user_id: user.id,
    product_id,
    order_id: pembelian[0]?.id ?? null,
    rating,
    judul,
    komentar,
    gambar_url_json: gambar,
    terverifikasi: pembelian.length > 0,
    status: "tayang",
  });
  return NextResponse.json({ sukses: true, pesan: "Terima kasih! Ulasan Anda sudah tayang." });
}

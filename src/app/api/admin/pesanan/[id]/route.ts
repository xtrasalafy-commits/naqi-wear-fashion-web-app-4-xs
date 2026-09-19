import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, productVariants, payments, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const id = Number((await params).id);
  const body = await _req.json().catch(() => null);
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const update: Record<string, unknown> = {};
  if (body?.status_pesanan) update.status_pesanan = String(body.status_pesanan);
  if (body?.resi !== undefined) update.resi = String(body.resi);
  if (body?.status_pembayaran) update.status_pembayaran = String(body.status_pembayaran);

  // Jika pesanan dibatalkan, kembalikan stok
  if (body?.status_pesanan === "dibatalkan" && order.status_pesanan !== "dibatalkan") {
    const items = await db.select().from(orderItems).where(eq(orderItems.order_id, id));
    for (const it of items) {
      if (it.variant_id) {
        await db
          .update(productVariants)
          .set({ stok: sql`${productVariants.stok} + ${it.qty}` })
          .where(eq(productVariants.id, it.variant_id));
      }
    }
    await db.update(payments).set({ status: "dibatalkan" }).where(eq(payments.order_id, id));
  }
  if (body?.status_pembayaran === "lunas") {
    await db
      .update(payments)
      .set({ status: "lunas", dibayar_pada: new Date() })
      .where(eq(payments.order_id, id));
  }

  await db.update(orders).set(update).where(eq(orders.id, id));
  await db.insert(notifications).values({
    user_id: order.user_id,
    tipe: "pesanan",
    judul: "Status pesanan diperbarui",
    pesan: `Pesanan ${order.nomor_pesanan} kini berstatus: ${String(body?.status_pesanan ?? order.status_pesanan)}.`,
  });
  return NextResponse.json({ sukses: true });
}

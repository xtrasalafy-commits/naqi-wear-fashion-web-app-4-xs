import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const rows = await db.select().from(orders).where(eq(orders.nomor_pesanan, nomor)).limit(1);
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (order.user_id !== user.id) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  if (order.status_pembayaran === "lunas") {
    return NextResponse.json({ sukses: true, pesan: "Pesanan sudah dibayar." });
  }

  await db
    .update(orders)
    .set({ status_pembayaran: "lunas", status_pesanan: "dibayar" })
    .where(eq(orders.id, order.id));
  await db
    .update(payments)
    .set({ status: "lunas", dibayar_pada: new Date(), id_transaksi: `TRX-${Date.now()}` })
    .where(eq(payments.order_id, order.id));
  await db.insert(notifications).values({
    user_id: user.id,
    tipe: "pembayaran",
    judul: "Pembayaran diterima",
    pesan: `Pembayaran pesanan ${nomor} sudah kami terima. Pesanan akan segera diproses.`,
  });
  return NextResponse.json({ sukses: true, pesan: "Pembayaran berhasil. Pesanan Anda sedang diproses." });
}

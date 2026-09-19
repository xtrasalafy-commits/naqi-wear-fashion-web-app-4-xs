import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, payments, returns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const rows = await db.select().from(orders).where(eq(orders.nomor_pesanan, nomor)).limit(1);
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (order.user_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Anda tidak berhak melihat pesanan ini." }, { status: 403 });
  }
  const [items, paymentRows, returRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.order_id, order.id)),
    db.select().from(payments).where(eq(payments.order_id, order.id)),
    db.select().from(returns).where(eq(returns.order_id, order.id)),
  ]);
  return NextResponse.json({ pesanan: { ...order, items, pembayaran: paymentRows[0] ?? null, retur: returRows[0] ?? null } });
}

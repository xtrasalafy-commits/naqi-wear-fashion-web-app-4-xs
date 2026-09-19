import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, returns, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  const rows = await db.select().from(orders).where(eq(orders.nomor_pesanan, nomor)).limit(1);
  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (order.user_id !== user.id) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  if (order.status_pesanan !== "selesai") {
    return NextResponse.json({ error: "Retur hanya bisa diajukan untuk pesanan yang sudah selesai." }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const alasan = String(body?.alasan ?? "").trim();
  if (alasan.length < 10) {
    return NextResponse.json({ error: "Mohon jelaskan alasan retur minimal 10 karakter." }, { status: 400 });
  }
  const foto = Array.isArray(body?.foto) ? body.foto.slice(0, 3).map(String) : [];

  await db.insert(returns).values({ order_id: order.id, user_id: user.id, alasan, foto_url_json: foto });
  await db.update(orders).set({ status_pesanan: "retur_diajukan" }).where(eq(orders.id, order.id));
  await db.insert(notifications).values({
    user_id: user.id,
    tipe: "retur",
    judul: "Retur diajukan",
    pesan: `Pengajuan retur untuk pesanan ${nomor} sedang kami tinjau.`,
  });
  return NextResponse.json({ sukses: true, pesan: "Pengajuan retur berhasil dikirim. Tim kami akan segera meninjau." });
}

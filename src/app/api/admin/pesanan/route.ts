import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Akses khusus admin." }, { status: 401 });
  const status = new URL(req.url).searchParams.get("status");
  const rows = await db
    .select({
      id: orders.id,
      nomor_pesanan: orders.nomor_pesanan,
      total: orders.total,
      kurir: orders.kurir,
      layanan: orders.layanan,
      resi: orders.resi,
      metode_bayar: orders.metode_bayar,
      status_pembayaran: orders.status_pembayaran,
      status_pesanan: orders.status_pesanan,
      catatan: orders.catatan,
      snapshot_alamat: orders.snapshot_alamat,
      created_at: orders.created_at,
      nama: users.nama,
      user_id: users.id,
    })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.user_id))
    .orderBy(desc(orders.created_at));
  const hasil = status ? rows.filter((r) => r.status_pesanan === status) : rows;
  return NextResponse.json({ pesanan: hasil });
}
